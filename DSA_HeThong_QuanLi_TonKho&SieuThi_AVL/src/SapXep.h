#pragma once
#include <iostream>
#include <vector>
#include "QuanLyKho.h"
#include "QuickSort.h"
using namespace std;

// Lay danh sach mat hang (LNR) roi sap xep bang QUICK SORT.
// Khi gia tri bang nhau thi xep theo ma mat hang tang dan (ket qua luon on dinh, de kiem tra).
inline vector<MatHang*> QuanLyKho::sapXepTheoGia(bool tang) {
    vector<MatHang*> ds = cay.duyetTheoThuTu();
    quickSort(ds, 0, (int)ds.size() - 1, [tang](MatHang* a, MatHang* b) {
        if (a->getGiaBan() != b->getGiaBan())
            return tang ? a->getGiaBan() < b->getGiaBan() : a->getGiaBan() > b->getGiaBan();
        return a->getMaSanPham() < b->getMaSanPham();
    });
    return ds;
}

inline vector<MatHang*> QuanLyKho::sapXepTheoTon(bool tang) {
    vector<MatHang*> ds = cay.duyetTheoThuTu();
    quickSort(ds, 0, (int)ds.size() - 1, [tang](MatHang* a, MatHang* b) {
        if (a->tongTon() != b->tongTon())
            return tang ? a->tongTon() < b->tongTon() : a->tongTon() > b->tongTon();
        return a->getMaSanPham() < b->getMaSanPham();
    });
    return ds;
}

inline void QuanLyKho::sapXepDuLieu() {
    cout << "\n--- SAP XEP DU LIEU (thuat toan Quick Sort) ---\n";
    if (cay.rong()) { cout << "  Kho dang rong.\n"; return; }
    cout << "  1. Theo gia ban - tang dan\n"
         << "  2. Theo gia ban - giam dan\n"
         << "  3. Theo so luong ton kho - tang dan\n"
         << "  4. Theo so luong ton kho - giam dan\n"
         << "  0. Quay lai\n";
    int c = docSo("Chon: ", 0, 4);
    if (c == 0) return;
    vector<MatHang*> ds;
    switch (c) {
        case 1: cout << "\nSap xep theo GIA BAN tang dan:\n"; ds = sapXepTheoGia(true); break;
        case 2: cout << "\nSap xep theo GIA BAN giam dan:\n"; ds = sapXepTheoGia(false); break;
        case 3: cout << "\nSap xep theo TON KHO tang dan:\n"; ds = sapXepTheoTon(true); break;
        default: cout << "\nSap xep theo TON KHO giam dan:\n"; ds = sapXepTheoTon(false); break;
    }
    inDanhSach(ds);
}
