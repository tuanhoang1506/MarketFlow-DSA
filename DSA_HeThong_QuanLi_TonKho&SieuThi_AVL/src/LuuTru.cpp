// ============================================================================
// LuuTru.h - Khoi dong, tu dong luu, xuat Excel, ghi/doc file kho.dat
// (Cai dat cac ham thanh vien cua lop QuanLyKho)
// Nguoi phu trach: Vo Nguyen Sarol
// ============================================================================
#pragma once
#include <iostream>
#include <string>
#include <vector>
#include "Excel.h"
#include "FileIO.h"
#include "QuanLyKho.h"
using namespace std;

inline void QuanLyKho::khoiDong() {
    if (QuanLyFileNhiPhan::docFileNhiPhan(TEN_FILE, cay, phieuXuats, phieuNhaps))
        cout << "Da doc " << cay.kichThuoc() << " mat hang, " << phieuXuats.size()
             << " phieu xuat tu file " << TEN_FILE << "\n";
    else
        cout << "Chua co du lieu (hoac file loi). Bat dau voi kho rong.\n";
    xuatExcel();  // tao/cap nhat kho.xlsx ngay khi mo chuong trinh
}

// Buoc 9 trong Sequence Diagram: tu dong ghi file sau moi thay doi
inline void QuanLyKho::tuDongLuu() {
    if (!QuanLyFileNhiPhan::ghiFileNhiPhan(TEN_FILE, cay, phieuXuats, phieuNhaps))
        cout << "  [!] Canh bao: khong ghi duoc file " << TEN_FILE << "\n";
    if (!xuatExcel())
        cout << "  [!] Canh bao: khong ghi duoc file " << TEN_EXCEL
             << " (dang mo trong Excel? hay dong lai)\n";
}

// Xuat toan bo ton kho ra Excel: moi dong = 1 lo hang cua 1 mat hang
inline bool QuanLyKho::xuatExcel() {
    vector<vector<string> > d;
    vector<string> h;
    const char* tieuDe[] = {"Ma mat hang", "Ten mat hang", "Gia ban", "Ton toi thieu", "Tong ton",
                            "Ma lo", "SL lo", "Han su dung", "Vi tri kho", "Trang thai lo", "Gia tri ton (lo)"};
    for (const char* t : tieuDe) h.push_back(t);
    d.push_back(h);
    for (MatHang* sp : cay.duyetTheoThuTu()) {
        vector<string> dau;
        dau.push_back(sp->getMaSanPham());
        dau.push_back(sp->getTenSanPham());
        dau.push_back(to_string((long long)sp->getGiaBan()));
        dau.push_back(to_string(sp->getMucTonToiThieu()));
        dau.push_back(to_string(sp->tongTon()));
        if (sp->getCacLo().empty()) {
            dau.resize(11);
            d.push_back(dau);
            continue;
        }
        for (const auto& l : sp->getCacLo()) {
            vector<string> r = dau;
            r.push_back(l.getMaLoHang());
            r.push_back(to_string(l.getSoLuongTon()));
            r.push_back(l.getHanSuDung().str());
            r.push_back(l.getViTriKho());
            r.push_back(l.kiemTraHanSD() ? "Con han" : "Het han");
            r.push_back(to_string((long long)(l.getSoLuongTon() * sp->getGiaBan())));
            d.push_back(r);
        }
    }
    return ghiXlsx(TEN_EXCEL, "kho",
                   vector<int>{14, 30, 14, 15, 11, 11, 9, 15, 12, 14, 18},
                   vector<int>{2, 0, 1, 1, 1, 2, 1, 0, 0, 0, 1}, d);
}

// ------------------ Doc / ghi file thu cong ------------------
inline void QuanLyKho::luuFile() {
    if (QuanLyFileNhiPhan::ghiFileNhiPhan(TEN_FILE, cay, phieuXuats, phieuNhaps))
        cout << "  Da ghi file " << TEN_FILE << "\n";
    else
        cout << "  Ghi file that bai!\n";
    if (xuatExcel())
        cout << "  Da ghi file Excel " << TEN_EXCEL << "\n";
    else
        cout << "  Ghi file " << TEN_EXCEL << " that bai (dang mo trong Excel?)\n";
}
inline void QuanLyKho::docFile() {
    if (QuanLyFileNhiPhan::docFileNhiPhan(TEN_FILE, cay, phieuXuats, phieuNhaps))
        cout << "  Da doc " << cay.kichThuoc() << " mat hang tu " << TEN_FILE << "\n";
    else
        cout << "  Khong doc duoc file " << TEN_FILE << "\n";
}