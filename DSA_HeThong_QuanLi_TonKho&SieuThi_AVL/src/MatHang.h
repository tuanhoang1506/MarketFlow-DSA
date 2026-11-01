class MatHang {
private:
    string maSanPham;
    string tenSanPham;
    double giaBan;
    int mucTonToiThieu;
    vector<TonKho> cacLo;  // 1 mat hang - nhieu lo ton kho

public:
    MatHang() : giaBan(0), mucTonToiThieu(0) {}
    MatHang(const string& ma, const string& ten, double gia, int mucMin)
        : maSanPham(ma), tenSanPham(ten), giaBan(gia), mucTonToiThieu(mucMin) {}

    // ---- getter ----
    const string& getMaSanPham() const { return maSanPham; }
    const string& getTenSanPham() const { return tenSanPham; }
    double getGiaBan() const { return giaBan; }
    int getMucTonToiThieu() const { return mucTonToiThieu; }
    const vector<TonKho>& getCacLo() const { return cacLo; }

    // ---- setter ----
    void setTenSanPham(const string& ten) { tenSanPham = ten; }
    void setMucTonToiThieu(int v) { mucTonToiThieu = v; }
    void capNhatGia(double giaMoi) { giaBan = giaMoi; }

    // ---- nhap / xuat (ma da duoc dat truoc, co kiem tra du lieu nhap) ----
    void nhap() {
        tenSanPham = docChuoi("Ten mat hang: ");
        giaBan = docThuc("Gia ban (d): ", 0);
        mucTonToiThieu = docSo("Muc ton toi thieu: ", 0, 1000000);
    }
    static void xuatTieuDe() {
        cout << left << setw(8) << "Ma" << setw(26) << "Ten mat hang"
             << right << setw(12) << "Gia ban" << setw(8) << "Ton"
             << setw(8) << "Min" << "  TT\n";
        cout << string(70, '-') << "\n";
    }
    void xuat() const {
        cout << left << setw(8) << maSanPham << setw(26) << tenSanPham.substr(0, 25)
             << right << setw(12) << (long long)giaBan << setw(8) << tongTon()
             << setw(8) << mucTonToiThieu << "  "
             << (kiemTraCanCanhBao() ? "SAP HET!" : "OK") << "\n";
    }
    void xuatChiTietLo() const {
        if (cacLo.empty()) { cout << "    (chua co lo hang)\n"; return; }
        for (const auto& l : cacLo) {
            cout << "    - Lo " << l.getMaLoHang() << ": SL=" << l.getSoLuongTon()
                 << ", HSD=" << l.getHanSuDung().str() << ", vi tri=" << l.getViTriKho()
                 << (l.kiemTraHanSD() ? "" : "  [HET HAN]") << "\n";
        }
    }

    // ---- nghiep vu ton kho ----
    int tongTon() const {
        int t = 0;
        for (const auto& l : cacLo) t += l.getSoLuongTon();
        return t;
    }
    // so luong co the xuat (chi tinh lo con han)
    int tonXuatDuoc() const {
        int t = 0;
        for (const auto& l : cacLo)
            if (l.kiemTraHanSD()) t += l.getSoLuongTon();
        return t;
    }
    // gia tri ton kho cua mat hang = tong ton * gia ban
    double tinhGiaTriTon() const { return tongTon() * giaBan; }
    // gia tri cua cac lo da het han
    double giaTriHetHan() const {
        double t = 0;
        for (const auto& l : cacLo)
            if (!l.kiemTraHanSD()) t += l.getSoLuongTon() * giaBan;
        return t;
    }
    bool kiemTraCanCanhBao() const { return tongTon() <= mucTonToiThieu; }

    // Xuat kho theo FEFO: lo het han som nhat xuat truoc, bo qua lo qua han
    bool xuatKho(int soLuong) {
        if (soLuong <= 0 || soLuong > tonXuatDuoc()) return false;
        vector<TonKho*> ds;
        for (auto& l : cacLo)
            if (l.kiemTraHanSD() && l.getSoLuongTon() > 0) ds.push_back(&l);
        sort(ds.begin(), ds.end(), [](TonKho* a, TonKho* b) {
            return a->getHanSuDung().key() < b->getHanSuDung().key();
        });
        for (TonKho* l : ds) {
            if (soLuong == 0) break;
            int lay = min(soLuong, l->getSoLuongTon());
            l->capNhatSoLuong(-lay);
            soLuong -= lay;
        }
        return true;
    }
    // Nhap kho: chi cong don khi trung ma lo VA cung han su dung (cung 1 lo that su).
    // Trung ma lo nhung KHAC han su dung -> tu choi (tra ve false), khong ghi de han cu.
    bool nhapKho(const TonKho& lo) {
        for (auto& l : cacLo) {
            if (l.getMaLoHang() == lo.getMaLoHang()) {
                if (l.getHanSuDung().key() != lo.getHanSuDung().key()) return false;
                l.capNhatSoLuong(lo.getSoLuongTon());
                l.setViTriKho(lo.getViTriKho());
                return true;
            }
        }
        cacLo.push_back(lo);
        return true;
    }
    // Huy cac lo da het han: xoa khoi mat hang, dua cac lo con hang vao 'daHuy'
    // (de lap phieu xuat huy). Tra ve tong so luong da huy.
    int huyLoHetHan(vector<TonKho>& daHuy) {
        int huy = 0;
        for (size_t i = 0; i < cacLo.size();) {
            if (!cacLo[i].kiemTraHanSD()) {
                if (cacLo[i].getSoLuongTon() > 0) daHuy.push_back(cacLo[i]);
                huy += cacLo[i].getSoLuongTon();
                cacLo.erase(cacLo.begin() + i);
            } else {
                i++;
            }
        }
        return huy;
    }
};
