#pragma once
#include <string>
#include <vector>
#include "Date.h"
using namespace std;

// ---- PhieuXuatKho / ChiTietXuat ----
struct ChiTietXuat {
    string maSanPham, tenSanPham;
    int soLuong = 0;
    double donGia = 0;
    double thanhTien = 0;
};

class PhieuXuatKho {
public:
    string maPhieuXuat;
    Date ngayXuat;
    vector<ChiTietXuat> chiTiet;
    double tongTien = 0;  // tong gia tri hang xuat (tinh theo gia ban)

    double tinhTongTien() {
        tongTien = 0;
        for (auto& c : chiTiet) {
            c.thanhTien = c.soLuong * c.donGia;
            tongTien += c.thanhTien;
        }
        return tongTien;
    }
};

// ---- PhieuNhapKho ----
struct PhieuNhapKho {
    string maPhieuNhap;
    Date ngayNhap;
    string nhaCungCap;
    string maSanPham;
    string maLoHang;
    int soLuong = 0;
};

// ---- PhieuXuatHuy / ChiTietHuy: huy hang (het han...), TACH RIENG voi phieu xuat ban ----
struct ChiTietHuy {
    string maSanPham, tenSanPham, maLoHang;
    Date hanSuDung;
    int soLuong = 0;
    double donGia = 0;
    double thanhTien = 0;
};

class PhieuXuatHuy {
public:
    string maPhieuHuy;
    Date ngayHuy;
    string lyDo;
    vector<ChiTietHuy> chiTiet;
    double tongTien = 0;  // tong gia tri hang huy (tinh theo gia ban)

    double tinhTongTien() {
        tongTien = 0;
        for (auto& c : chiTiet) {
            c.thanhTien = c.soLuong * c.donGia;
            tongTien += c.thanhTien;
        }
        return tongTien;
    }
};