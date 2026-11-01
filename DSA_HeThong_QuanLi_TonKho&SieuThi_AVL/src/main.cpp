// ============================================================================
// BAI TAP LON DSA - DT05
// HE THONG QUAN LY HANG TON KHO & DOANH THU SIEU THI
// Cau truc du lieu chinh: CAY CAN BANG AVL (khoa = ma mat hang)
// Ky thuat: phep quay LL/RR/LR/RL, balance factor, range search,
//           sap xep bang QUICK SORT (tu cai dat), doc/ghi tep nhi phan (kho.dat)
//           + tep Excel (taikhoan.xlsx, kho.xlsx).
// Bien dich: g++ -std=c++11 -o sieuthi main.cpp  (Dev-C++: bat -std=c++11)
// Tai khoan admin mac dinh lan dau chay: admin / admin123
// Nguoi phu trach file nay: C
// ============================================================================
#include <ctime>
#include <cstdlib>
#include <iostream>

#include "QuanLyKho.h"      // khai bao lop QuanLyKho (P)
#include "QuanLyMatHang.h"  // them/sua/xoa/tim/tra cuu/in cay (C)
#include "SapXep.h"         // sap xep Quick Sort (P)
#include "TongGiaTri.h"     // tong gia tri ton kho (S)
#include "NhapXuat.h"       // nhap / xuat kho (S)
#include "XuatHuy.h"        // huy hang het han, phieu xuat huy (A)
#include "ThongKe.h"        // canh bao, thong ke doanh thu (S)
#include "LuuTru.h"         // khoi dong, luu / doc file (C)
#include "DuLieuMau.h"      // du lieu mau demo AVL (A)
#include "TaiKhoan.h"       // dang nhap admin (C)
using namespace std;

// ---------------------------------------------------------------------------
// MENU
// ---------------------------------------------------------------------------
static void inMenu(bool admin) {
    cout << "\n=============================================================\n"
         << "  QUAN LY HANG TON KHO & DOANH THU SIEU THI  (cay AVL)\n"
         << "  Che do: " << (admin ? "ADMIN" : "KHACH (chi xem)") << "\n"
         << "=============================================================\n"
         << " --- Quan ly mat hang ---\n"
         << "  1. Them mat hang [AD]     2. Sua mat hang [AD]\n"
         << "  3. Xoa mat hang [AD]      4. Tim mat hang theo ma\n"
         << "  5. Tra cuu khoang ma      6. Tra cuu khoang gia\n"
         << "  7. Danh sach mat hang     8. Sap xep (gia / ton kho)\n"
         << " --- Kho ---\n"
         << "  9. Nhap kho [AD]         10. Xuat kho [AD]\n"
         << " 11. Canh bao ton kho      12. Tong gia tri ton kho\n"
         << " --- Thong ke ---\n"
         << " 13. Thong ke doanh thu / xuat kho / huy [AD]\n"
         << " --- He thong ---\n"
         << " 14. Xem cau truc cay AVL  15. Ghi file nhi phan [AD]\n"
         << " 16. Doc file nhi phan [AD] 17. Nap du lieu mau [AD]\n"
         << " --- Tai khoan ---\n"
         << " 18. Doi mat khau admin [AD]\n"
         << " 19. Dang xuat (ve man hinh dau)\n"
         << " 20. Huy hang het han - lap phieu xuat huy [AD]\n"
         << "  0. Thoat\n"
         << "  ([AD] = chi danh cho admin)\n";
}

// Cac chuc nang khach khong duoc dung
static bool chiAdmin(int c) {
    return c == 1 || c == 2 || c == 3 || c == 9 || c == 10 || c == 13 ||
           c == 15 || c == 16 || c == 17 || c == 18 || c == 20;
}

int main() {
    srand((unsigned)time(nullptr));
    QuanLyKho ql;
    TaiKhoanAdmin tk;
    ql.khoiDong();
    tk.khoiDong();
    docDong("\nVui long nhan Enter de quay lai menu va dang nhap...");

    while (true) {  // man hinh dau: chon che do
        xoaManHinh();
        cout << "=============================================================\n"
             << "  QUAN LY HANG TON KHO & DOANH THU SIEU THI\n"
             << "=============================================================\n"
             << "  1. Vao voi tu cach KHACH (chi xem, tra cuu)\n"
             << "  2. Dang nhap ADMIN\n"
             << "  0. Thoat\n";
        int cd = docSo("Chon: ", 0, 2);
        if (cd == 0) {
            cout << "Tam biet!\n";
            return 0;
        }
        bool admin = false;
        if (cd == 2) {
            cout << "\n--- DANG NHAP ADMIN ---\n";
            if (!tk.dangNhap()) { tamDung(); continue; }
            admin = true;
        }
        tamDung();

        bool dangXuat = false;
        while (!dangXuat) {
            xoaManHinh();
            inMenu(admin);
            int c = docSo("Chon chuc nang: ", 0, 20);
            if (!admin && chiAdmin(c)) {
                cout << "  Chuc nang nay chi danh cho admin. Hay dang xuat va dang nhap admin!\n";
                tamDung();
                continue;
            }
            switch (c) {
                case 1: ql.themMatHang(); break;
                case 2: ql.suaMatHang(); break;
                case 3: ql.xoaMatHang(); break;
                case 4: ql.timMatHang(); break;
                case 5: ql.traCuuTheoMa(); break;
                case 6: ql.traCuuTheoGia(); break;
                case 7: ql.inTatCa(); break;
                case 8: ql.sapXepDuLieu(); break;
                case 9: ql.nhapKho(); break;
                case 10: ql.xuatKho(); break;
                case 11: ql.canhBaoTonKho(); break;
                case 12: ql.inTongGiaTriTonKho(); break;
                case 13: ql.thongKeDoanhThu(); break;
                case 14: ql.inCayAVL(); break;
                case 15: ql.luuFile(); break;
                case 16: ql.docFile(); break;
                case 17: ql.napDuLieuMau(); break;
                case 18: tk.doiMatKhau(); break;
                case 20: ql.huyHangHetHan(); break;
                case 19:
                    if (admin) ql.luuFile();
                    cout << "  Da dang xuat.\n";
                    dangXuat = true;
                    break;
                case 0:
                    if (admin) ql.luuFile();
                    cout << "Tam biet!\n";
                    return 0;
            }
            if (!dangXuat) tamDung();
        }
    }
}
