// ============================================================================
// File.h - QuanLyFileNhiPhan: Luu va khoi phuc du lieu quan ly kho
// Ky thuat: Binary Serialization/Deserialization, BFS, POD, Magic Number, Length-Prefixed String, tuong thich nguoc.
// Nguoi phu trach: Ph?m Minh Phúc 
// ============================================================================

#include <cstdint>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

class QuanLyFileNhiPhan {
private:
    template <typename T> static void ghiPOD(ostream& o, const T& v) {
        o.write(reinterpret_cast<const char*>(&v), sizeof(T));
    }
    template <typename T> static bool docPOD(istream& i, T& v) {
        i.read(reinterpret_cast<char*>(&v), sizeof(T));
        return (bool)i;
    }
    static void ghiStr(ostream& o, const string& s) {
        uint32_t n = (uint32_t)s.size();
        ghiPOD(o, n);
        o.write(s.data(), n);
    }
    static bool docStr(istream& i, string& s) {
        uint32_t n;
        if (!docPOD(i, n) || n > 1000000) return false;
        s.assign(n, '\0');
        if (n) i.read(&s[0], n);
        return (bool)i;
    }
    static void ghiDate(ostream& o, const Date& d) {
        int32_t a = d.d, b = d.m, c = d.y;
        ghiPOD(o, a); ghiPOD(o, b); ghiPOD(o, c);
    }
    static bool docDate(istream& i, Date& d) {
        int32_t a, b, c;
        if (!docPOD(i, a) || !docPOD(i, b) || !docPOD(i, c)) return false;
        d.d = a; d.m = b; d.y = c;
        return true;
    }

public:
    static uint32_t magicValue() { return 0x41564C31; }  // "AVL1"

    // Ghi cay theo tung tang (BFS): doc lai bang insert se ra DUNG hinh dang goc
    // (duyet NLR khong dam bao vi chen het cay con trai truoc se gay quay thua)
    // Dinh dang file khong doi so voi phien ban cu nen doc duoc file kho.dat cu.
    static bool ghiFileNhiPhan(const string& ten, const cayVL& tree,
                               const vector<PhieuXuatKho>& phieuXuats,
                               const vector<PhieuNhapKho>& phieuNhaps,
                               const vector<PhieuXuatHuy>& phieuHuys) {
        ofstream o(ten, ios::binary | ios::trunc);
        if (!o) return false;
        ghiPOD(o, magicValue());

        auto dsMH = tree.duyetTheoTang();
        uint32_t n = (uint32_t)dsMH.size();
        ghiPOD(o, n);
        for (const MatHang* sp : dsMH) {
            ghiStr(o, sp->getMaSanPham());
            ghiStr(o, sp->getTenSanPham());
            double gia = sp->getGiaBan();
            ghiPOD(o, gia);
            int32_t mt = sp->getMucTonToiThieu();
            ghiPOD(o, mt);
            uint32_t nl = (uint32_t)sp->getCacLo().size();
            ghiPOD(o, nl);
            for (const auto& l : sp->getCacLo()) {
                ghiStr(o, l.getMaLoHang());
                int32_t sl = l.getSoLuongTon();
                ghiPOD(o, sl);
                ghiDate(o, l.getHanSuDung());
                ghiStr(o, l.getViTriKho());
            }
        }

        uint32_t nx = (uint32_t)phieuXuats.size();
        ghiPOD(o, nx);
        for (const auto& h : phieuXuats) {
            ghiStr(o, h.maPhieuXuat);
            ghiDate(o, h.ngayXuat);
            ghiPOD(o, h.tongTien);
            uint32_t nc = (uint32_t)h.chiTiet.size();
            ghiPOD(o, nc);
            for (const auto& c : h.chiTiet) {
                ghiStr(o, c.maSanPham);
                ghiStr(o, c.tenSanPham);
                int32_t sl = c.soLuong;
                ghiPOD(o, sl);
                ghiPOD(o, c.donGia);
                ghiPOD(o, c.thanhTien);
            }
        }

        uint32_t np = (uint32_t)phieuNhaps.size();
        ghiPOD(o, np);
        for (const auto& p : phieuNhaps) {
            ghiStr(o, p.maPhieuNhap);
            ghiDate(o, p.ngayNhap);
            ghiStr(o, p.nhaCungCap);
            ghiStr(o, p.maSanPham);
            ghiStr(o, p.maLoHang);
            int32_t sl = p.soLuong;
            ghiPOD(o, sl);
        }

        // Phieu xuat huy: ghi o CUOI file nen file kho.dat cu (chua co phan nay) van doc duoc
        uint32_t nh = (uint32_t)phieuHuys.size();
        ghiPOD(o, nh);
        for (const auto& h : phieuHuys) {
            ghiStr(o, h.maPhieuHuy);
            ghiDate(o, h.ngayHuy);
            ghiStr(o, h.lyDo);
            ghiPOD(o, h.tongTien);
            uint32_t nc = (uint32_t)h.chiTiet.size();
            ghiPOD(o, nc);
            for (const auto& c : h.chiTiet) {
                ghiStr(o, c.maSanPham);
                ghiStr(o, c.tenSanPham);
                ghiStr(o, c.maLoHang);
                ghiDate(o, c.hanSuDung);
                int32_t sl = c.soLuong;
                ghiPOD(o, sl);
                ghiPOD(o, c.donGia);
                ghiPOD(o, c.thanhTien);
            }
        }
        return (bool)o;
    }

    static bool docFileNhiPhan(const string& ten, cayVL& tree,
                               vector<PhieuXuatKho>& phieuXuats,
                               vector<PhieuNhapKho>& phieuNhaps,
                               vector<PhieuXuatHuy>& phieuHuys) {
        ifstream in(ten, ios::binary);
        if (!in) return false;
        uint32_t magic;
        if (!docPOD(in, magic) || magic != magicValue()) return false;

        tree.xoaHet();
        phieuXuats.clear();
        phieuNhaps.clear();
        phieuHuys.clear();

        uint32_t n;
        if (!docPOD(in, n)) return false;
        for (uint32_t k = 0; k < n; k++) {
            string ma, tenSP;
            double gia;
            int32_t mt;
            uint32_t nl;
            if (!docStr(in, ma) || !docStr(in, tenSP) ||
                !docPOD(in, gia) || !docPOD(in, mt) || !docPOD(in, nl))
                return false;
            MatHang sp(ma, tenSP, gia, mt);
            for (uint32_t j = 0; j < nl; j++) {
                string maLo, viTri;
                int32_t sl;
                Date hsd;
                if (!docStr(in, maLo) || !docPOD(in, sl) ||
                    !docDate(in, hsd) || !docStr(in, viTri))
                    return false;
                sp.nhapKho(TonKho(maLo, sl, hsd, viTri));
            }
            tree.insert(ma, sp);
        }

        uint32_t nx;
        if (!docPOD(in, nx)) return false;
        for (uint32_t k = 0; k < nx; k++) {
            PhieuXuatKho h;
            uint32_t nc;
            if (!docStr(in, h.maPhieuXuat) || !docDate(in, h.ngayXuat) ||
                !docPOD(in, h.tongTien) || !docPOD(in, nc))
                return false;
            for (uint32_t j = 0; j < nc; j++) {
                ChiTietXuat c;
                int32_t sl;
                if (!docStr(in, c.maSanPham) || !docStr(in, c.tenSanPham) ||
                    !docPOD(in, sl) || !docPOD(in, c.donGia) || !docPOD(in, c.thanhTien))
                    return false;
                c.soLuong = sl;
                h.chiTiet.push_back(c);
            }
            phieuXuats.push_back(h);
        }

        uint32_t np;
        if (!docPOD(in, np)) return false;
        for (uint32_t k = 0; k < np; k++) {
            PhieuNhapKho p;
            int32_t sl;
            if (!docStr(in, p.maPhieuNhap) || !docDate(in, p.ngayNhap) ||
                !docStr(in, p.nhaCungCap) || !docStr(in, p.maSanPham) ||
                !docStr(in, p.maLoHang) || !docPOD(in, sl))
                return false;
            p.soLuong = sl;
            phieuNhaps.push_back(p);
        }

        if (in.peek() == EOF) return true;  // file cu: chua co phieu xuat huy
        uint32_t nh;
        if (!docPOD(in, nh)) return false;
        for (uint32_t k = 0; k < nh; k++) {
            PhieuXuatHuy h;
            uint32_t nc;
            if (!docStr(in, h.maPhieuHuy) || !docDate(in, h.ngayHuy) ||
                !docStr(in, h.lyDo) || !docPOD(in, h.tongTien) || !docPOD(in, nc))
                return false;
            for (uint32_t j = 0; j < nc; j++) {
                ChiTietHuy c;
                int32_t sl;
                if (!docStr(in, c.maSanPham) || !docStr(in, c.tenSanPham) ||
                    !docStr(in, c.maLoHang) || !docDate(in, c.hanSuDung) ||
                    !docPOD(in, sl) || !docPOD(in, c.donGia) || !docPOD(in, c.thanhTien))
                    return false;
                c.soLuong = sl;
                h.chiTiet.push_back(c);
            }
            phieuHuys.push_back(h);
        }
        return true;
    }
};
