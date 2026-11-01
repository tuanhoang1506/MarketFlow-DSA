#pragma once
#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
#include "QuanLyKho.h"
using namespace std;

// ------------------ Canh bao ton kho ------------------
inline void QuanLyKho::canhBaoTonKho() {
    cout << "\n--- CANH BAO TON KHO ---\n";
    vector<MatHang*> sapHet;
    for (auto* sp : cay.duyetTheoThuTu())
        if (sp->kiemTraCanCanhBao()) sapHet.push_back(sp);
    cout << "Cac mat hang dat/duoi muc ton toi thieu:\n";
    inDanhSach(sapHet);

    cout << "\nCac lo hang da het han con ton trong kho:\n";
    bool co = false;
    for (auto* sp : cay.duyetTheoThuTu())
        for (const auto& l : sp->getCacLo())
            if (!l.kiemTraHanSD() && l.getSoLuongTon() > 0) {
                co = true;
                cout << "  " << sp->getMaSanPham() << " - " << sp->getTenSanPham() << ": lo "
                     << l.getMaLoHang() << ", SL=" << l.getSoLuongTon()
                     << ", HSD=" << l.getHanSuDung().str() << "\n";
            }
    if (!co) cout << "  (khong co)\n";
}

// ------------------ Thong ke doanh thu (tu cac phieu xuat) ------------------
inline void QuanLyKho::thongKeDoanhThu() {
    cout << "\n--- THONG KE DOANH THU / XUAT KHO / HANG HUY ---\n";
    cout << "  1. Tong gia tri xuat kho (doanh thu, khong gom hang huy)\n  2. Theo ngay\n"
         << "  3. Theo thang\n  4. Mat hang xuat nhieu nhat\n  5. Hang huy (phieu xuat huy)\n";
    int c = docSo("Chon: ", 1, 5);
    if (c == 5) { inThongKeHuy(); return; }
    if (phieuXuats.empty()) { cout << "  Chua co phieu xuat kho nao.\n"; return; }
    if (c == 1) {
        double tong = 0;
        for (const auto& h : phieuXuats) tong += h.tongTien;
        cout << "  So phieu xuat: " << phieuXuats.size() << "\n  Tong gia tri xuat: "
             << dinhDangTien(tong) << "\n";
    } else if (c == 2) {
        Date d = docNgay("Ngay (dd/mm/yyyy): ");
        double tong = 0; int dem = 0;
        for (const auto& h : phieuXuats)
            if (h.ngayXuat.key() == d.key()) { tong += h.tongTien; dem++; }
        cout << "  " << dem << " phieu xuat, gia tri " << dinhDangTien(tong) << "\n";
    } else if (c == 3) {
        int m = docSo("Thang (1-12): ", 1, 12);
        int y = docSo("Nam: ", 1900, 2200);
        double tong = 0; int dem = 0;
        for (const auto& h : phieuXuats)
            if (h.ngayXuat.m == m && h.ngayXuat.y == y) { tong += h.tongTien; dem++; }
        cout << "  " << dem << " phieu xuat, gia tri " << dinhDangTien(tong) << "\n";
    } else {
        map<string, pair<int, double> > bh;  // ma -> (so luong, gia tri)
        map<string, string> ten;
        for (const auto& h : phieuXuats)
            for (const auto& ct : h.chiTiet) {
                bh[ct.maSanPham].first += ct.soLuong;
                bh[ct.maSanPham].second += ct.thanhTien;
                ten[ct.maSanPham] = ct.tenSanPham;
            }
        typedef pair<string, pair<int, double> > XuatNhieu;
        vector<XuatNhieu> v(bh.begin(), bh.end());
        sort(v.begin(), v.end(), [](const XuatNhieu& a, const XuatNhieu& b) {
            return a.second.first > b.second.first;
        });
        cout << "  Top mat hang xuat nhieu nhat:\n";
        int top = 0;
        for (const XuatNhieu& e : v) {
            cout << "  " << ++top << ". " << e.first << " - " << ten[e.first]
                 << ": " << e.second.first << " cai, " << dinhDangTien(e.second.second) << "\n";
            if (top == 5) break;
        }
    }
}
