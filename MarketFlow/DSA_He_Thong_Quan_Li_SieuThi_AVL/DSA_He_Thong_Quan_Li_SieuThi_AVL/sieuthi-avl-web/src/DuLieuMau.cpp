// ============================================================================
// DuLieuMau.h - Nap du lieu mau de demo cay AVL (kich hoat cac phep quay)
// (Cai dat ham thanh vien cua lop QuanLyKho)
// Nguoi phu trach: A
// ============================================================================
#pragma once
#include <iostream>
#include <string>
#include "QuanLyKho.h"
using namespace std;

inline void QuanLyKho::napDuLieuMau() {
    if (!cay.rong()) {
        string xn = docChuoi("  Du lieu hien tai se bi xoa. Tiep tuc? (y/n): ");
        if (xn != "y" && xn != "Y") return;
    }
    cay.xoaHet();
    phieuXuats.clear();
    phieuNhaps.clear();
    phieuHuys.clear();

    struct Mau { const char* ma; const char* ten; double gia; int min; int sl; };
    // Chen THEO THU TU TANG DAN -> cay thuong bi lech -> kich hoat phep quay
    Mau ds[] = {
        {"SP001", "Gao ST25 5kg", 120000, 20, 100},
        {"SP002", "Duong tinh luyen 1kg", 25000, 30, 60},
        {"SP003", "Dau an Neptune 1L", 58000, 15, 12},
        {"SP004", "Nuoc mam Nam Ngu 500ml", 42000, 20, 45},
        {"SP005", "Mi goi Hao Hao (thung)", 110000, 10, 8},
        {"SP006", "Sua tuoi Vinamilk 1L", 32000, 25, 70},
        {"SP007", "Xa phong Lifebuoy", 18000, 15, 90},
        {"SP008", "Nuoc ngot Coca 1.5L", 24000, 30, 15},
        {"SP009", "Banh quy Cosy", 36000, 10, 50},
        {"SP010", "Ca phe G7 hop 18 goi", 52000, 12, 35},
    };
    cay.batLogQuay(true);
    int stt = 0;
    for (auto& m : ds) {
        MatHang sp(m.ma, m.ten, m.gia, m.min);
        ++stt;
        Date hsd;
        hsd.d = 31; hsd.m = 12; hsd.y = Date::homNay().y + 1;
        string viTri = string("KE-") + char('A' + stt % 4) + to_string(1 + stt % 3);
        sp.nhapKho(TonKho(string("L") + to_string(stt), m.sl, hsd, viTri));
        cay.insert(m.ma, sp);
    }
    cay.batLogQuay(false);
    // Them 1 lo da het han de demo canh bao han su dung
    MatHang* sua = cay.search("SP006");
    Date hetHan;
    hetHan.d = 1; hetHan.m = 1; hetHan.y = 2024;
    sua->nhapKho(TonKho("L-CU", 5, hetHan, "KE-Z9"));

    cout << "  Da nap 10 mat hang mau. Hay chon muc 'Xem cay AVL' de xem cay da duoc can bang.\n";
    cout << "  Cay: " << cay.kichThuoc() << " nut, chieu cao = " << cay.chieuCaoCay()
         << " \n";
    cay.inThongKeQuay();
    tuDongLuu();
}
