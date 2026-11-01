// ============================================================================
// TaiKhoan.h - Dang nhap: 2 che do KHACH (chi xem) va ADMIN (day du quyen)
//     (chua phat trien dang nhap cho nhan vien)
//     Tai khoan luu trong taikhoan.xlsx: 2 cot "Ten tai khoan" | "Mat khau"
//     Tai khoan admin mac dinh lan dau chay: admin / admin123
// Nguoi phu trach: Vo Nguyen Sarol
// ============================================================================
#pragma once
#include <iostream>
#include <string>
#include <vector>
#include "Excel.h"
#include "Utils.h"
using namespace std;

class TaiKhoanAdmin {
private:
    const string TEN_FILE = "taikhoan.xlsx";
    const string TEN_DANG_NHAP = "admin";
    string matKhau = "admin123";

    bool luu() const {
        vector<vector<string> > d;
        vector<string> h, r;
        h.push_back("Ten tai khoan"); h.push_back("Mat khau");
        r.push_back(TEN_DANG_NHAP); r.push_back(matKhau);
        d.push_back(h); d.push_back(r);
        return ghiXlsx(TEN_FILE, "taikhoan", vector<int>{22, 24}, vector<int>{0, 2}, d);
    }
    // 1 = doc duoc, 0 = chua co file, -1 = file loi
    int doc() {
        vector<vector<string> > luoi;
        int kq = docXlsx(TEN_FILE, luoi);
        if (kq != 1) return kq;
        for (const auto& hang : luoi) {
            if (hang.size() >= 2 && inThuong(trim(hang[0])) == TEN_DANG_NHAP && !trim(hang[1]).empty()) {
                matKhau = trim(hang[1]);
                return 1;
            }
        }
        return -1;
    }

public:
    // Doc file; neu chua co thi tao tai khoan admin mac dinh (admin / admin123)
    void khoiDong() {
        int kq = doc();
        if (kq == 0) {
            luu();
        } else if (kq < 0) {
            cout << "[!] Khong doc duoc " << TEN_FILE << " (file loi?). Tam dung mat khau mac dinh admin123,\n"
                 << "    file se KHONG bi ghi de. Hay sua/xoa file roi chay lai.\n";
        }
    }

    // true neu dang nhap dung (toi da 3 lan thu)
    bool dangNhap() {
        for (int lan = 1; lan <= 3; lan++) {
            string u = docChuoi("Ten dang nhap: ");
            string p = docMatKhau("Mat khau: ");
            if (inThuong(u) == TEN_DANG_NHAP && p == matKhau) {
                cout << "  Dang nhap thanh cong! Xin chao admin.\n";
                return true;
            }
            cout << "  Sai ten dang nhap hoac mat khau! (lan " << lan << "/3)\n";
        }
        cout << "  Sai qua 3 lan, quay lai man hinh dau.\n";
        return false;
    }

    void doiMatKhau() {
        cout << "\n--- DOI MAT KHAU ADMIN ---\n";
        string cu = docMatKhau("  Mat khau hien tai: ");
        if (cu != matKhau) {
            cout << "  Mat khau hien tai khong dung!\n";
            return;
        }
        string moi;
        while (true) {
            string a = docMatKhau("  Mat khau moi (>= 6 ky tu): ");
            if (a.size() < 6) { cout << "  Mat khau qua ngan!\n"; continue; }
            string b = docMatKhau("  Nhap lai mat khau: ");
            if (a != b) { cout << "  Hai lan nhap khong khop!\n"; continue; }
            moi = a;
            break;
        }
        string cuTam = matKhau;
        matKhau = moi;
        if (luu()) cout << "  Da doi mat khau.\n";
        else {
            matKhau = cuTam;
            cout << "  [!] Khong ghi duoc file " << TEN_FILE << " (dang mo trong Excel/WPS?). Chua doi mat khau.\n";
        }
    }
};
