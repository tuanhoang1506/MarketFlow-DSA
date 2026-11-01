// ============================================================================
// AVLTree.h - Node va cayVL (cay can bang AVL, khoa = ma mat hang)
// Ky thuat: phep quay LL/RR/LR/RL, balance factor, range search
// Nguoi phu trach: A
// ============================================================================
#pragma once
#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
#include "MatHang.h"
using namespace std;

struct Node {
    string key;      // ma mat hang / ma vach
    MatHang data;
    int height = 1;
    Node* left = nullptr;
    Node* right = nullptr;
    Node(const string& k, const MatHang& d) : key(k), data(d) {}
};

class cayVL {
private:
    Node* root = nullptr;
    int soNut = 0;

    // thong ke cac phep quay 
    int demLL = 0, demRR = 0, demLR = 0, demRL = 0;
    bool ghiLog = false;  // true: in ra tung phep quay khi chen

    static int chieuCao(Node* n) { return n ? n->height : 0; }
    static void capNhatChieuCao(Node* n) {
        n->height = 1 + max(chieuCao(n->left), chieuCao(n->right));
    }
    // balance factor = h(trai) - h(phai)
    static int balanceFactor(Node* n) {
        return n ? chieuCao(n->left) - chieuCao(n->right) : 0;
    }

    //       y                x
    //      / \              / \.
    //     x   C    --->    A   y
    //    / \                  / \.
    //   A   B                B   C
    Node* rotateRight(Node* y) {
        Node* x = y->left;
        Node* B = x->right;
        x->right = y;
        y->left = B;
        capNhatChieuCao(y);
        capNhatChieuCao(x);
        return x;
    }
    Node* rotateLeft(Node* x) {
        Node* y = x->right;
        Node* B = y->left;
        y->left = x;
        x->right = B;
        capNhatChieuCao(x);
        capNhatChieuCao(y);
        return y;
    }

    // Can bang lai nut n (dung sau khi chen / xoa)
    Node* canBang(Node* n) {
        capNhatChieuCao(n);
        int bf = balanceFactor(n);
        if (bf > 1) {  // lech trai
            if (balanceFactor(n->left) < 0) {  // LR
                n->left = rotateLeft(n->left);
                demLR++;
                if (ghiLog) cout << "    [quay LR tai nut " << n->key << "]\n";
            } else {
                demLL++;  // LL
                if (ghiLog) cout << "    [quay LL tai nut " << n->key << "]\n";
            }
            return rotateRight(n);
        }
        if (bf < -1) {  // lech phai
            if (balanceFactor(n->right) > 0) {  // RL
                n->right = rotateRight(n->right);
                demRL++;
                if (ghiLog) cout << "    [quay RL tai nut " << n->key << "]\n";
            } else {
                demRR++;  // RR
                if (ghiLog) cout << "    [quay RR tai nut " << n->key << "]\n";
            }
            return rotateLeft(n);
        }
        return n;
    }

    Node* insert(Node* n, const string& key, const MatHang& data, bool& ok) {
        if (!n) {
            soNut++;
            ok = true;
            return new Node(key, data);
        }
        if (key < n->key) n->left = insert(n->left, key, data, ok);
        else if (key > n->key) n->right = insert(n->right, key, data, ok);
        else { ok = false; return n; }  // trung khoa
        return canBang(n);
    }

    static Node* nutNhoNhat(Node* n) {
        while (n->left) n = n->left;
        return n;
    }

    Node* remove(Node* n, const string& key, bool& ok) {
        if (!n) { ok = false; return nullptr; }
        if (key < n->key) n->left = remove(n->left, key, ok);
        else if (key > n->key) n->right = remove(n->right, key, ok);
        else {
            ok = true;
            if (!n->left || !n->right) {
                Node* con = n->left ? n->left : n->right;
                delete n;
                soNut--;
                return con;  // co the la nullptr
            }
            // 2 con: thay bang nut ke nhiem (nho nhat ben phai)
            Node* s = nutNhoNhat(n->right);
            string kS = s->key;
            n->key = s->key;
            n->data = s->data;
            bool tam;
            n->right = remove(n->right, kS, tam);
            // (lan goi de quy tren da giam soNut 1 don vi - dung 1 nut bi xoa that su)
        }
        return canBang(n);
    }

    void rangeSearch(Node* n, const string& low, const string& high,
                     vector<MatHang*>& kq) {
        if (!n) return;
        if (low < n->key) rangeSearch(n->left, low, high, kq);   // cat nhanh
        if (low <= n->key && n->key <= high) kq.push_back(&n->data);
        if (high > n->key) rangeSearch(n->right, low, high, kq); // cat nhanh
    }
    void duyetLNR(Node* n, vector<MatHang*>& kq) {
        if (!n) return;
        duyetLNR(n->left, kq);
        kq.push_back(&n->data);
        duyetLNR(n->right, kq);
    }
    // Duyet theo tung tang (BFS): cha luon dung truoc con
    void duyetTheoTang(vector<const MatHang*>& kq) const {
        if (!root) return;
        queue<Node*> hang;
        hang.push(root);
        while (!hang.empty()) {
            Node* n = hang.front();
            hang.pop();
            kq.push_back(&n->data);
            if (n->left) hang.push(n->left);
            if (n->right) hang.push(n->right);
        }
    }
    void huy(Node* n) {
        if (!n) return;
        huy(n->left);
        huy(n->right);
        delete n;
    }
    void inCay(Node* n, int sau) const {
        if (!n) return;
        inCay(n->right, sau + 1);
        cout << string(sau * 7, ' ') << n->key << " (h=" << n->height
             << ", bf=" << balanceFactor(n) << ")\n";
        inCay(n->left, sau + 1);
    }

    // ---- Ve cay theo chieu doc (goc o tren) ----
    static int doDaiKhoaMax(Node* n) {
        if (!n) return 0;
        return max((int)n->key.size(), max(doDaiKhoaMax(n->left), doDaiKhoaMax(n->right)));
    }
    // tra ve cot tam cua nut; idx = so thu tu theo LNR (quyet dinh vi tri ngang)
    int veDoc(Node* n, int depth, int& idx, int W, vector<string>& cv) const {
        if (!n) return -1;
        int cl = veDoc(n->left, depth + 1, idx, W, cv);
        int c = idx * W + W / 2;
        idx++;
        int cr = veDoc(n->right, depth + 1, idx, W, cv);
        int bat = c - (int)n->key.size() / 2;
        if (bat < 0) bat = 0;
        cv[2 * depth].replace(bat, n->key.size(), n->key);
        if (cl >= 0 || cr >= 0) {
            string& r = cv[2 * depth + 1];
            int a = cl >= 0 ? cl : c, b = cr >= 0 ? cr : c;
            for (int x = a; x <= b; x++) r[x] = '-';
            if (cl >= 0) r[cl] = '+';
            if (cr >= 0) r[cr] = '+';
            r[c] = '+';
        }
        return c;
    }
    void lietKeBF(Node* n, int& dem) const {
        if (!n) return;
        lietKeBF(n->left, dem);
        cout << (dem % 3 == 0 ? "\n  " : "   ") << n->key << " (h=" << n->height
             << ", bf=" << balanceFactor(n) << ")";
        dem++;
        lietKeBF(n->right, dem);
    }
    // tra ve chieu cao that; ghi moi vi pham vao 'loi'
    int kiemTra(Node* n, const string* lo, const string* hi, string& loi) const {
        if (!n) return 0;
        if ((lo && n->key <= *lo) || (hi && n->key >= *hi))
            loi += "  - " + n->key + ": sai thu tu BST\n";
        int hl = kiemTra(n->left, lo, &n->key, loi);
        int hr = kiemTra(n->right, &n->key, hi, loi);
        int h = 1 + max(hl, hr);
        if (abs(hl - hr) > 1) loi += "  - " + n->key + ": |bf| > 1\n";
        if (n->height != h) loi += "  - " + n->key + ": chieu cao luu sai\n";
        return h;
    }

public:
    cayVL() = default;
    cayVL(const cayVL&) = delete;
    cayVL& operator=(const cayVL&) = delete;
    ~cayVL() { huy(root); }

    bool insert(const string& key, const MatHang& data) {
        bool ok = false;
        root = insert(root, key, data, ok);
        return ok;
    }
    bool remove(const string& key) {
        bool ok = false;
        root = remove(root, key, ok);
        return ok;
    }
    MatHang* search(const string& key) {
        Node* n = root;
        while (n) {
            if (key == n->key) return &n->data;
            n = (key < n->key) ? n->left : n->right;
        }
        return nullptr;
    }
    vector<MatHang*> rangeSearch(const string& low, const string& high) {
        vector<MatHang*> kq;
        rangeSearch(root, low, high, kq);
        return kq;
    }
    vector<MatHang*> duyetTheoThuTu() {
        vector<MatHang*> kq;
        duyetLNR(root, kq);
        return kq;
    }
    vector<const MatHang*> duyetTheoTang() const {
        vector<const MatHang*> kq;
        duyetTheoTang(kq);
        return kq;
    }
    void xoaHet() {
        huy(root);
        root = nullptr;
        soNut = 0;
        demLL = demRR = demLR = demRL = 0;
    }
    int kichThuoc() const { return soNut; }
    int chieuCaoCay() const { return chieuCao(root); }
    bool rong() const { return root == nullptr; }

    void inCayNgang() const {
        if (!root) { cout << "  (cay rong)\n"; return; }
        cout << "  (nhanh phai o tren, nhanh trai o duoi; h = chieu cao, bf = balance factor)\n";
        inCay(root, 0);
    }
    void inThongKeQuay() const {
        cout << "  So phep quay da thuc hien: LL=" << demLL << ", RR=" << demRR
             << ", LR=" << demLR << ", RL=" << demRL << "\n";
    }
    void batLogQuay(bool b) { ghiLog = b; }

    // In cay theo chieu doc (goc o tren) + bang h/bf cua tung nut.
    // Cay lon (> 12 nut) se bi tran man hinh nen quay ve kieu ngang.
    void inCayDoc() const {
        if (!root) { cout << "  (cay rong)\n"; return; }
        if (soNut > 12) {
            cout << "  (cay co hon 12 nut, hien theo chieu ngang)\n";
            inCayNgang();
            return;
        }
        int W = doDaiKhoaMax(root) + 1;
        vector<string> cv(2 * chieuCao(root) - 1, string((soNut + 1) * W, ' '));
        int idx = 0;
        veDoc(root, 0, idx, W, cv);
        for (const string& dong : cv) {
            size_t e = dong.find_last_not_of(' ');
            cout << "  " << (e == string::npos ? "" : dong.substr(0, e + 1)) << "\n";
        }
        cout << "\n  Chieu cao (h) va balance factor (bf = h trai - h phai) tung nut:";
        int dem = 0;
        lietKeBF(root, dem);
        cout << "\n";
    }
    // true neu cay thoa BST + chieu cao luu dung + moi nut |bf| <= 1
    bool kiemTraAVL(string& loi) const {
        loi.clear();
        kiemTra(root, nullptr, nullptr, loi);
        return loi.empty();
    }
};
