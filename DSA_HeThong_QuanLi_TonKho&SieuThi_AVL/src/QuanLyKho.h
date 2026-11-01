#pragma once
#include <algorithm>
#include <cstdio>
#include <iomanip>
#include <iostream>
#include <map>
#include <string>
#include <vector>
#include "AVLTree.h"
#include "Excel.h"
#include "FileIO.h"
#include "MatHang.h"
#include "Phieu.h"
#include "Utils.h"
using namespace std;

class QuanLyKho {
private:
    cayVL cay;
    vector<PhieuXuatKho> phieuXuats;
    vector<PhieuNhapKho> phieuNhaps;
    vector<PhieuXuatHuy> phieuHuys;
    const string TEN_FILE = "kho.dat";
    const string TEN_EXCEL = "kho.xlsx";  // ban Excel cua kho (chi xuat ra, khong doc lai)

    static string taoMa(const string& tienTo, size_t stt) {
        char buf[32];
        snprintf(buf, sizeof(buf), "%s%04u", tienTo.c_str(), (unsigned)stt);
        return buf;
    }

    // Cai dat trong LuuTru.h
    void tuDongLuu();
    bool xuatExcel();

    void inDanhSach(const vector<MatHang*>& ds) {
        if (ds.empty()) { cout << "  Khong co mat hang nao.\n"; return; }
        MatHang::xuatTieuDe();
        for (auto* sp : ds) sp->xuat();
        cout << "  => " << ds.size() << " mat hang\n";
    }

public:
    // ---- LuuTru.h ----
    void khoiDong();
    void luuFile();
    void docFile();

    // ---- QuanLyMatHang.h ----
    void themMatHang();
    void suaMatHang();
    void xoaMatHang();
    void timMatHang();
    void traCuuTheoMa();
    void traCuuTheoGia();
    void inTatCa();
    void inCayAVL();

    // ---- SapXep.h ----
    vector<MatHang*> sapXepTheoGia(bool tang);
    vector<MatHang*> sapXepTheoTon(bool tang);
    void sapXepDuLieu();

    // ---- TongGiaTri.h ----
    double tinhTongGiaTriTonKho();
    double tinhTongGiaTriHetHan();
    long long tinhTongSoLuongTon();
    void inTongGiaTriTonKho();

    // ---- NhapXuat.h ----
    void nhapKho();
    void xuatKho();

    // ---- XuatHuy.h ----
    void huyHangHetHan();
    void inThongKeHuy();

    // ---- ThongKe.h ----
    void canhBaoTonKho();
    void thongKeDoanhThu();

    // ---- DuLieuMau.h ----
    void napDuLieuMau();
};
