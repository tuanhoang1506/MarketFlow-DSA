#pragma once
#include <iomanip>
#include <iostream>
#include <map>
#include <string>
#include <vector>
#include "QuanLyKho.h"
using namespace std;

// ------------------ Nhap kho ------------------
inline void QuanLyKho::nhapKho() {
    cout << "\n--- NHAP KHO ---\n";
    MatHang* sp = cay.search(inHoa(docChuoi("Ma mat hang: ")));
    if (!sp) { cout << "  Mat hang chua co trong he thong, hay them mat hang truoc!\n"; return; }
    string maLo = inHoa(docChuoi("Ma lo hang: "));
    int soLuong = docSo("So luong nhap: ", 1, 1000000);
    Date hsd = docNgay("Han su dung (dd/mm/yyyy): ");
    string viTri = docChuoi("Vi tri kho (vd: KE-A1): ");
    TonKho lo(maLo, soLuong, hsd, viTri);
    PhieuNhapKho pn;
    pn.maPhieuNhap = taoMa("PN", phieuNhaps.size() + 1);
    pn.ngayNhap = Date::homNay();
    pn.nhaCungCap = docChuoi("Nha cung cap: ");
    pn.maSanPham = sp->getMaSanPham();
    pn.maLoHang = maLo;
    pn.soLuong = soLuong;
    if (!lo.kiemTraHanSD())
        cout << "  [!] Luu y: lo hang nay DA HET HAN, se khong the xuat.\n";
    if (!sp->nhapKho(lo)) {
        cout << "  [!] Ma lo " << maLo << " da ton tai voi han su dung KHAC. "
             << "Hay dung ma lo moi cho dot hang nay!\n";
        return;
    }
    phieuNhaps.push_back(pn);
    cout << "  Da lap phieu " << pn.maPhieuNhap << ". Ton moi cua " << sp->getMaSanPham()
         << ": " << sp->tongTon() << "\n";
    tuDongLuu();
}

// ------------------ Xuat kho (thay cho chuc nang ban hang) ------------------
inline void QuanLyKho::xuatKho() {
    cout << "\n--- XUAT KHO ---\n";
    PhieuXuatKho px;
    px.maPhieuXuat = taoMa("PX", phieuXuats.size() + 1);
    px.ngayXuat = Date::homNay();
    map<string, int> dsXuat;  // ma -> so luong du kien xuat

    cout << "  (Nhap ma mat hang, de trong de ket thuc)\n";
    while (true) {
        string ma = inHoa(docChuoi("  Ma mat hang: ", true));
        if (ma.empty()) break;
        MatHang* sp = cay.search(ma);
        if (!sp) { cout << "    Khong tim thay mat hang!\n"; continue; }
        int daCo = dsXuat[ma];
        int conLai = sp->tonXuatDuoc() - daCo;
        cout << "    " << sp->getTenSanPham() << " - " << (long long)sp->getGiaBan()
             << " d - co the xuat: " << conLai << "\n";
        if (conLai <= 0) { cout << "    Het hang (hoac chi con lo qua han)!\n"; continue; }
        int sl = docSo("    So luong xuat: ", 1, 1000000);
        if (sl > conLai) { cout << "    Khong du hang trong kho!\n"; continue; }
        dsXuat[ma] += sl;
        cout << "    Da them vao phieu xuat.\n";
    }
    if (dsXuat.empty()) { cout << "  Phieu xuat trong, huy phieu.\n"; return; }

    for (auto& kv : dsXuat) {
        MatHang* sp = cay.search(kv.first);
        ChiTietXuat c;
        c.maSanPham = sp->getMaSanPham();
        c.tenSanPham = sp->getTenSanPham();
        c.soLuong = kv.second;
        c.donGia = sp->getGiaBan();
        px.chiTiet.push_back(c);
    }
    px.tinhTongTien();

    cout << "\n  ===== PHIEU XUAT KHO " << px.maPhieuXuat << " - " << px.ngayXuat.str() << " =====\n";
    for (const auto& c : px.chiTiet)
        cout << "  " << left << setw(8) << c.maSanPham << setw(24) << c.tenSanPham.substr(0, 23)
             << right << setw(4) << c.soLuong << " x " << setw(9) << (long long)c.donGia
             << " = " << setw(10) << (long long)c.thanhTien << "\n";
    cout << "  TONG GIA TRI XUAT: " << dinhDangTien(px.tongTien) << "\n";

    string xn = docChuoi("  Xac nhan xuat kho? (y/n): ");
    if (xn != "y" && xn != "Y") { cout << "  Da huy phieu xuat.\n"; return; }

    // Tru ton kho thuc su (FEFO) + cap nhat thoi gian thuc
    vector<string> canhBao;
    for (const auto& c : px.chiTiet) {
        MatHang* sp = cay.search(c.maSanPham);
        sp->xuatKho(c.soLuong);
        if (sp->kiemTraCanCanhBao())
            canhBao.push_back(sp->getMaSanPham() + " - " + sp->getTenSanPham() + " (con " +
                              to_string(sp->tongTon()) + ", min " +
                              to_string(sp->getMucTonToiThieu()) + ")");
    }
    phieuXuats.push_back(px);
    cout << "  Xuat kho thanh cong! Da lap phieu " << px.maPhieuXuat << "\n";
    for (const auto& s : canhBao) cout << "  [CANH BAO TON KHO] " << s << "\n";
    tuDongLuu();
}
