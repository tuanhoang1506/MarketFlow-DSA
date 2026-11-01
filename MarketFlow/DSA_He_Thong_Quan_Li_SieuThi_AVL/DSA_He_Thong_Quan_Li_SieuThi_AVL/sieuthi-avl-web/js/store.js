/* ============================================================================
 * store.js - Nghiệp vụ toàn hệ thống (tương ứng lớp QuanLyKho + MatHang + TonKho
 * + Phieu.h + NhapXuat.h + XuatHuy.h + ThongKe.h + SapXep.h + TongGiaTri.h + LuuTru.h)
 *
 * Dữ liệu mặt hàng lưu trong cây AVL (khóa = mã mặt hàng).
 * Lưu trữ: localStorage (thay cho kho.dat), xuất/nhập JSON và CSV (thay cho kho.xlsx).
 * Mọi hàm nghiệp vụ trả về { ok, msg, ... } để giao diện hiển thị.
 * ========================================================================== */
(function (root) {
  'use strict';

  const AVLTree = root.AVLTree || (typeof require !== 'undefined' && require('./avl.js').AVLTree);
  const quickSort = root.quickSort || (typeof require !== 'undefined' && require('./quicksort.js').quickSort);

  // ====================== Ngày tháng (Date.h) ======================
  const pad = (n, w) => String(n).padStart(w || 2, '0');
  const Ngay = {
    homNay() {
      const t = new Date();
      return { d: t.getDate(), m: t.getMonth() + 1, y: t.getFullYear() };
    },
    key: (x) => x.y * 10000 + x.m * 100 + x.d,
    str: (x) => pad(x.d) + '/' + pad(x.m) + '/' + x.y,
    hopLe(d, m, y) {
      if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1) return false;
      const nhuan = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      const toiDa = [31, nhuan ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
      return d <= toiDa;
    },
    // 'yyyy-mm-dd' (thẻ <input type=date>) -> {d,m,y} | null
    tuInput(s) {
      const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
      if (!r) return null;
      const y = +r[1], m = +r[2], d = +r[3];
      return Ngay.hopLe(d, m, y) ? { d, m, y } : null;
    },
    raInput: (x) => x.y + '-' + pad(x.m) + '-' + pad(x.d),
  };

  // ====================== Lô hàng / Mặt hàng (MatHang.h) ======================
  // Mặt hàng: { ma, ten, gia, min, los: [{ maLo, sl, hsd:{d,m,y}, viTri }] }
  const conHan = (lo) => Ngay.key(lo.hsd) >= Ngay.key(Ngay.homNay());
  const MH = {
    tongTon: (sp) => sp.los.reduce((t, l) => t + l.sl, 0),
    // số lượng có thể xuất (chỉ tính lô còn hạn)
    tonXuatDuoc: (sp) => sp.los.filter(conHan).reduce((t, l) => t + l.sl, 0),
    giaTriTon: (sp) => MH.tongTon(sp) * sp.gia,
    giaTriHetHan: (sp) => sp.los.filter((l) => !conHan(l)).reduce((t, l) => t + l.sl * sp.gia, 0),
    canCanhBao: (sp) => MH.tongTon(sp) <= sp.min,
    coLoHetHan: (sp) => sp.los.some((l) => !conHan(l) && l.sl > 0),

    // Xuất kho theo FEFO: lô hết hạn sớm nhất xuất trước, bỏ qua lô quá hạn
    xuatFEFO(sp, soLuong) {
      if (soLuong <= 0 || soLuong > MH.tonXuatDuoc(sp)) return false;
      const ds = sp.los.filter((l) => conHan(l) && l.sl > 0)
        .sort((a, b) => Ngay.key(a.hsd) - Ngay.key(b.hsd));
      for (const l of ds) {
        if (soLuong === 0) break;
        const lay = Math.min(soLuong, l.sl);
        l.sl -= lay;
        soLuong -= lay;
      }
      return true;
    },
    // Nhập kho: chỉ cộng dồn khi trùng mã lô VÀ cùng hạn sử dụng.
    // Trùng mã lô nhưng KHÁC hạn -> từ chối (trả về false).
    nhapLo(sp, lo) {
      for (const l of sp.los) {
        if (l.maLo === lo.maLo) {
          if (Ngay.key(l.hsd) !== Ngay.key(lo.hsd)) return false;
          l.sl += lo.sl;
          l.viTri = lo.viTri;
          return true;
        }
      }
      sp.los.push(lo);
      return true;
    },
    // Hủy các lô đã hết hạn: xóa khỏi mặt hàng, trả về các lô còn hàng đã hủy
    huyLoHetHan(sp) {
      const daHuy = [];
      sp.los = sp.los.filter((l) => {
        if (conHan(l)) return true;
        if (l.sl > 0) daHuy.push(l);
        return false;
      });
      return daHuy;
    },
  };

  // ====================== Tiện ích hiển thị ======================
  const tien = (v) => Math.round(v).toLocaleString('vi-VN') + ' đ';
  const so = (v) => Math.round(v).toLocaleString('vi-VN');
  const taoMa = (tt, stt) => tt + pad(stt, 4);

  // ====================== Lớp QuanLyKho ======================
  const KHOA_LUU = 'sieuthi_avl_kho_v1';
  const KHOA_MK = 'sieuthi_avl_admin_pw';
  const MK_MAC_DINH = 'admin123';

  function luuTru() {
    try { return root.localStorage || null; } catch (e) { return null; }
  }

  class QuanLyKho {
    constructor() {
      this.cay = new AVLTree();
      this.phieuXuats = [];
      this.phieuNhaps = [];
      this.phieuHuys = [];
      this.nhatKyQuay = [];      // nhật ký phép quay (chỉ trong phiên làm việc)
      this.loiLuu = null;
    }

    // ---------- nhật ký phép quay ----------
    ghiNhatKy(thaoTac, khoa) {
      for (const e of this.cay.events)
        this.nhatKyQuay.push({ thaoTac, khoa, loai: e.type, nut: e.key });
      if (this.nhatKyQuay.length > 200) this.nhatKyQuay.splice(0, this.nhatKyQuay.length - 200);
    }
    static moTaQuay(events) {
      return events.map((e) => 'quay ' + e.type + ' tại ' + e.key).join(', ');
    }

    // ====================== Quản lý mặt hàng (QuanLyMatHang.h) ======================
    themMatHang(ma, ten, gia, min) {
      ma = (ma || '').trim().toUpperCase();
      ten = (ten || '').trim();
      if (!ma) return { ok: false, msg: 'Mã mặt hàng không được để trống.' };
      if (/\s/.test(ma)) return { ok: false, msg: 'Mã mặt hàng không được chứa khoảng trắng.' };
      if (!ten) return { ok: false, msg: 'Tên mặt hàng không được để trống.' };
      if (!(gia >= 0) || !isFinite(gia)) return { ok: false, msg: 'Giá bán phải là số >= 0.' };
      if (!Number.isInteger(min) || min < 0 || min > 1000000)
        return { ok: false, msg: 'Mức tồn tối thiểu phải là số nguyên trong [0, 1.000.000].' };
      if (this.cay.search(ma)) return { ok: false, msg: 'Mã ' + ma + ' đã tồn tại!' };
      this.cay.insert(ma, { ma, ten, gia, min, los: [] });
      this.ghiNhatKy('Chèn', ma);
      this.tuDongLuu();
      return {
        ok: true, events: this.cay.events.slice(),
        msg: 'Thêm thành công! Cây AVL: ' + this.cay.size + ' nút, chiều cao = ' + this.cay.height +
          (this.cay.events.length ? ' (' + QuanLyKho.moTaQuay(this.cay.events) + ')' : ''),
      };
    }

    suaMatHang(ma, ten, gia, min) {
      const sp = this.cay.search((ma || '').trim().toUpperCase());
      if (!sp) return { ok: false, msg: 'Không tìm thấy mặt hàng.' };
      ten = (ten || '').trim();
      if (!ten) return { ok: false, msg: 'Tên mặt hàng không được để trống.' };
      if (!(gia >= 0) || !isFinite(gia)) return { ok: false, msg: 'Giá bán phải là số >= 0.' };
      if (!Number.isInteger(min) || min < 0) return { ok: false, msg: 'Mức tồn tối thiểu phải là số nguyên >= 0.' };
      sp.ten = ten; sp.gia = gia; sp.min = min;
      this.tuDongLuu();
      return { ok: true, msg: 'Đã cập nhật ' + sp.ma + '.' };
    }

    xoaMatHang(ma) {
      ma = (ma || '').trim().toUpperCase();
      if (!this.cay.search(ma)) return { ok: false, msg: 'Không tìm thấy mặt hàng.' };
      this.cay.remove(ma);
      this.ghiNhatKy('Xóa', ma);
      this.tuDongLuu();
      return {
        ok: true, events: this.cay.events.slice(),
        msg: 'Đã xóa ' + ma + '. Cây còn ' + this.cay.size + ' nút, chiều cao = ' + this.cay.height +
          (this.cay.events.length ? ' (' + QuanLyKho.moTaQuay(this.cay.events) + ')' : ''),
      };
    }

    tim(ma) { return this.cay.search((ma || '').trim().toUpperCase()); }
    timDuongDi(ma) { return this.cay.searchPath((ma || '').trim().toUpperCase()); }
    tatCa() { return this.cay.inorder(); }             // duyệt LNR

    traCuuTheoMa(tu, den) {
      tu = (tu || '').trim().toUpperCase();
      den = (den || '').trim().toUpperCase();
      if (!tu || !den) return { ok: false, msg: 'Nhập đủ "Từ mã" và "Đến mã".' };
      if (den < tu) return { ok: false, msg: '"Đến mã" phải lớn hơn hoặc bằng "Từ mã" (' + tu + ').' };
      const r = this.cay.rangeSearch(tu, den);
      return { ok: true, items: r.items, visited: r.visited, tu, den };
    }

    traCuuTheoGia(tu, den) {
      if (!(tu >= 0) || !(den >= 0)) return { ok: false, msg: 'Nhập khoảng giá hợp lệ (>= 0).' };
      if (den < tu) return { ok: false, msg: '"Giá đến" phải lớn hơn hoặc bằng "Giá từ".' };
      const kq = this.tatCa().filter((sp) => sp.gia >= tu && sp.gia <= den);
      quickSort(kq, 0, kq.length - 1, (a, b) => (a.gia !== b.gia ? a.gia < b.gia : a.ma < b.ma));
      return { ok: true, items: kq };
    }

    // ====================== Sắp xếp bằng Quick Sort (SapXep.h) ======================
    sapXepTheoGia(tang) {
      const ds = this.tatCa();
      quickSort(ds, 0, ds.length - 1, (a, b) =>
        a.gia !== b.gia ? (tang ? a.gia < b.gia : a.gia > b.gia) : a.ma < b.ma);
      return ds;
    }
    sapXepTheoTon(tang) {
      const ds = this.tatCa();
      quickSort(ds, 0, ds.length - 1, (a, b) => {
        const x = MH.tongTon(a), y = MH.tongTon(b);
        return x !== y ? (tang ? x < y : x > y) : a.ma < b.ma;
      });
      return ds;
    }

    // ====================== Tổng giá trị tồn kho (TongGiaTri.h) ======================
    tongGiaTriTonKho() { return this.tatCa().reduce((t, sp) => t + MH.giaTriTon(sp), 0); }
    tongGiaTriHetHan() { return this.tatCa().reduce((t, sp) => t + MH.giaTriHetHan(sp), 0); }
    tongSoLuongTon() { return this.tatCa().reduce((t, sp) => t + MH.tongTon(sp), 0); }

    // ====================== Nhập kho (NhapXuat.h) ======================
    nhapKho(o) {
      const sp = this.tim(o.ma);
      if (!sp) return { ok: false, msg: 'Mặt hàng chưa có trong hệ thống, hãy thêm mặt hàng trước!' };
      const maLo = (o.maLo || '').trim().toUpperCase();
      const viTri = (o.viTri || '').trim();
      const ncc = (o.ncc || '').trim();
      if (!maLo) return { ok: false, msg: 'Mã lô hàng không được để trống.' };
      if (!Number.isInteger(o.sl) || o.sl < 1 || o.sl > 1000000)
        return { ok: false, msg: 'Số lượng nhập phải là số nguyên trong [1, 1.000.000].' };
      if (!o.hsd) return { ok: false, msg: 'Hạn sử dụng không hợp lệ (dd/mm/yyyy).' };
      if (!viTri) return { ok: false, msg: 'Vị trí kho không được để trống.' };
      if (!ncc) return { ok: false, msg: 'Nhà cung cấp không được để trống.' };
      const lo = { maLo, sl: o.sl, hsd: o.hsd, viTri };
      const daHetHan = !conHan(lo);
      if (!MH.nhapLo(sp, lo))
        return {
          ok: false,
          msg: 'Mã lô ' + maLo + ' đã tồn tại với hạn sử dụng KHÁC. Hãy dùng mã lô mới cho đợt hàng này!',
        };
      const pn = {
        maPhieuNhap: taoMa('PN', this.phieuNhaps.length + 1), ngayNhap: Ngay.homNay(),
        nhaCungCap: ncc, maSanPham: sp.ma, maLoHang: maLo, soLuong: o.sl,
      };
      this.phieuNhaps.push(pn);
      this.tuDongLuu();
      return {
        ok: true, phieu: pn, canhBao: daHetHan ? 'Lô hàng này ĐÃ HẾT HẠN, sẽ không thể xuất.' : null,
        msg: 'Đã lập phiếu ' + pn.maPhieuNhap + '. Tồn mới của ' + sp.ma + ': ' + MH.tongTon(sp),
      };
    }

    // ====================== Xuất kho (NhapXuat.h) ======================
    /** Kiểm tra một dòng của phiếu xuất. daCo = số lượng đã đưa vào phiếu cho mã này */
    kiemTraDongXuat(ma, sl, daCo) {
      const sp = this.tim(ma);
      if (!sp) return { ok: false, msg: 'Không tìm thấy mặt hàng!' };
      const conLai = MH.tonXuatDuoc(sp) - (daCo || 0);
      if (conLai <= 0) return { ok: false, msg: 'Hết hàng (hoặc chỉ còn lô quá hạn)!' };
      if (!Number.isInteger(sl) || sl < 1) return { ok: false, msg: 'Số lượng phải là số nguyên >= 1.' };
      if (sl > conLai) return { ok: false, msg: 'Không đủ hàng trong kho! Chỉ có thể xuất tối đa ' + conLai + '.' };
      return { ok: true, sp, conLai };
    }

    /** items: [{ma, sl}] (mỗi mã một dòng). Trừ tồn thật sự theo FEFO và lập phiếu PXxxxx */
    xuatKho(items) {
      if (!items.length) return { ok: false, msg: 'Phiếu xuất trống.' };
      // kiểm tra lại toàn bộ trước khi trừ kho
      for (const it of items) {
        const r = this.kiemTraDongXuat(it.ma, it.sl, 0);
        if (!r.ok) return { ok: false, msg: it.ma + ': ' + r.msg };
      }
      const px = {
        maPhieuXuat: taoMa('PX', this.phieuXuats.length + 1), ngayXuat: Ngay.homNay(),
        chiTiet: [], tongTien: 0,
      };
      const canhBao = [];
      for (const it of items) {
        const sp = this.tim(it.ma);
        px.chiTiet.push({
          maSanPham: sp.ma, tenSanPham: sp.ten, soLuong: it.sl, donGia: sp.gia, thanhTien: it.sl * sp.gia,
        });
        MH.xuatFEFO(sp, it.sl);
        if (MH.canCanhBao(sp))
          canhBao.push(sp.ma + ' - ' + sp.ten + ' (còn ' + MH.tongTon(sp) + ', min ' + sp.min + ')');
      }
      px.tongTien = px.chiTiet.reduce((t, c) => t + c.thanhTien, 0);
      this.phieuXuats.push(px);
      this.tuDongLuu();
      return { ok: true, phieu: px, canhBao, msg: 'Xuất kho thành công! Đã lập phiếu ' + px.maPhieuXuat };
    }

    // ====================== Hủy hàng hết hạn (XuatHuy.h) ======================
    loHetHan() {
      const ds = [];
      for (const sp of this.tatCa())
        for (const l of sp.los)
          if (!conHan(l)) ds.push({ ma: sp.ma, ten: sp.ten, gia: sp.gia, lo: l });
      return ds;
    }
    huyHangHetHan() {
      const ds = this.loHetHan();
      if (!ds.length) return { ok: false, msg: 'Không có lô hàng hết hạn.' };
      const ph = {
        maPhieuHuy: taoMa('PH', this.phieuHuys.length + 1), ngayHuy: Ngay.homNay(),
        lyDo: 'Hết hạn sử dụng', chiTiet: [], tongTien: 0,
      };
      for (const sp of this.tatCa()) {
        for (const l of MH.huyLoHetHan(sp)) {
          ph.chiTiet.push({
            maSanPham: sp.ma, tenSanPham: sp.ten, maLoHang: l.maLo, hanSuDung: l.hsd,
            soLuong: l.sl, donGia: sp.gia, thanhTien: l.sl * sp.gia,
          });
        }
      }
      ph.tongTien = ph.chiTiet.reduce((t, c) => t + c.thanhTien, 0);
      if (!ph.chiTiet.length) {
        this.tuDongLuu();
        return { ok: true, phieu: null, msg: 'Các lô hết hạn không còn hàng tồn, đã dọn khỏi kho (không lập phiếu).' };
      }
      this.phieuHuys.push(ph);
      this.tuDongLuu();
      return { ok: true, phieu: ph, msg: 'Đã hủy hàng hết hạn và lập phiếu ' + ph.maPhieuHuy };
    }

    // ====================== Cảnh báo & thống kê (ThongKe.h) ======================
    canhBaoSapHet() { return this.tatCa().filter(MH.canCanhBao); }
    canhBaoHetHan() {
      const ds = [];
      for (const sp of this.tatCa())
        for (const l of sp.los)
          if (!conHan(l) && l.sl > 0) ds.push({ ma: sp.ma, ten: sp.ten, gia: sp.gia, lo: l });
      return ds;
    }
    thongKeTong() {
      return { soPhieu: this.phieuXuats.length, tong: this.phieuXuats.reduce((t, h) => t + h.tongTien, 0) };
    }
    thongKeNgay(ngay) {
      const ds = this.phieuXuats.filter((h) => Ngay.key(h.ngayXuat) === Ngay.key(ngay));
      return { soPhieu: ds.length, tong: ds.reduce((t, h) => t + h.tongTien, 0) };
    }
    thongKeThang(m, y) {
      const ds = this.phieuXuats.filter((h) => h.ngayXuat.m === m && h.ngayXuat.y === y);
      return { soPhieu: ds.length, tong: ds.reduce((t, h) => t + h.tongTien, 0) };
    }
    topXuat(n) {
      const bh = new Map();
      for (const h of this.phieuXuats)
        for (const c of h.chiTiet) {
          const e = bh.get(c.maSanPham) || { ma: c.maSanPham, ten: c.tenSanPham, sl: 0, giaTri: 0 };
          e.sl += c.soLuong; e.giaTri += c.thanhTien; e.ten = c.tenSanPham;
          bh.set(c.maSanPham, e);
        }
      return quickSort(Array.from(bh.values()), (a, b) => (a.sl !== b.sl ? a.sl > b.sl : a.ma < b.ma)).slice(0, n || 5);
    }
    thongKeHuy() {
      let sl = 0;
      for (const h of this.phieuHuys) for (const c of h.chiTiet) sl += c.soLuong;
      return { soPhieu: this.phieuHuys.length, tongSL: sl, tong: this.phieuHuys.reduce((t, h) => t + h.tongTien, 0) };
    }

    // ====================== Dữ liệu mẫu (DuLieuMau.h) ======================
    napDuLieuMau() {
      this.cay.clear();
      this.phieuXuats = []; this.phieuNhaps = []; this.phieuHuys = [];
      this.nhatKyQuay = [];
      const mau = [
        ['SP001', 'Gạo ST25 5kg', 120000, 20, 100],
        ['SP002', 'Đường tinh luyện 1kg', 25000, 30, 60],
        ['SP003', 'Dầu ăn Neptune 1L', 58000, 15, 12],
        ['SP004', 'Nước mắm Nam Ngư 500ml', 42000, 20, 45],
        ['SP005', 'Mì gói Hảo Hảo (thùng)', 110000, 10, 8],
        ['SP006', 'Sữa tươi Vinamilk 1L', 32000, 25, 70],
        ['SP007', 'Xà phòng Lifebuoy', 18000, 15, 90],
        ['SP008', 'Nước ngọt Coca 1.5L', 24000, 30, 15],
        ['SP009', 'Bánh quy Cosy', 36000, 10, 50],
        ['SP010', 'Cà phê G7 hộp 18 gói', 52000, 12, 35],
      ];
      const log = [];
      let stt = 0;
      for (const m of mau) {
        stt++;
        const sp = { ma: m[0], ten: m[1], gia: m[2], min: m[3], los: [] };
        MH.nhapLo(sp, {
          maLo: 'L' + stt, sl: m[4], hsd: { d: 31, m: 12, y: Ngay.homNay().y + 1 },
          viTri: 'KE-' + String.fromCharCode(65 + (stt % 4)) + (1 + (stt % 3)),
        });
        this.cay.insert(m[0], sp);                       // chèn tăng dần -> kích hoạt phép quay
        this.ghiNhatKy('Chèn', m[0]);
        log.push({ ma: m[0], events: this.cay.events.slice() });
      }
      // thêm 1 lô đã hết hạn để demo cảnh báo hạn sử dụng và hủy hàng
      MH.nhapLo(this.cay.search('SP006'), { maLo: 'L-CU', sl: 5, hsd: { d: 1, m: 1, y: 2024 }, viTri: 'KE-Z9' });
      this.tuDongLuu();
      return {
        ok: true, log,
        msg: 'Đã nạp 10 mặt hàng mẫu. Cây: ' + this.cay.size + ' nút, chiều cao = ' + this.cay.height,
      };
    }

    xoaTatCa() {
      this.cay.clear();
      this.phieuXuats = []; this.phieuNhaps = []; this.phieuHuys = [];
      this.nhatKyQuay = [];
      this.tuDongLuu();
    }

    // ====================== Lưu trữ (LuuTru.h + FileIO.h) ======================
    /** Chuyển toàn bộ dữ liệu thành đối tượng thuần. Mặt hàng ghi theo thứ tự BFS của cây
     *  (cha trước con) để đọc lại dựng ĐÚNG hình dạng cũ, không phát sinh phép quay. */
    toData() {
      return {
        magic: 'AVL1',
        luuLuc: new Date().toISOString(),
        matHang: this.cay.bfsNodes().map((n) => n.data),
        phieuXuat: this.phieuXuats,
        phieuNhap: this.phieuNhaps,
        phieuHuy: this.phieuHuys,
      };
    }
    static kiemTraNgay(x) {
      return x && Number.isInteger(x.d) && Number.isInteger(x.m) && Number.isInteger(x.y) && Ngay.hopLe(x.d, x.m, x.y);
    }
    /** Nạp dữ liệu; chỉ thay đổi trạng thái hiện tại khi toàn bộ dữ liệu hợp lệ */
    fromData(o) {
      if (!o || o.magic !== 'AVL1' || !Array.isArray(o.matHang))
        return { ok: false, msg: 'Tệp không đúng định dạng (thiếu "magic": "AVL1").' };
      const cay = new AVLTree();
      for (const sp of o.matHang) {
        if (!sp || typeof sp.ma !== 'string' || !sp.ma || typeof sp.ten !== 'string' ||
            !(sp.gia >= 0) || !Number.isInteger(sp.min) || !Array.isArray(sp.los))
          return { ok: false, msg: 'Dữ liệu mặt hàng không hợp lệ: ' + JSON.stringify(sp && sp.ma) };
        for (const l of sp.los)
          if (!l || typeof l.maLo !== 'string' || !Number.isInteger(l.sl) || l.sl < 0 || !QuanLyKho.kiemTraNgay(l.hsd))
            return { ok: false, msg: 'Lô hàng của ' + sp.ma + ' không hợp lệ.' };
        if (!cay.insert(sp.ma, sp)) return { ok: false, msg: 'Trùng mã mặt hàng: ' + sp.ma };
      }
      const mang = (a) => (Array.isArray(a) ? a : []);
      this.cay = cay;
      this.cay.rot = { LL: 0, RR: 0, LR: 0, RL: 0 };      // đọc từ file: không tính phép quay
      this.phieuXuats = mang(o.phieuXuat);
      this.phieuNhaps = mang(o.phieuNhap);
      this.phieuHuys = mang(o.phieuHuy);
      this.nhatKyQuay = [];
      return { ok: true, msg: 'Đã đọc ' + cay.size + ' mặt hàng, ' + this.phieuXuats.length + ' phiếu xuất.' };
    }

    tuDongLuu() {
      const ls = luuTru();
      if (!ls) { this.loiLuu = 'Trình duyệt không cho phép lưu dữ liệu (localStorage bị tắt).'; return false; }
      try {
        ls.setItem(KHOA_LUU, JSON.stringify(this.toData()));
        this.loiLuu = null;
        return true;
      } catch (e) {
        this.loiLuu = 'Không ghi được dữ liệu: ' + e.message;
        return false;
      }
    }
    docBoNho() {
      const ls = luuTru();
      if (!ls) return { ok: false, msg: 'Trình duyệt không cho phép đọc localStorage.' };
      let s;
      try { s = ls.getItem(KHOA_LUU); } catch (e) { return { ok: false, msg: e.message }; }
      if (!s) return { ok: false, msg: 'Chưa có dữ liệu đã lưu.' };
      try { return this.fromData(JSON.parse(s)); } catch (e) { return { ok: false, msg: 'Dữ liệu lưu bị lỗi: ' + e.message }; }
    }
    khoiDong() {
      const r = this.docBoNho();
      return r.ok ? r : { ok: false, msg: 'Chưa có dữ liệu (hoặc dữ liệu lỗi). Bắt đầu với kho rỗng.' };
    }

    /** Xuất kho ra CSV (mở được bằng Excel): mỗi dòng = 1 lô của 1 mặt hàng */
    xuatCSV() {
      const dong = [['Mã mặt hàng', 'Tên mặt hàng', 'Giá bán', 'Tồn tối thiểu', 'Tổng tồn', 'Mã lô', 'SL lô',
        'Hạn sử dụng', 'Vị trí kho', 'Trạng thái lô', 'Giá trị tồn (lô)']];
      for (const sp of this.tatCa()) {
        const dau = [sp.ma, sp.ten, sp.gia, sp.min, MH.tongTon(sp)];
        if (!sp.los.length) { dong.push(dau.concat(['', '', '', '', '', ''])); continue; }
        for (const l of sp.los)
          dong.push(dau.concat([l.maLo, l.sl, Ngay.str(l.hsd), l.viTri, conHan(l) ? 'Còn hạn' : 'Hết hạn', l.sl * sp.gia]));
      }
      const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
      return '\uFEFF' + dong.map((r) => r.map(q).join(',')).join('\r\n');
    }
  }

  // ====================== Tài khoản (TaiKhoan.h) ======================
  // 2 chế độ: KHÁCH (chỉ xem) và ADMIN. Mặc định lần đầu: admin / admin123
  const TaiKhoan = {
    TEN: 'admin',
    matKhau() {
      const ls = luuTru();
      try { return (ls && ls.getItem(KHOA_MK)) || MK_MAC_DINH; } catch (e) { return MK_MAC_DINH; }
    },
    dangNhap(u, p) { return (u || '').trim().toLowerCase() === TaiKhoan.TEN && p === TaiKhoan.matKhau(); },
    doiMatKhau(cu, moi, nhapLai) {
      if (cu !== TaiKhoan.matKhau()) return { ok: false, msg: 'Mật khẩu hiện tại không đúng!' };
      if ((moi || '').length < 6) return { ok: false, msg: 'Mật khẩu mới quá ngắn (>= 6 ký tự).' };
      if (moi !== nhapLai) return { ok: false, msg: 'Hai lần nhập mật khẩu không khớp!' };
      const ls = luuTru();
      try { ls.setItem(KHOA_MK, moi); } catch (e) { return { ok: false, msg: 'Không lưu được mật khẩu: ' + e.message }; }
      return { ok: true, msg: 'Đã đổi mật khẩu.' };
    },
  };

  const API = { QuanLyKho, TaiKhoan, MH, Ngay, conHan, tien, so, pad };
  Object.assign(root, { SieuThi: API });
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
