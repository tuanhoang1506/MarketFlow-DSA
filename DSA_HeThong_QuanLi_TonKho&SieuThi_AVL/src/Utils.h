#pragma once
#include <cctype>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <string>
#include "Date.h"
#ifdef _WIN32
#include <conio.h>
#else
#include <termios.h>
#include <unistd.h>
#endif
using namespace std;

static string trim(const string& s) {
    size_t a = s.find_first_not_of(" \t\r\n");
    if (a == string::npos) return "";
    size_t b = s.find_last_not_of(" \t\r\n");
    return s.substr(a, b - a + 1);
}
static string inHoa(string s) {
    for (char& c : s) c = (char)toupper((unsigned char)c);
    return s;
}
static string inThuong(string s) {
    for (char& c : s) c = (char)tolower((unsigned char)c);
    return s;
}
static string dinhDangTien(double v) {
    long long x = (long long)(v + 0.5);
    string s = to_string(x), r;
    int dem = 0;
    for (int i = (int)s.size() - 1; i >= 0; i--) {
        r.insert(r.begin(), s[i]);
        if (++dem % 3 == 0 && i > 0) r.insert(r.begin(), '.');
    }
    return r + " d";
}

// ---- Xoa man hinh / tam dung ----
static void xoaManHinh() {
#ifdef _WIN32
    system("cls");
#else
    system("clear");
#endif
}

// ---- Ham nhap lieu an toan ----
static string docDong(const string& nhac) {
    cout << nhac;
    string s;
    if (!getline(cin, s)) {
        cout << "\n(het du lieu nhap, thoat chuong trinh)\n";
        exit(0);
    }
    return trim(s);
}
static void tamDung() {
    docDong("\nNhan Enter de quay lai menu...");
}
static string docChuoi(const string& nhac, bool choPhepRong = false) {
    while (true) {
        string s = docDong(nhac);
        if (!s.empty() || choPhepRong) return s;
        cout << "  Khong duoc de trong!\n";
    }
}
static int docSo(const string& nhac, int lo, int hi) {
    while (true) {
        string s = docDong(nhac);
        try {
            size_t p;
            int v = stoi(s, &p);
            if (p == s.size() && v >= lo && v <= hi) return v;
        } catch (...) {}
        cout << "  Nhap sai! Hay nhap so nguyen trong [" << lo << ", " << hi << "]\n";
    }
}
static double docThuc(const string& nhac, double lo) {
    while (true) {
        string s = docDong(nhac);
        try {
            size_t p;
            double v = stod(s, &p);
            if (p == s.size() && v >= lo) return v;
        } catch (...) {}
        cout << "  Nhap sai! Hay nhap so >= " << lo << "\n";
    }
}
static Date docNgay(const string& nhac) {
    while (true) {
        string s = docDong(nhac);
        int d, m, y;
        char thua;
        if (sscanf(s.c_str(), "%d/%d/%d%c", &d, &m, &y, &thua) == 3 && Date::hopLe(d, m, y)) {
            Date r;
            r.d = d; r.m = m; r.y = y;
            return r;
        }
        cout << "  Ngay khong hop le! Dinh dang dd/mm/yyyy\n";
    }
}

// Nhap mat khau an ky tu (hien dau * tren Windows, khong hien gi tren Linux/macOS)
static string docMatKhau(const string& nhac) {
    cout << nhac << flush;
    string s;
#ifdef _WIN32
    int ch;
    while ((ch = _getch()) != '\r' && ch != '\n') {
        if (ch == 8) {
            if (!s.empty()) { s.pop_back(); cout << "\b \b"; }
        } else if (ch >= 32 && ch < 127) {
            s += (char)ch;
            cout << '*';
        }
    }
    cout << "\n";
#else
    termios cu, moi;
    bool coTerm = (tcgetattr(STDIN_FILENO, &cu) == 0);
    if (coTerm) {
        moi = cu;
        moi.c_lflag &= ~ECHO;
        tcsetattr(STDIN_FILENO, TCSANOW, &moi);
    }
    bool ok = (bool)getline(cin, s);
    if (coTerm) {
        tcsetattr(STDIN_FILENO, TCSANOW, &cu);
        cout << "\n";
    }
    if (!ok) {
        cout << "\n(het du lieu nhap, thoat chuong trinh)\n";
        exit(0);
    }
    s = trim(s);
#endif
    return s;
}