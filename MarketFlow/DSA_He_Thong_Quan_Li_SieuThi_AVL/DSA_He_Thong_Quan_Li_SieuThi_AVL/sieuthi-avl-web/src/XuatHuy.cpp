// ============================================================================
// XuatHuy.h - Huy hang het han, lap PHIEU XUAT HUY (tach rieng voi phieu xuat ban)
//             va thong ke hang huy
// (Cai dat cac ham thanh vien cua lop QuanLyKho)
// Nguoi phu trach: A
// ============================================================================
#pragma once
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
#include "QuanLyKho.h"
using namespace std;

// Huy toan bo cac lo da het han: xoa khoi kho + lap phieu xuat huy (PHxxxx)
inline void QuanLyKho::huyHangHetHan() {
    cout << "\n--- HUY HANG HET HAN (lap phieu xuat huy) ---\n";
    double giaTri = 0;
    int soLo = 0;
    for (auto* sp : cay.duyetTheoThuTu())
        for (const auto& l : sp->getCacLo())
            if (!l.kiemTraHanSD()) {
                soLo++;
                giaTri += l.getSoLuongTon() * sp->getGiaBan();
                cout << "  " << sp->getMaSanPham() << " - " << sp->getTenSanPham() << ": lo "
                     << l.getMaLoHang() << ", SL=" << l.getSoLuongTon()
                     << ", HSD=" << l.getHanSuDung().str() << "\n";
            }
    if (soLo == 0) { cout << "  Khong co lo hang het han.\n"; return; }
    cout << "  => " << soLo << " lo het han, gia tri " << dinhDangTien(giaTri) << "\n";

    string xn = docChuoi("\n  Huy TOAN BO lo het han o tren? (y/n): ");
    if (xn != "y" && xn != "Y") { cout << "  Da huy thao tac.\n"; return; }

    PhieuXuatHuy ph;
    ph.maPhieuHuy = taoMa("PH", phieuHuys.size() + 1);
    ph.ngayHuy = Date::homNay();
    ph.lyDo = "Het han su dung";
    for (auto* sp : cay.duyetTheoThuTu()) {
        vector<TonKho> daHuy;
        sp->huyLoHetHan(daHuy);  // xoa lo het han khoi mat hang
        for (const auto& l : daHuy) {
            ChiTietHuy c;
            c.maSanPham = sp->getMaSanPham();
            c.tenSanPham = sp->getTenSanPham();
            c.maLoHang = l.getMaLoHang();
            c.hanSuDung = l.getHanSuDung();
            c.soLuong = l.getSoLuongTon();
            c.donGia = sp->getGiaBan();
            ph.chiTiet.push_back(c);
        }
    }
    ph.tinhTongTien();

    if (ph.chiTiet.empty()) {
        cout << "  Cac lo het han khong con hang ton, da don khoi kho (khong lap phieu).\n";
    } else {
        cout << "\n  ===== PHIEU XUAT HUY " << ph.maPhieuHuy << " - " << ph.ngayHuy.str() << " =====\n";
        cout << "  Ly do: " << ph.lyDo << "\n";
        for (const auto& c : ph.chiTiet)
            cout << "  " << left << setw(8) << c.maSanPham << setw(22) << c.tenSanPham.substr(0, 21)
                 << setw(8) << c.maLoHang << right << setw(5) << c.soLuong << " x " << setw(9)
                 << (long long)c.donGia << " = " << setw(10) << (long long)c.thanhTien << "\n";
        cout << "  TONG GIA TRI HUY: " << dinhDangTien(ph.tongTien) << "\n";
        phieuHuys.push_back(ph);
        cout << "  Da huy hang het han va lap phieu " << ph.maPhieuHuy << "\n";
    }
    tuDongLuu();
}

// Thong ke hang huy: liet ke cac phieu xuat huy + tong gia tri
inline void QuanLyKho::inThongKeHuy() {
    cout << "\n--- THONG KE HANG HUY (phieu xuat huy) ---\n";
    if (phieuHuys.empty()) { cout << "  Chua co phieu xuat huy nao.\n"; return; }
    double tong = 0;
    long long tongSL = 0;
    for (const auto& h : phieuHuys) {
        cout << "  " << h.maPhieuHuy << " - " << h.ngayHuy.str() << " - " << h.lyDo << ":\n";
        for (const auto& c : h.chiTiet) {
            cout << "     " << c.maSanPham << " - " << c.tenSanPham << ", lo " << c.maLoHang
                 << ", SL=" << c.soLuong << ", " << dinhDangTien(c.thanhTien) << "\n";
            tongSL += c.soLuong;
        }
        tong += h.tongTien;
    }
    cout << "  So phieu huy        : " << phieuHuys.size() << "\n"
         << "  Tong so luong huy   : " << tongSL << "\n"
         << "  TONG GIA TRI HUY    : " << dinhDangTien(tong) << "\n";
}
