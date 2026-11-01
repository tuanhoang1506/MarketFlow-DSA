// ============================================================================
// QuanLyMatHang.h - Quan ly mat hang: them / sua / xoa / tim / tra cuu / in cay
// (Cai dat cac ham thanh vien cua lop QuanLyKho)
// Nguoi phu trach: Vo Nguyen Sarol
// ============================================================================
#pragma once
#include <iostream>
#include <string>
#include <vector>
#include "QuanLyKho.h"
#include "QuickSort.h"
using namespace std;

inline void QuanLyKho::themMatHang() {
    cout << "\n--- THEM MAT HANG ---\n";
    string ma = inHoa(docChuoi("Ma mat hang (ma vach): "));
    if (cay.search(ma)) { cout << "  Ma da ton tai!\n"; return; }
    MatHang sp;
    sp.nhap();  // nhap ten, gia, muc ton (co kiem tra)
    MatHang moi(ma, sp.getTenSanPham(), sp.getGiaBan(), sp.getMucTonToiThieu());
    cay.batLogQuay(true);
    cay.insert(ma, moi);  // insert + tu dong can bang AVL
    cay.batLogQuay(false);
    cout << "  Them thanh cong! Cay AVL: " << cay.kichThuoc()
         << " nut, chieu cao = " << cay.chieuCaoCay() << "\n";
    tuDongLuu();
}

inline void QuanLyKho::suaMatHang() {
    cout << "\n--- SUA MAT HANG ---\n";
    MatHang* sp = cay.search(inHoa(docChuoi("Ma mat hang can sua: ")));
    if (!sp) { cout << "  Khong tim thay!\n"; return; }
    cout << "  Hien tai: " << sp->getTenSanPham() << " | gia " << (long long)sp->getGiaBan()
         << " | min " << sp->getMucTonToiThieu() << "\n";
    string ten = docChuoi("Ten moi (Enter de giu nguyen): ", true);
    if (!ten.empty()) sp->setTenSanPham(ten);
    string gia = docChuoi("Gia moi (Enter de giu nguyen): ", true);
    if (!gia.empty()) {
        try { double g = stod(gia); if (g >= 0) sp->capNhatGia(g); else cout << "  Gia am, bo qua.\n"; }
        catch (...) { cout << "  Gia khong hop le, bo qua.\n"; }
    }
    string mt = docChuoi("Muc ton toi thieu moi (Enter de giu nguyen): ", true);
    if (!mt.empty()) {
        try { int v = stoi(mt); if (v >= 0) sp->setMucTonToiThieu(v); else cout << "  Gia tri am, bo qua.\n"; }
        catch (...) { cout << "  Gia tri khong hop le, bo qua.\n"; }
    }
    cout << "  Da cap nhat.\n";
    tuDongLuu();
}

inline void QuanLyKho::xoaMatHang() {
    cout << "\n--- XOA MAT HANG ---\n";
    string ma = inHoa(docChuoi("Ma mat hang can xoa: "));
    MatHang* sp = cay.search(ma);
    if (!sp) { cout << "  Khong tim thay!\n"; return; }
    if (sp->tongTon() > 0) {
        string xn = docChuoi("  Mat hang con ton " + to_string(sp->tongTon()) +
                             ". Van xoa? (y/n): ");
        if (xn != "y" && xn != "Y") { cout << "  Huy.\n"; return; }
    }
    cay.remove(ma);  // remove + tu dong can bang AVL
    cout << "  Da xoa. Cay con " << cay.kichThuoc() << " nut, chieu cao = "
         << cay.chieuCaoCay() << "\n";
    tuDongLuu();
}

inline void QuanLyKho::timMatHang() {
    cout << "\n--- TIM MAT HANG ---\n";
    MatHang* sp = cay.search(inHoa(docChuoi("Ma mat hang: ")));
    if (!sp) { cout << "  Khong tim thay!\n"; return; }
    MatHang::xuatTieuDe();
    sp->xuat();
    cout << "  Chi tiet cac lo:\n";
    sp->xuatChiTietLo();
}

inline void QuanLyKho::traCuuTheoMa() {
    cout << "\n--- TRA CUU THEO KHOANG MA (pham vi tim kiem tren cay AVL) ---\n";
    string lo = inHoa(docChuoi("Tu ma: "));
    string hi;
    while (true) {
        hi = inHoa(docChuoi("Den ma: "));
        if (hi >= lo) break;
        cout << "  'Den ma' phai lon hon hoac bang 'Tu ma' (" << lo << "). Nhap lai!\n";
    }
    cout << "\nKet qua tu " << lo << " den " << hi << ":\n";
    inDanhSach(cay.rangeSearch(lo, hi));
}

inline void QuanLyKho::traCuuTheoGia() {
    cout << "\n--- TRA CUU THEO KHOANG GIA ---\n";
    double lo = docThuc("Gia tu: ", 0);
    double hi;
    while (true) {
        hi = docThuc("Gia den: ", 0);
        if (hi >= lo) break;
        cout << "  'Gia den' phai lon hon hoac bang 'Gia tu' (" << (long long)lo << "). Nhap lai!\n";
    }
    cout << "\nKet qua gia tu " << (long long)lo << " den " << (long long)hi << " d:\n";
    vector<MatHang*> kq;
    for (auto* sp : cay.duyetTheoThuTu())
        if (sp->getGiaBan() >= lo && sp->getGiaBan() <= hi) kq.push_back(sp);
    quickSort(kq, 0, (int)kq.size() - 1, [](MatHang* a, MatHang* b) {
        if (a->getGiaBan() != b->getGiaBan()) return a->getGiaBan() < b->getGiaBan();
        return a->getMaSanPham() < b->getMaSanPham();
    });
    inDanhSach(kq);
}

inline void QuanLyKho::inTatCa() {
    cout << "\n--- DANH SACH MAT HANG (duyet LNR: tang dan theo ma) ---\n";
    inDanhSach(cay.duyetTheoThuTu());
}

inline void QuanLyKho::inCayAVL() {
    cout << "\n--- CAU TRUC CAY AVL ---\n";
    cout << "  So nut: " << cay.kichThuoc() << ", chieu cao: " << cay.chieuCaoCay() << "\n";
    cay.inThongKeQuay();
    cout << "  (So phep quay chi tinh tu luc khoi dong/nap du lieu. Cay doc tu file kho.dat\n"
         << "   duoc dung lai dung hinh dang da can bang nen khong phat sinh phep quay.\n"
         << "   Chon 17 de xem cac phep quay khi chen du lieu mau.)\n\n";
    cay.inCayDoc();
    string loi;
    cout << "\n  Kiem tra tinh chat AVL: ";
    if (cay.kiemTraAVL(loi))
        cout << "HOP LE (dung thu tu BST, chieu cao dung, moi nut |bf| <= 1)\n";
    else
        cout << "VI PHAM!\n" << loi;
}