#pragma once
#include <iomanip>
#include <iostream>
#include <vector>
#include "QuanLyKho.h"
using namespace std;

// Cac ham tinh toan tach rieng (khong in) de tai su dung
inline double QuanLyKho::tinhTongGiaTriTonKho() {
    double tong = 0;
    for (auto* sp : cay.duyetTheoThuTu()) tong += sp->tinhGiaTriTon();
    return tong;
}
inline double QuanLyKho::tinhTongGiaTriHetHan() {
    double tong = 0;
    for (auto* sp : cay.duyetTheoThuTu()) tong += sp->giaTriHetHan();
    return tong;
}
inline long long QuanLyKho::tinhTongSoLuongTon() {
    long long tong = 0;
    for (auto* sp : cay.duyetTheoThuTu()) tong += sp->tongTon();
    return tong;
}

inline void QuanLyKho::inTongGiaTriTonKho() {
    cout << "\n--- TONG GIA TRI TON KHO ---\n";
    vector<MatHang*> ds = cay.duyetTheoThuTu();
    if (ds.empty()) { cout << "  Kho dang rong.\n"; return; }
    cout << left << setw(8) << "Ma" << setw(26) << "Ten mat hang"
         << right << setw(8) << "Ton" << setw(12) << "Gia ban" << setw(16) << "Gia tri ton" << "\n";
    cout << string(70, '-') << "\n";
    for (auto* sp : ds) {
        cout << left << setw(8) << sp->getMaSanPham() << setw(26) << sp->getTenSanPham().substr(0, 25)
             << right << setw(8) << sp->tongTon() << setw(12) << (long long)sp->getGiaBan()
             << setw(16) << (long long)sp->tinhGiaTriTon() << "\n";
    }
    cout << string(70, '-') << "\n";
    double hetHan = tinhTongGiaTriHetHan();
    cout << "  So mat hang          : " << ds.size() << "\n";
    cout << "  Tong so luong ton    : " << tinhTongSoLuongTon() << "\n";
    cout << "  TONG GIA TRI TON KHO : " << dinhDangTien(tinhTongGiaTriTonKho())
         << "  (tinh theo gia ban)\n";
    if (hetHan > 0)
        cout << "  Trong do hang het han: " << dinhDangTien(hetHan) << "\n";
}
