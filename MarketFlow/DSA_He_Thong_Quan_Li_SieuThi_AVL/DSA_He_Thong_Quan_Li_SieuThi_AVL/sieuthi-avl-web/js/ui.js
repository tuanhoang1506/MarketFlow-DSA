/* ============================================================================
 * ui.js - Giao diện: đăng nhập, điều hướng, các trang chức năng, vẽ cây AVL (SVG)
 * Tương ứng menu 20 chức năng trong main.cpp (xem README để đối chiếu).
 * ========================================================================== */
(function () {
  'use strict';

  const { QuanLyKho, TaiKhoan, MH, Ngay, conHan, tien, so } = window.SieuThi;
  const kho = new QuanLyKho();
  window.kho = kho; // tiện gỡ lỗi / demo trong Console (F12)

  // ====================== Tiện ích ======================
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = (v) => (String(v).trim() === '' ? NaN : Number(v));
  const ngayInput = (x) => Ngay.raInput(x);

  function toast(msg, kind) {
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), kind === 'bad' ? 6500 : 4200);
  }
  const kq = (r) => toast(r.msg, r.ok ? 'ok' : 'bad');

  // ---- Hộp thoại ----
  function modal(html, wide) {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = '<div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    ov.addEventListener('mousedown', (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov);
    const first = $('input:not([disabled]), select, button', ov);
    if (first) first.focus();
    return ov;
  }
  function confirmBox(tieuDe, noiDung, nutOk, nguyHiem) {
    return new Promise((resolve) => {
      const ov = modal('<h2>' + esc(tieuDe) + '</h2><div>' + noiDung + '</div><div class="actions">' +
        '<button class="btn" data-r="0">Hủy</button><button class="btn ' + (nguyHiem ? 'danger' : 'primary') +
        '" data-r="1">' + esc(nutOk || 'Đồng ý') + '</button></div>');
      ov.addEventListener('click', (e) => {
        const b = e.target.closest('[data-r]');
        if (b) { ov.remove(); resolve(b.dataset.r === '1'); }
      });
      ov.addEventListener('mousedown', (e) => { if (e.target === ov) resolve(false); });
    });
  }
  function closeModal(el) { const ov = el.closest('.overlay'); if (ov) ov.remove(); }

  // ====================== Vẽ cây AVL (SVG) ======================
  function veCay(tree, opt) {
    opt = opt || {};
    const hl = new Set(opt.hl || []), rot = new Set(opt.rot || []);
    const L = tree.layout();
    if (!L.nodes.length) return '<div class="empty">Cây rỗng — chưa có nút nào.</div>';
    const maxLen = Math.max.apply(null, L.nodes.map((n) => String(n.key).length));
    const nw = Math.max(46, maxLen * 8.2 + 18), nh = 30, gx = nw + 16, gy = 84, pd = 20;
    const W = L.cols * gx + pd * 2, Hh = L.depth * gy + pd * 2 - 20;
    const X = (n) => pd + n.col * gx + gx / 2;
    const Y = (n) => pd + n.depth * gy + nh / 2;
    let s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + Hh + '" viewBox="0 0 ' + W + ' ' + Hh +
      '" role="img" aria-label="Cây AVL">';
    for (const e of L.edges)
      s += '<line class="t-edge" x1="' + X(e[0]) + '" y1="' + (Y(e[0]) + nh / 2) + '" x2="' + X(e[1]) + '" y2="' + (Y(e[1]) - nh / 2) + '"/>';
    for (const n of L.nodes) {
      const cls = ['t-node'];
      const ab = Math.abs(n.bf);
      if (ab === 1) cls.push('bf1'); else if (ab > 1) cls.push('bf2');
      if (hl.has(n.key)) cls.push('hl');
      if (rot.has(n.key)) cls.push('rot');
      s += '<g class="' + cls.join(' ') + '"><title>' + esc(n.key) + ': h=' + n.h + ', bf=' + n.bf + '</title>' +
        '<rect x="' + (X(n) - nw / 2) + '" y="' + (Y(n) - nh / 2) + '" width="' + nw + '" height="' + nh + '" rx="8"/>' +
        '<text class="key" x="' + X(n) + '" y="' + (Y(n) + 4.5) + '">' + esc(n.key) + '</text>' +
        '<text class="sub" x="' + X(n) + '" y="' + (Y(n) + nh / 2 + 14) + '">h=' + n.h + ' bf=' + n.bf + '</text></g>';
    }
    return s + '</svg>';
  }
  const chuThichCay = '<div class="legend"><span><i></i>bf = 0</span>' +
    '<span><i style="border-color:#d97706"></i>|bf| = 1 (vẫn hợp lệ)</span>' +
    '<span><i style="border-color:#dc2626"></i>|bf| &gt; 1 (mất cân bằng — chỉ xảy ra ở cây BST thường)</span>' +
    '<span><i style="background:#15803d;border-color:#15803d"></i>nút đang được chọn / đường tìm kiếm</span>' +
    '<span><i style="background:#f59e0b;border-color:#b45309"></i>nút vừa được quay</span></div>';

  // ====================== Bảng dùng chung ======================
  function trangThai(sp) {
    let s = MH.canCanhBao(sp) ? '<span class="badge warn">SẮP HẾT!</span>' : '<span class="badge ok">OK</span>';
    if (MH.coLoHetHan(sp)) s += ' <span class="badge bad">có lô hết hạn</span>';
    return s;
  }
  function bangMH(ds, hanhDong) {
    if (!ds.length) return '<div class="empty">Không có mặt hàng nào.</div>';
    const ad = hanhDong && state.role === 'admin';
    let h = '<div class="table-wrap"><table><thead><tr><th>Mã</th><th>Tên mặt hàng</th><th class="num">Giá bán</th>' +
      '<th class="num">Tồn</th><th class="num">Min</th><th>Trạng thái</th>' + (hanhDong ? '<th></th>' : '') + '</tr></thead><tbody>';
    for (const sp of ds) {
      h += '<tr><td><b class="mono">' + esc(sp.ma) + '</b></td><td>' + esc(sp.ten) + '</td><td class="num">' + so(sp.gia) +
        '</td><td class="num">' + so(MH.tongTon(sp)) + '</td><td class="num">' + so(sp.min) + '</td><td>' + trangThai(sp) + '</td>';
      if (hanhDong) {
        h += '<td class="right"><div class="btn-row" style="justify-content:flex-end">' +
          '<button class="btn sm" data-act="chiTiet" data-ma="' + esc(sp.ma) + '">Chi tiết lô</button>' +
          (ad ? '<button class="btn sm" data-act="sua" data-ma="' + esc(sp.ma) + '">Sửa</button>' +
            '<button class="btn sm danger" data-act="xoa" data-ma="' + esc(sp.ma) + '">Xóa</button>' : '') +
          '</div></td>';
      }
      h += '</tr>';
    }
    return h + '</tbody></table></div><p class="muted" style="margin-top:8px">⇒ ' + ds.length + ' mặt hàng</p>';
  }
  function bangLo(sp) {
    if (!sp.los.length) return '<p class="muted">(chưa có lô hàng)</p>';
    let h = '<div class="table-wrap"><table><thead><tr><th>Mã lô</th><th class="num">SL</th><th>Hạn sử dụng</th><th>Vị trí</th><th>Trạng thái</th></tr></thead><tbody>';
    for (const l of sp.los)
      h += '<tr><td class="mono">' + esc(l.maLo) + '</td><td class="num">' + so(l.sl) + '</td><td>' + Ngay.str(l.hsd) + '</td><td>' +
        esc(l.viTri) + '</td><td>' + (conHan(l) ? '<span class="badge ok">Còn hạn</span>' : '<span class="badge bad">HẾT HẠN</span>') + '</td></tr>';
    return h + '</tbody></table></div>';
  }
  function bangLoHetHan(ds) {
    if (!ds.length) return '<div class="empty">(không có)</div>';
    let h = '<div class="table-wrap"><table><thead><tr><th>Mã</th><th>Tên</th><th>Mã lô</th><th class="num">SL</th><th>HSD</th><th class="num">Giá trị</th></tr></thead><tbody>';
    for (const e of ds)
      h += '<tr><td class="mono"><b>' + esc(e.ma) + '</b></td><td>' + esc(e.ten) + '</td><td class="mono">' + esc(e.lo.maLo) +
        '</td><td class="num">' + so(e.lo.sl) + '</td><td>' + Ngay.str(e.lo.hsd) + '</td><td class="num">' + tien(e.lo.sl * e.gia) + '</td></tr>';
    return h + '</tbody></table></div>';
  }
  const dsMaOption = () => '<datalist id="dsMa">' + kho.tatCa().map((s) => '<option value="' + esc(s.ma) + '">' + esc(s.ten) + '</option>').join('') + '</datalist>';
  const tabs = (key, ds) => '<div class="tabs">' + ds.map((t) =>
    '<button class="' + (state.tab[key] === t[0] ? 'active' : '') + '" data-act="tab" data-key="' + key + '" data-v="' + t[0] + '">' + esc(t[1]) + '</button>').join('') + '</div>';
  const head = (t, mo, extra) => '<div class="page-head"><div class="grow"><h1>' + t + '</h1>' + (mo ? '<p>' + mo + '</p>' : '') + '</div>' + (extra || '') + '</div>';

  // ====================== Trạng thái ứng dụng ======================
  const state = {
    role: null, page: 'tongquan', fails: 0, tab: {}, timMa: '', gio: [], hlCay: [], rotCay: [],
    tkNgay: ngayInput(Ngay.homNay()), tkThang: Ngay.homNay().m, tkNam: Ngay.homNay().y,
    tcMa: { tu: 'SP002', den: 'SP005' }, tcGia: { tu: '20000', den: '60000' }, sx: '1', sxKq: null,
    lab: null, labLog: null, labRot: [],
  };
  state.tab.tracuu = 'ma'; state.tab.thongke = 'tong';

  const NAV = [
    { g: 'Tổng quan' },
    { id: 'tongquan', t: 'Tổng quan', i: '🏠' },
    { g: 'Mặt hàng' },
    { id: 'mathang', t: 'Danh sách mặt hàng', i: '📦' },
    { id: 'tracuu', t: 'Tra cứu & sắp xếp', i: '🔎' },
    { g: 'Kho' },
    { id: 'nhapkho', t: 'Nhập kho', i: '📥', ad: 1 },
    { id: 'xuatkho', t: 'Xuất kho', i: '📤', ad: 1 },
    { id: 'huy', t: 'Hủy hàng hết hạn', i: '🗑️', ad: 1 },
    { id: 'canhbao', t: 'Cảnh báo tồn kho', i: '⚠️' },
    { id: 'giatri', t: 'Tổng giá trị tồn kho', i: '💰' },
    { g: 'Thống kê' },
    { id: 'thongke', t: 'Doanh thu / xuất kho / hủy', i: '📊', ad: 1 },
    { g: 'Cây AVL' },
    { id: 'cayavl', t: 'Cấu trúc cây AVL', i: '🌳' },
    { id: 'lab', t: 'Phòng thí nghiệm AVL', i: '🧪' },
    { g: 'Hệ thống' },
    { id: 'dulieu', t: 'Dữ liệu & tệp', i: '💾', ad: 1 },
    { id: 'taikhoan', t: 'Đổi mật khẩu', i: '🔑', ad: 1 },
  ];
  const trang = (id) => NAV.find((n) => n.id === id);

  // ====================== Các trang ======================
  const PAGES = {};

  // ---- Tổng quan ----
  PAGES.tongquan = {
    html() {
      const ds = kho.tatCa(), sapHet = kho.canhBaoSapHet(), hetHan = kho.canhBaoHetHan();
      const dt = kho.thongKeTong();
      let h = head('Tổng quan kho', 'Mặt hàng được lưu trong <b>cây AVL</b> theo mã vạch: tìm, thêm, xóa đều O(log n).');
      if (!ds.length) {
        h += '<div class="note">Kho đang rỗng. ' + (state.role === 'admin'
          ? '<button class="btn primary sm" data-act="napMau">Nạp 10 mặt hàng mẫu</button> để xem ngay các phép quay AVL, hoặc vào <b>Danh sách mặt hàng</b> để thêm.'
          : 'Hãy đăng nhập admin để thêm dữ liệu.') + '</div>';
      }
      h += '<div class="grid g4" style="margin-bottom:18px">' +
        '<div class="stat"><div class="lbl">Số mặt hàng (nút của cây)</div><div class="val">' + ds.length + '</div></div>' +
        '<div class="stat"><div class="lbl">Tổng số lượng tồn</div><div class="val">' + so(kho.tongSoLuongTon()) + '</div></div>' +
        '<div class="stat ok"><div class="lbl">Tổng giá trị tồn kho</div><div class="val">' + tien(kho.tongGiaTriTonKho()) + '</div></div>' +
        '<div class="stat"><div class="lbl">Doanh thu (tổng giá trị xuất)</div><div class="val">' + tien(dt.tong) + '</div></div>' +
        '<div class="stat ' + (sapHet.length ? 'warn' : '') + '"><div class="lbl">Mặt hàng sắp hết</div><div class="val">' + sapHet.length + '</div></div>' +
        '<div class="stat ' + (hetHan.length ? 'bad' : '') + '"><div class="lbl">Lô đã hết hạn còn tồn</div><div class="val">' + hetHan.length + '</div></div>' +
        '<div class="stat"><div class="lbl">Chiều cao cây AVL</div><div class="val">' + kho.cay.height + '</div></div>' +
        '<div class="stat"><div class="lbl">Số phiếu (nhập / xuất / hủy)</div><div class="val">' + kho.phieuNhaps.length + ' / ' + kho.phieuXuats.length + ' / ' + kho.phieuHuys.length + '</div></div></div>';
      const toiDa = ds.length ? Math.ceil(1.44 * Math.log2(ds.length + 2)) : 0;
      h += '<div class="grid g2"><div class="card"><h2>Cần chú ý</h2>';
      if (!sapHet.length && !hetHan.length) h += '<p class="muted">Không có cảnh báo nào. 👍</p>';
      sapHet.slice(0, 5).forEach((sp) => { h += '<p><span class="badge warn">SẮP HẾT</span> <b class="mono">' + esc(sp.ma) + '</b> ' + esc(sp.ten) + ' — còn ' + MH.tongTon(sp) + ' (min ' + sp.min + ')</p>'; });
      hetHan.slice(0, 5).forEach((e) => { h += '<p><span class="badge bad">HẾT HẠN</span> <b class="mono">' + esc(e.ma) + '</b> lô ' + esc(e.lo.maLo) + ' — ' + e.lo.sl + ' (HSD ' + Ngay.str(e.lo.hsd) + ')</p>'; });
      h += '<button class="btn sm" data-act="go" data-p="canhbao">Xem tất cả cảnh báo</button></div>' +
        '<div class="card"><h2>Vì sao dùng cây AVL?</h2>' +
        '<p>Cây nhị phân thường có thể lệch thành danh sách liên kết (O(n)) khi nhập mã theo thứ tự tăng dần. AVL tự cân bằng bằng phép quay nên chiều cao luôn ≤ ~1,44·log₂(n).</p>' +
        '<p>Với <b>' + ds.length + '</b> mặt hàng, cây này cao <b>' + kho.cay.height + '</b> (tối đa lý thuyết ≈ ' + toiDa + '): mỗi lần tìm chỉ cần tối đa ' + kho.cay.height + ' phép so sánh.</p>' +
        '<div class="btn-row"><button class="btn sm" data-act="go" data-p="cayavl">Xem cây AVL</button><button class="btn sm" data-act="go" data-p="lab">Thử nghiệm AVL vs BST</button></div></div></div>';
      return h;
    },
  };

  // ---- Danh sách mặt hàng (1,2,3,4,7) ----
  PAGES.mathang = {
    html() {
      let h = head('Danh sách mặt hàng', 'Duyệt LNR trên cây AVL: luôn tăng dần theo mã.',
        state.role === 'admin' ? '<button class="btn primary" data-act="them">＋ Thêm mặt hàng</button>' : '');
      h += '<div class="card"><form data-form="tim" class="form-grid" style="grid-template-columns:minmax(200px,320px) auto auto">' +
        '<div><label>Tìm theo mã (tìm kiếm nhị phân trên cây AVL)</label><input name="ma" list="dsMa" placeholder="VD: SP004" value="' + esc(state.timMa) + '" autocomplete="off"></div>' +
        '<button class="btn primary">Tìm</button>' + (state.timMa ? '<button type="button" class="btn" data-act="xoaTim">Xóa kết quả</button>' : '<span></span>') + '</form>' + dsMaOption();
      if (state.timMa) {
        const sp = kho.tim(state.timMa), p = kho.timDuongDi(state.timMa);
        h += '<div style="margin-top:14px"><div class="muted" style="margin-bottom:6px">Đường đi từ gốc (' + p.path.length + ' bước / ' + kho.cay.size + ' nút):</div><div class="path">' +
          p.path.map((k, i) => (i ? '<span class="arrow">→</span>' : '') + '<span class="step' + (p.found && i === p.path.length - 1 ? ' hit' : '') + '">' + esc(k) + '</span>').join('') +
          (p.found ? '' : '<span class="arrow">→</span><span class="badge bad">không có</span>') + '</div>';
        if (sp) h += '<div style="margin-top:12px">' + bangMH([sp], true) + '<h3 style="margin-top:10px">Chi tiết các lô</h3>' + bangLo(sp) + '</div>';
        else h += '<div class="note bad" style="margin-top:12px">Không tìm thấy mặt hàng có mã <b>' + esc(state.timMa.toUpperCase()) + '</b>.</div>';
        h += '</div>';
      }
      h += '</div><div class="card"><h2>Tất cả mặt hàng</h2>' + bangMH(kho.tatCa(), true) + '</div>';
      return h;
    },
  };

  // ---- Tra cứu & sắp xếp (5, 6, 8) ----
  PAGES.tracuu = {
    html() {
      const t = state.tab.tracuu;
      let h = head('Tra cứu & sắp xếp', 'Range search trên cây AVL và sắp xếp bằng Quick Sort tự cài đặt.') +
        tabs('tracuu', [['ma', 'Khoảng mã (Range Search)'], ['gia', 'Khoảng giá'], ['sx', 'Sắp xếp (Quick Sort)']]) + '<div class="card">';
      if (t === 'ma') {
        h += '<form data-form="tcMa" class="form-grid"><div><label>Từ mã</label><input name="tu" value="' + esc(state.tcMa.tu) + '" list="dsMa"></div>' +
          '<div><label>Đến mã</label><input name="den" value="' + esc(state.tcMa.den) + '" list="dsMa"></div><button class="btn primary">Tra cứu</button></form>' + dsMaOption() +
          '<p class="hint">Cắt nhánh: bỏ qua cả nhánh nằm ngoài khoảng nên độ phức tạp O(log n + k).</p><div id="kq">' + (state.tcMaKq || '') + '</div>';
      } else if (t === 'gia') {
        h += '<form data-form="tcGia" class="form-grid"><div><label>Giá từ (đ)</label><input name="tu" type="number" min="0" step="any" value="' + esc(state.tcGia.tu) + '"></div>' +
          '<div><label>Giá đến (đ)</label><input name="den" type="number" min="0" step="any" value="' + esc(state.tcGia.den) + '"></div><button class="btn primary">Tra cứu</button></form>' +
          '<div id="kq">' + (state.tcGiaKq || '') + '</div>';
      } else {
        h += '<form data-form="sx" class="form-grid"><div><label>Tiêu chí</label><select name="c">' +
          [['1', 'Giá bán — tăng dần'], ['2', 'Giá bán — giảm dần'], ['3', 'Số lượng tồn — tăng dần'], ['4', 'Số lượng tồn — giảm dần']]
            .map((o) => '<option value="' + o[0] + '"' + (state.sx === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') +
          '</select></div><button class="btn primary">Sắp xếp</button></form>' +
          '<p class="hint">Quick Sort median-of-three; khi bằng nhau thì xếp theo mã tăng dần để kết quả ổn định, dễ kiểm tra.</p><div id="kq">' + (state.sxKq || '') + '</div>';
      }
      return h + '</div>';
    },
  };

  // ---- Nhập kho (9) ----
  PAGES.nhapkho = {
    html() {
      const hn = Ngay.homNay();
      let h = head('Nhập kho', 'Lập phiếu nhập PNxxxx. Mỗi mặt hàng có nhiều lô với hạn sử dụng khác nhau.') +
        '<div class="note">Cùng <b>mã lô</b> chỉ được cộng dồn khi <b>cùng hạn sử dụng</b>. Cùng mã lô nhưng khác hạn sẽ bị từ chối — hãy dùng mã lô mới để không lẫn hàng cũ với hàng mới.</div>' +
        '<div class="card"><form data-form="nhap" class="form-grid">' +
        '<div><label>Mã mặt hàng</label><input name="ma" list="dsMa" required autocomplete="off"></div>' +
        '<div><label>Mã lô hàng</label><input name="maLo" required placeholder="VD: L11"></div>' +
        '<div><label>Số lượng nhập</label><input name="sl" type="number" min="1" max="1000000" step="1" required></div>' +
        '<div><label>Hạn sử dụng</label><input name="hsd" type="date" required value="' + ngayInput({ d: hn.d, m: hn.m, y: hn.y + 1 }) + '"></div>' +
        '<div><label>Vị trí kho</label><input name="viTri" required placeholder="VD: KE-A1"></div>' +
        '<div><label>Nhà cung cấp</label><input name="ncc" required></div>' +
        '<button class="btn primary">Lập phiếu nhập</button></form>' + dsMaOption() + '</div>';
      const ds = kho.phieuNhaps.slice(-10).reverse();
      h += '<div class="card"><h2>Phiếu nhập gần đây</h2>';
      if (!ds.length) h += '<div class="empty">Chưa có phiếu nhập.</div>';
      else {
        h += '<div class="table-wrap"><table><thead><tr><th>Phiếu</th><th>Ngày</th><th>Mã</th><th>Lô</th><th class="num">SL</th><th>Nhà cung cấp</th></tr></thead><tbody>';
        ds.forEach((p) => { h += '<tr><td class="mono"><b>' + p.maPhieuNhap + '</b></td><td>' + Ngay.str(p.ngayNhap) + '</td><td class="mono">' + esc(p.maSanPham) + '</td><td class="mono">' + esc(p.maLoHang) + '</td><td class="num">' + so(p.soLuong) + '</td><td>' + esc(p.nhaCungCap) + '</td></tr>'; });
        h += '</tbody></table></div>';
      }
      return h + '</div>';
    },
  };

  // ---- Xuất kho (10) ----
  const tongGio = () => state.gio.reduce((t, g) => t + g.sl * g.gia, 0);
  PAGES.xuatkho = {
    html() {
      let h = head('Xuất kho', 'Lập phiếu xuất PXxxxx. Tồn kho được trừ theo <b>FEFO</b>: lô hết hạn sớm nhất xuất trước, bỏ qua lô quá hạn.') +
        '<div class="card"><form data-form="gioThem" class="form-grid">' +
        '<div><label>Mã mặt hàng</label><input name="ma" id="xMa" list="dsMa" required autocomplete="off" data-act-input="infoXuat"></div>' +
        '<div><label>Số lượng xuất</label><input name="sl" type="number" min="1" step="1" required></div>' +
        '<button class="btn primary">Thêm vào phiếu</button></form><div id="infoXuat" class="hint" style="margin-top:8px"></div>' + dsMaOption() + '</div>';
      h += '<div class="card"><h2>Phiếu xuất đang lập</h2>';
      if (!state.gio.length) h += '<div class="empty">Phiếu trống. Hãy thêm mặt hàng ở trên.</div>';
      else {
        h += '<div class="table-wrap"><table><thead><tr><th>Mã</th><th>Tên</th><th class="num">SL</th><th class="num">Đơn giá</th><th class="num">Thành tiền</th><th></th></tr></thead><tbody>';
        state.gio.forEach((g, i) => { h += '<tr><td class="mono"><b>' + esc(g.ma) + '</b></td><td>' + esc(g.ten) + '</td><td class="num">' + so(g.sl) + '</td><td class="num">' + so(g.gia) + '</td><td class="num">' + tien(g.sl * g.gia) + '</td><td class="right"><button class="btn sm danger" data-act="gioXoa" data-i="' + i + '">Bỏ</button></td></tr>'; });
        h += '</tbody><tfoot><tr><td colspan="4">TỔNG GIÁ TRỊ XUẤT</td><td class="num">' + tien(tongGio()) + '</td><td></td></tr></tfoot></table></div>' +
          '<div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="xacNhanXuat">Xác nhận xuất kho</button><button class="btn" data-act="gioHuy">Hủy phiếu</button></div>';
      }
      h += '</div>';
      const ds = kho.phieuXuats.slice(-5).reverse();
      if (ds.length) {
        h += '<div class="card"><h2>Phiếu xuất gần đây</h2><div class="table-wrap"><table><thead><tr><th>Phiếu</th><th>Ngày</th><th class="num">Số dòng</th><th class="num">Tổng giá trị</th></tr></thead><tbody>';
        ds.forEach((p) => { h += '<tr><td class="mono"><b>' + p.maPhieuXuat + '</b></td><td>' + Ngay.str(p.ngayXuat) + '</td><td class="num">' + p.chiTiet.length + '</td><td class="num">' + tien(p.tongTien) + '</td></tr>'; });
        h += '</tbody></table></div></div>';
      }
      return h;
    },
  };

  // ---- Hủy hàng hết hạn (20) ----
  PAGES.huy = {
    html() {
      const ds = kho.loHetHan();
      const gt = ds.reduce((t, e) => t + e.lo.sl * e.gia, 0);
      let h = head('Hủy hàng hết hạn', 'Xóa các lô quá hạn khỏi kho và lập phiếu xuất hủy <b>PHxxxx</b> — tách riêng với phiếu xuất bán nên không làm sai doanh thu.') +
        '<div class="card"><h2>Các lô đã hết hạn</h2>' + bangLoHetHan(ds);
      if (ds.length) h += '<p style="margin-top:10px">⇒ <b>' + ds.length + '</b> lô hết hạn, giá trị <b>' + tien(gt) + '</b></p><button class="btn danger" data-act="huyHet">Hủy toàn bộ lô hết hạn</button>';
      h += '</div>';
      if (kho.phieuHuys.length) {
        h += '<div class="card"><h2>Phiếu xuất hủy đã lập</h2>' + bangPhieuHuy() + '</div>';
      }
      return h;
    },
  };
  function bangPhieuHuy() {
    if (!kho.phieuHuys.length) return '<div class="empty">Chưa có phiếu xuất hủy nào.</div>';
    const t = kho.thongKeHuy();
    let h = '';
    kho.phieuHuys.slice().reverse().forEach((p) => {
      h += '<details style="margin-bottom:8px"><summary><b class="mono">' + p.maPhieuHuy + '</b> — ' + Ngay.str(p.ngayHuy) + ' — ' + esc(p.lyDo) + ' — <b>' + tien(p.tongTien) + '</b></summary>' +
        '<div class="table-wrap" style="margin-top:8px"><table><thead><tr><th>Mã</th><th>Tên</th><th>Lô</th><th>HSD</th><th class="num">SL</th><th class="num">Thành tiền</th></tr></thead><tbody>' +
        p.chiTiet.map((c) => '<tr><td class="mono">' + esc(c.maSanPham) + '</td><td>' + esc(c.tenSanPham) + '</td><td class="mono">' + esc(c.maLoHang) + '</td><td>' + Ngay.str(c.hanSuDung) + '</td><td class="num">' + so(c.soLuong) + '</td><td class="num">' + tien(c.thanhTien) + '</td></tr>').join('') +
        '</tbody></table></div></details>';
    });
    return '<div class="grid g3" style="margin-bottom:12px"><div class="stat"><div class="lbl">Số phiếu hủy</div><div class="val">' + t.soPhieu + '</div></div><div class="stat"><div class="lbl">Tổng số lượng hủy</div><div class="val">' + so(t.tongSL) + '</div></div><div class="stat bad"><div class="lbl">TỔNG GIÁ TRỊ HỦY</div><div class="val">' + tien(t.tong) + '</div></div></div>' + h;
  }

  // ---- Cảnh báo (11) ----
  PAGES.canhbao = {
    html() {
      return head('Cảnh báo tồn kho', 'Mặt hàng dưới mức tồn tối thiểu và lô đã hết hạn còn tồn.') +
        '<div class="card"><h2>Mặt hàng đạt / dưới mức tồn tối thiểu</h2>' + bangMH(kho.canhBaoSapHet(), false) + '</div>' +
        '<div class="card"><h2>Lô hàng đã hết hạn còn tồn trong kho</h2>' + bangLoHetHan(kho.canhBaoHetHan()) + '</div>';
    },
  };

  // ---- Tổng giá trị tồn kho (12) ----
  PAGES.giatri = {
    html() {
      const ds = kho.tatCa();
      let h = head('Tổng giá trị tồn kho', 'Tính theo giá bán × tổng tồn, có tách riêng giá trị hàng đã hết hạn.');
      if (!ds.length) return h + '<div class="card"><div class="empty">Kho đang rỗng.</div></div>';
      h += '<div class="card"><div class="table-wrap"><table><thead><tr><th>Mã</th><th>Tên mặt hàng</th><th class="num">Tồn</th><th class="num">Giá bán</th><th class="num">Giá trị tồn</th></tr></thead><tbody>' +
        ds.map((sp) => '<tr><td class="mono"><b>' + esc(sp.ma) + '</b></td><td>' + esc(sp.ten) + '</td><td class="num">' + so(MH.tongTon(sp)) + '</td><td class="num">' + so(sp.gia) + '</td><td class="num">' + tien(MH.giaTriTon(sp)) + '</td></tr>').join('') +
        '</tbody><tfoot><tr><td colspan="2">TỔNG (' + ds.length + ' mặt hàng)</td><td class="num">' + so(kho.tongSoLuongTon()) + '</td><td></td><td class="num">' + tien(kho.tongGiaTriTonKho()) + '</td></tr></tfoot></table></div>';
      const hh = kho.tongGiaTriHetHan();
      if (hh > 0) h += '<div class="note warn" style="margin-top:12px">Trong đó giá trị hàng đã hết hạn: <b>' + tien(hh) + '</b></div>';
      return h + '</div>';
    },
  };

  // ---- Thống kê (13) ----
  PAGES.thongke = {
    html() {
      const t = state.tab.thongke;
      let h = head('Thống kê doanh thu / xuất kho / hủy', 'Doanh thu = tổng giá trị các phiếu xuất bán (không gồm hàng hủy).') +
        tabs('thongke', [['tong', 'Tổng doanh thu'], ['ngay', 'Theo ngày'], ['thang', 'Theo tháng'], ['top', 'Top mặt hàng xuất nhiều'], ['huy', 'Hàng hủy'], ['ls', 'Lịch sử phiếu']]) + '<div class="card">';
      if (t === 'tong') {
        const r = kho.thongKeTong();
        h += '<div class="grid g2"><div class="stat"><div class="lbl">Số phiếu xuất</div><div class="val">' + r.soPhieu + '</div></div><div class="stat ok"><div class="lbl">Tổng giá trị xuất</div><div class="val">' + tien(r.tong) + '</div></div></div>';
        if (!r.soPhieu) h += '<p class="muted" style="margin-top:10px">Chưa có phiếu xuất kho nào.</p>';
      } else if (t === 'ngay') {
        const d = Ngay.tuInput(state.tkNgay), r = d ? kho.thongKeNgay(d) : null;
        h += '<div style="max-width:240px"><label>Ngày</label><input type="date" data-bind="tkNgay" value="' + esc(state.tkNgay) + '"></div>' +
          (r ? '<div class="grid g2" style="margin-top:14px"><div class="stat"><div class="lbl">Số phiếu xuất ngày ' + Ngay.str(d) + '</div><div class="val">' + r.soPhieu + '</div></div><div class="stat ok"><div class="lbl">Giá trị</div><div class="val">' + tien(r.tong) + '</div></div></div>' : '<p class="muted">Chọn ngày hợp lệ.</p>');
      } else if (t === 'thang') {
        const m = Number(state.tkThang), y = Number(state.tkNam), ok = Number.isInteger(m) && m >= 1 && m <= 12 && Number.isInteger(y) && y >= 1900 && y <= 2200;
        const r = ok ? kho.thongKeThang(m, y) : null;
        h += '<div class="form-grid" style="max-width:420px"><div><label>Tháng (1-12)</label><input type="number" min="1" max="12" data-bind="tkThang" value="' + esc(state.tkThang) + '"></div>' +
          '<div><label>Năm</label><input type="number" min="1900" max="2200" data-bind="tkNam" value="' + esc(state.tkNam) + '"></div></div>' +
          (r ? '<div class="grid g2" style="margin-top:14px"><div class="stat"><div class="lbl">Số phiếu xuất tháng ' + m + '/' + y + '</div><div class="val">' + r.soPhieu + '</div></div><div class="stat ok"><div class="lbl">Giá trị</div><div class="val">' + tien(r.tong) + '</div></div></div>' : '<p class="muted">Nhập tháng/năm hợp lệ.</p>');
      } else if (t === 'top') {
        const top = kho.topXuat(5);
        if (!top.length) h += '<div class="empty">Chưa có phiếu xuất kho nào.</div>';
        else {
          const max = top[0].sl;
          h += '<h3>Top 5 mặt hàng xuất nhiều nhất</h3>' + top.map((e, i) => '<div class="bar-row"><div><b>' + (i + 1) + '. <span class="mono">' + esc(e.ma) + '</span></b> ' + esc(e.ten) + '</div><div class="bar"><span style="width:' + Math.max(3, e.sl / max * 100) + '%"></span></div><div class="right">' + so(e.sl) + ' cái · ' + tien(e.giaTri) + '</div></div>').join('');
        }
      } else if (t === 'huy') {
        h += bangPhieuHuy();
      } else {
        h += '<h3>Phiếu xuất kho</h3>';
        if (!kho.phieuXuats.length) h += '<div class="empty">Chưa có phiếu xuất.</div>';
        kho.phieuXuats.slice().reverse().forEach((p) => { h += hienPhieuXuatHtml(p, true); });
        h += '<h3 style="margin-top:18px">Phiếu nhập kho</h3>';
        if (!kho.phieuNhaps.length) h += '<div class="empty">Chưa có phiếu nhập.</div>';
        else h += '<div class="table-wrap"><table><thead><tr><th>Phiếu</th><th>Ngày</th><th>Mã</th><th>Lô</th><th class="num">SL</th><th>Nhà cung cấp</th></tr></thead><tbody>' +
          kho.phieuNhaps.slice().reverse().map((p) => '<tr><td class="mono"><b>' + p.maPhieuNhap + '</b></td><td>' + Ngay.str(p.ngayNhap) + '</td><td class="mono">' + esc(p.maSanPham) + '</td><td class="mono">' + esc(p.maLoHang) + '</td><td class="num">' + so(p.soLuong) + '</td><td>' + esc(p.nhaCungCap) + '</td></tr>').join('') + '</tbody></table></div>';
      }
      return h + '</div>';
    },
  };
  function hienPhieuXuatHtml(p, gon) {
    const bang = '<div class="table-wrap" style="margin-top:8px"><table><thead><tr><th>Mã</th><th>Tên</th><th class="num">SL</th><th class="num">Đơn giá</th><th class="num">Thành tiền</th></tr></thead><tbody>' +
      p.chiTiet.map((c) => '<tr><td class="mono">' + esc(c.maSanPham) + '</td><td>' + esc(c.tenSanPham) + '</td><td class="num">' + so(c.soLuong) + '</td><td class="num">' + so(c.donGia) + '</td><td class="num">' + tien(c.thanhTien) + '</td></tr>').join('') +
      '</tbody><tfoot><tr><td colspan="4">TỔNG GIÁ TRỊ XUẤT</td><td class="num">' + tien(p.tongTien) + '</td></tr></tfoot></table></div>';
    if (gon) return '<details style="margin-bottom:8px"><summary><b class="mono">' + p.maPhieuXuat + '</b> — ' + Ngay.str(p.ngayXuat) + ' — <b>' + tien(p.tongTien) + '</b></summary>' + bang + '</details>';
    return '<h2>Phiếu xuất kho ' + p.maPhieuXuat + ' — ' + Ngay.str(p.ngayXuat) + '</h2>' + bang;
  }

  // ---- Cây AVL (14) ----
  PAGES.cayavl = {
    html() {
      const c = kho.cay, loi = c.validate(), r = c.rot;
      let h = head('Cấu trúc cây AVL', 'Cây đang lưu toàn bộ mặt hàng. Khóa = mã mặt hàng; mỗi nút ghi <b>h</b> (chiều cao) và <b>bf</b> = h(trái) − h(phải).');
      h += '<div class="grid g4" style="margin-bottom:18px"><div class="stat"><div class="lbl">Số nút</div><div class="val">' + c.size + '</div></div>' +
        '<div class="stat"><div class="lbl">Chiều cao</div><div class="val">' + c.height + '</div></div>' +
        '<div class="stat"><div class="lbl">Nút gốc</div><div class="val mono">' + (c.root ? esc(c.root.key) : '—') + '</div></div>' +
        '<div class="stat ' + (loi.length ? 'bad' : 'ok') + '"><div class="lbl">Kiểm tra tính chất AVL</div><div class="val" style="font-size:1.05rem">' + (loi.length ? 'VI PHẠM' : 'HỢP LỆ ✔') + '</div></div></div>';
      if (loi.length) h += '<div class="note bad">' + loi.map(esc).join('<br>') + '</div>';
      h += '<div class="card"><h2>Hình dạng cây</h2><form data-form="cayTim" class="form-grid" style="grid-template-columns:minmax(180px,280px) auto auto;margin-bottom:12px">' +
        '<div><label>Làm nổi đường tìm kiếm mã</label><input name="ma" list="dsMa" placeholder="VD: SP007" autocomplete="off"></div><button class="btn primary">Tìm &amp; tô sáng</button>' +
        (state.hlCay.length ? '<button type="button" class="btn" data-act="cayXoaHl">Bỏ tô sáng</button>' : '<span></span>') + '</form>' + dsMaOption() +
        '<div class="tree-box">' + veCay(c, { hl: state.hlCay, rot: state.rotCay }) + '</div>' + chuThichCay + '</div>';
      h += '<div class="grid g2"><div class="card"><h2>Số phép quay</h2><div class="grid g4"><div class="stat"><div class="lbl">LL</div><div class="val">' + r.LL + '</div></div><div class="stat"><div class="lbl">RR</div><div class="val">' + r.RR + '</div></div><div class="stat"><div class="lbl">LR</div><div class="val">' + r.LR + '</div></div><div class="stat"><div class="lbl">RL</div><div class="val">' + r.RL + '</div></div></div>' +
        '<p class="hint" style="margin-top:10px">Chỉ tính từ lúc nạp dữ liệu / thao tác trong phiên này. Cây đọc lại từ bộ nhớ được dựng đúng hình dạng đã cân bằng nên không phát sinh phép quay (giống bản C++). Nạp dữ liệu mẫu để xem phép quay.</p></div>' +
        '<div class="card"><h2>Nhật ký phép quay</h2><div class="rot-log">' +
        (kho.nhatKyQuay.length ? kho.nhatKyQuay.slice(-40).reverse().map((e) => '<div>' + e.thaoTac + ' <b class="mono">' + esc(e.khoa) + '</b> → <span class="badge info">quay ' + e.loai + '</span> tại nút <b class="mono">' + esc(e.nut) + '</b></div>').join('') : '<span class="muted">Chưa có phép quay nào trong phiên này.</span>') + '</div></div></div>';
      h += '<div class="card"><h2>Thứ tự duyệt</h2><p class="muted">LNR (tăng dần theo mã):</p><p class="mono">' + (c.inorderNodes().map((n) => esc(n.key)).join(' , ') || '—') + '</p>' +
        '<p class="muted">Theo tầng BFS (thứ tự ghi vào tệp — cha luôn đứng trước con):</p><p class="mono">' + (c.bfsNodes().map((n) => esc(n.key)).join(' , ') || '—') + '</p></div>';
      return h;
    },
  };

  // ---- Phòng thí nghiệm AVL ----
  const cmpLab = (a, b) => {
    const nu = (s) => /^-?\d+(\.\d+)?$/.test(s);
    const x = nu(a) && nu(b) ? +a : a, y = nu(a) && nu(b) ? +b : b;
    return x < y ? -1 : x > y ? 1 : 0;
  };
  function labReset() { state.lab = { avl: new AVLTree(cmpLab, true), bst: new AVLTree(cmpLab, false) }; state.labLog = []; state.labRot = []; }
  PAGES.lab = {
    html() {
      if (!state.lab) labReset();
      const { avl, bst } = state.lab;
      let h = head('Phòng thí nghiệm AVL', 'Chèn cùng một dãy khóa vào <b>cây AVL</b> và <b>cây nhị phân tìm kiếm thường (BST)</b> để thấy vì sao cần cân bằng. Không ảnh hưởng dữ liệu kho.');
      h += '<div class="card"><form data-form="labThem" class="form-grid" style="grid-template-columns:minmax(220px,1fr) auto auto auto"><div><label>Khóa cần chèn / xóa (có thể nhập nhiều, cách nhau bằng dấu phẩy hoặc khoảng trắng)</label><input name="k" placeholder="VD: 10 20 30 40 50 25" autocomplete="off"></div>' +
        '<button class="btn primary" name="op" value="ins">Chèn</button><button class="btn danger" name="op" value="del">Xóa</button><button class="btn" type="button" data-act="labXoaHet">Làm mới</button></form>' +
        '<div class="btn-row" style="margin-top:12px"><span class="muted">Mẫu nhanh:</span>' +
        '<button class="btn sm" data-act="labMau" data-m="tang">Chèn 1…15 tăng dần</button><button class="btn sm" data-act="labMau" data-m="ngau">Chèn 15 số ngẫu nhiên</button><button class="btn sm" data-act="labMau" data-m="rr">Ví dụ quay RR (1,2,3)</button><button class="btn sm" data-act="labMau" data-m="lr">Ví dụ quay LR (3,1,2)</button></div></div>';
      const cao = avl.size ? Math.ceil(1.44 * Math.log2(avl.size + 2)) : 0;
      h += '<div class="grid g4" style="margin-bottom:18px"><div class="stat"><div class="lbl">Số nút</div><div class="val">' + avl.size + '</div></div><div class="stat ok"><div class="lbl">Chiều cao AVL</div><div class="val">' + avl.height + '</div></div>' +
        '<div class="stat ' + (bst.height > avl.height ? 'bad' : '') + '"><div class="lbl">Chiều cao BST thường</div><div class="val">' + bst.height + '</div></div><div class="stat"><div class="lbl">Phép quay LL/RR/LR/RL</div><div class="val">' + avl.rot.LL + '/' + avl.rot.RR + '/' + avl.rot.LR + '/' + avl.rot.RL + '</div></div></div>';
      if (state.labLog && state.labLog.length) h += '<div class="note">' + state.labLog.map(esc).join('<br>') + '</div>';
      h += '<div class="card"><h2>Cây AVL (tự cân bằng) <span class="badge ok">h = ' + avl.height + (cao ? ' ≤ ' + cao : '') + '</span></h2><div class="tree-box">' + veCay(avl, { rot: state.labRot }) + '</div></div>' +
        '<div class="card"><h2>Cây BST thường (không cân bằng) <span class="badge ' + (bst.height > avl.height ? 'bad' : 'info') + '">h = ' + bst.height + '</span></h2><div class="tree-box">' + veCay(bst) + '</div>' + chuThichCay + '</div>';
      return h;
    },
  };

  // ---- Dữ liệu & tệp (15, 16, 17) ----
  PAGES.dulieu = {
    html() {
      return head('Dữ liệu & tệp', 'Thay cho <code>kho.dat</code> / <code>kho.xlsx</code> của bản C++: dữ liệu tự lưu trong trình duyệt sau mỗi thay đổi.') +
        (kho.loiLuu ? '<div class="note bad">' + esc(kho.loiLuu) + '</div>' : '<div class="note ok">✔ Tự động lưu đang bật (localStorage của trình duyệt).</div>') +
        '<div class="grid g2"><div class="card"><h2>Sao lưu / khôi phục (JSON)</h2><p class="muted">Tương đương ghi / đọc tệp nhị phân <code>kho.dat</code>: mặt hàng ghi theo thứ tự BFS để đọc lại dựng đúng hình dạng cây, kèm phiếu nhập/xuất/hủy.</p>' +
        '<div class="btn-row"><button class="btn primary" data-act="luuTay">Lưu ngay</button><button class="btn" data-act="docLai">Đọc lại từ bộ nhớ</button><button class="btn" data-act="xuatJson">⬇ Tải kho.json</button><button class="btn" data-act="nhapJson">⬆ Nạp từ kho.json</button></div>' +
        '<input type="file" id="fileJson" accept=".json,application/json" class="hidden" data-file="json"></div>' +
        '<div class="card"><h2>Xuất Excel (CSV)</h2><p class="muted">Tương đương <code>kho.xlsx</code>: mỗi dòng là một lô hàng. Mở trực tiếp bằng Excel / Google Sheets.</p><button class="btn" data-act="xuatCsv">⬇ Tải kho.csv</button></div>' +
        '<div class="card"><h2>Dữ liệu mẫu</h2><p class="muted">Nạp 10 mặt hàng chèn theo thứ tự tăng dần để kích hoạt các phép quay AVL; có sẵn một lô đã hết hạn (SP006 / L-CU) để demo cảnh báo và hủy hàng.</p><button class="btn" data-act="napMau">Nạp dữ liệu mẫu</button></div>' +
        '<div class="card"><h2>Xóa toàn bộ</h2><p class="muted">Xóa mặt hàng, phiếu nhập, phiếu xuất, phiếu hủy. Không thể hoàn tác (hãy tải kho.json trước).</p><button class="btn danger" data-act="xoaHet">Xóa toàn bộ dữ liệu</button></div></div>';
    },
  };

  // ---- Đổi mật khẩu (18) ----
  PAGES.taikhoan = {
    html() {
      return head('Đổi mật khẩu admin', 'Tài khoản mặc định lần đầu: <b>admin / admin123</b>.') +
        '<div class="card" style="max-width:460px"><form data-form="mk"><div style="margin-bottom:12px"><label>Mật khẩu hiện tại</label><input type="password" name="cu" required autocomplete="current-password"></div>' +
        '<div style="margin-bottom:12px"><label>Mật khẩu mới (≥ 6 ký tự)</label><input type="password" name="moi" required minlength="6" autocomplete="new-password"></div>' +
        '<div style="margin-bottom:14px"><label>Nhập lại mật khẩu mới</label><input type="password" name="lai" required autocomplete="new-password"></div><button class="btn primary">Đổi mật khẩu</button></form>' +
        '<p class="hint" style="margin-top:12px">Lưu ý: đây là đồ án minh họa chạy hoàn toàn trên trình duyệt nên mật khẩu chỉ lưu cục bộ, không phải cơ chế bảo mật thật.</p></div>';
    },
  };

  // ====================== Khung giao diện ======================
  function renderLogin(thongBao) {
    $('#app').classList.add('login-mode');
    $('#app').classList.remove('nav-open');
    $('#app').innerHTML = '<div class="login-wrap"><div class="login"><h1>🌳 Quản lý hàng tồn kho &amp; doanh thu siêu thị</h1>' +
      '<div class="sub">Đề tài ĐT05 · Cấu trúc dữ liệu và Giải thuật · Cây cân bằng AVL</div>' +
      (thongBao ? '<div class="note bad">' + esc(thongBao) + '</div>' : '') +
      '<button class="btn" data-act="vaoKhach">👤 Vào với tư cách KHÁCH (chỉ xem, tra cứu)</button>' +
      '<div class="sep">hoặc đăng nhập ADMIN</div>' +
      '<form data-form="login"><div style="margin-bottom:12px"><label>Tên đăng nhập</label><input name="u" required autocomplete="username" value="admin"></div>' +
      '<div style="margin-bottom:14px"><label>Mật khẩu</label><input type="password" name="p" required autocomplete="current-password" placeholder="admin123 (mặc định)"></div>' +
      '<button class="btn primary">Đăng nhập</button></form></div></div>';
    const p = $('input[name=p]'); if (p) p.focus();
  }

  function closeSidebar() {
    const sidebar = $('#sidebar');
    const app = $('#app');
    if (sidebar) sidebar.classList.remove('open');
    if (app) app.classList.remove('nav-open');
    const menu = $('.menu-btn');
    if (menu) {
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
      const isExpanded = isMobile
        ? !!(sidebar && sidebar.classList.contains('open'))
        : !!(app && !app.classList.contains('sidebar-collapsed'));
      menu.setAttribute('aria-expanded', String(isExpanded));
    }
  }

  function renderShell() {
    $('#app').classList.remove('login-mode', 'sidebar-collapsed');
    closeSidebar();
    const ad = state.role === 'admin';
    let nav = '', pendingGroup = null;
    for (const n of NAV) {
      if (n.g) { pendingGroup = n.g; continue; }
      if (n.ad && !ad) continue;
      if (pendingGroup) { nav += '<div class="nav-group">' + pendingGroup + '</div>'; pendingGroup = null; }
      nav += '<a data-act="go" data-p="' + n.id + '" id="nav-' + n.id + '"><span class="ico">' + n.i + '</span>' + n.t + '</a>';
    }
    $('#app').innerHTML = '<aside class="sidebar" id="sidebar"><div class="brand">🌳 Siêu thị AVL<small>Quản lý hàng tồn kho &amp; doanh thu</small></div><nav class="nav">' + nav +
      '</nav><div class="side-foot">Chế độ: <b>' + (ad ? 'ADMIN' : 'KHÁCH (chỉ xem)') + '</b></div></aside>' +
      '<button class="sidebar-scrim" data-act="closeMenu" aria-label="Đóng menu"></button>' +
      '<div class="main"><div class="topbar"><button class="btn sm menu-btn" data-act="menu" aria-label="Menu" aria-controls="sidebar" aria-expanded="false">☰</button><div class="grow"><b id="pageTitle"></b></div>' +
      '<span class="badge ' + (ad ? 'ok' : 'info') + '">' + (ad ? 'ADMIN' : 'KHÁCH') + '</span><span id="saveInfo" class="muted" style="font-size:.82rem"></span>' +
      '<button class="btn sm" data-act="theme" title="Đổi giao diện sáng/tối">🌓</button><button class="btn sm" data-act="dangXuat">Đăng xuất</button></div>' +
      '<main class="content" id="content"></main></div>';
  }

  function render() {
    if (!state.role) return;
    const p = trang(state.page);
    if (!p || (p.ad && state.role !== 'admin')) state.page = 'tongquan';
    const pg = trang(state.page);
    $$('.nav a').forEach((a) => a.classList.toggle('active', a.id === 'nav-' + state.page));
    $('#pageTitle').textContent = pg.t;
    $('#content').innerHTML = PAGES[state.page].html();
    const si = $('#saveInfo');
    if (si) si.textContent = kho.loiLuu ? '⚠ chưa lưu được' : '✔ tự động lưu';
    if (PAGES[state.page].after) PAGES[state.page].after();
  }
  function go(id) {
    if (!trang(id)) id = 'tongquan';
    const p = trang(id);
    if (p.ad && state.role !== 'admin') { toast('Chức năng này chỉ dành cho admin. Hãy đăng xuất và đăng nhập admin!', 'bad'); return; }
    state.page = id;
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    closeSidebar();
    render();
    window.scrollTo(0, 0);
  }

  // ====================== Hành động (data-act) ======================
  const ACTS = {
    go: (el) => go(el.dataset.p),
    menu(el) {
      const sidebar = $('#sidebar');
      const app = $('#app');
      if (!sidebar || !app) return;
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;

      if (isMobile) {
        // Điện thoại / màn hình hẹp: sidebar trượt đè lên nội dung.
        const isOpen = !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', isOpen);
        app.classList.toggle('nav-open', isOpen);
        app.classList.remove('sidebar-collapsed');
        if (el) el.setAttribute('aria-expanded', String(isOpen));
      } else {
        // Desktop: thu gọn sidebar về 0px để vùng nội dung mở rộng toàn màn hình.
        const isCollapsed = !app.classList.contains('sidebar-collapsed');
        app.classList.toggle('sidebar-collapsed', isCollapsed);
        sidebar.classList.remove('open');
        app.classList.remove('nav-open');
        if (el) el.setAttribute('aria-expanded', String(!isCollapsed));
      }
    },
    closeMenu() { closeSidebar(); },
    theme() {
      const cur = document.documentElement.dataset.theme ||
        (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const nxt = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = nxt;
      try { localStorage.setItem('sieuthi_avl_theme', nxt); } catch (e) { /* bỏ qua */ }
    },
    vaoKhach() { state.role = 'guest'; state.fails = 0; renderShell(); go(location.hash.slice(1) || 'tongquan'); toast('Đã vào với tư cách khách (chỉ xem).'); },
    dangXuat() { state.role = null; state.gio = []; renderLogin(); },
    tab(el) { state.tab[el.dataset.key] = el.dataset.v; render(); },

    // --- mặt hàng ---
    them() { moFormMatHang(null); },
    sua(el) { moFormMatHang(kho.tim(el.dataset.ma)); },
    async xoa(el) {
      const sp = kho.tim(el.dataset.ma);
      if (!sp) return;
      const ton = MH.tongTon(sp);
      const okk = await confirmBox('Xóa mặt hàng ' + sp.ma + '?', '<p>' + esc(sp.ten) + '</p>' + (ton > 0 ? '<div class="note warn">Mặt hàng còn tồn <b>' + ton + '</b>. Vẫn xóa?</div>' : ''), 'Xóa', true);
      if (!okk) return;
      const r = kho.xoaMatHang(sp.ma);
      kq(r);
      if (r.ok && r.events.length) state.rotCay = r.events.map((e) => e.key);
      render();
    },
    chiTiet(el) {
      const sp = kho.tim(el.dataset.ma);
      if (!sp) return;
      modal('<h2>' + esc(sp.ma) + ' — ' + esc(sp.ten) + '</h2><p>Giá bán <b>' + tien(sp.gia) + '</b> · Tồn <b>' + MH.tongTon(sp) + '</b> (xuất được ' + MH.tonXuatDuoc(sp) + ') · Min ' + sp.min + '</p>' + bangLo(sp) +
        '<div class="actions"><button class="btn primary" data-act="dong">Đóng</button></div>', true);
    },
    dong(el) { closeModal(el); },
    xoaTim() { state.timMa = ''; render(); },

    // --- xuất kho ---
    gioXoa(el) { state.gio.splice(Number(el.dataset.i), 1); render(); },
    async gioHuy() { if (await confirmBox('Hủy phiếu xuất?', '<p>Toàn bộ dòng đang lập sẽ bị bỏ.</p>', 'Hủy phiếu', true)) { state.gio = []; render(); } },
    async xacNhanXuat() {
      const ct = state.gio.map((g) => '<tr><td class="mono">' + esc(g.ma) + '</td><td>' + esc(g.ten) + '</td><td class="num">' + g.sl + '</td><td class="num">' + tien(g.sl * g.gia) + '</td></tr>').join('');
      const okk = await confirmBox('Xác nhận xuất kho?', '<div class="table-wrap"><table><thead><tr><th>Mã</th><th>Tên</th><th class="num">SL</th><th class="num">Thành tiền</th></tr></thead><tbody>' + ct + '</tbody></table></div><p style="margin-top:10px">TỔNG GIÁ TRỊ XUẤT: <b>' + tien(tongGio()) + '</b></p>', 'Xuất kho');
      if (!okk) return;
      const r = kho.xuatKho(state.gio.map((g) => ({ ma: g.ma, sl: g.sl })));
      kq(r);
      if (!r.ok) return;
      state.gio = [];
      render();
      modal(hienPhieuXuatHtml(r.phieu) + (r.canhBao.length ? '<div class="note warn"><b>CẢNH BÁO TỒN KHO</b><br>' + r.canhBao.map(esc).join('<br>') + '</div>' : '') +
        '<div class="actions"><button class="btn primary" data-act="dong">Đóng</button></div>', true);
    },

    // --- hủy hàng ---
    async huyHet() {
      const ds = kho.loHetHan();
      const gt = ds.reduce((t, e) => t + e.lo.sl * e.gia, 0);
      if (!await confirmBox('Hủy toàn bộ lô hết hạn?', bangLoHetHan(ds) + '<p style="margin-top:10px">Giá trị: <b>' + tien(gt) + '</b></p>', 'Hủy hàng', true)) return;
      const r = kho.huyHangHetHan();
      kq(r);
      render();
      if (r.ok && r.phieu) {
        const p = r.phieu;
        modal('<h2>Phiếu xuất hủy ' + p.maPhieuHuy + ' — ' + Ngay.str(p.ngayHuy) + '</h2><p>Lý do: ' + esc(p.lyDo) + '</p><div class="table-wrap"><table><thead><tr><th>Mã</th><th>Tên</th><th>Lô</th><th class="num">SL</th><th class="num">Thành tiền</th></tr></thead><tbody>' +
          p.chiTiet.map((c) => '<tr><td class="mono">' + esc(c.maSanPham) + '</td><td>' + esc(c.tenSanPham) + '</td><td class="mono">' + esc(c.maLoHang) + '</td><td class="num">' + c.soLuong + '</td><td class="num">' + tien(c.thanhTien) + '</td></tr>').join('') +
          '</tbody><tfoot><tr><td colspan="4">TỔNG GIÁ TRỊ HỦY</td><td class="num">' + tien(p.tongTien) + '</td></tr></tfoot></table></div><div class="actions"><button class="btn primary" data-act="dong">Đóng</button></div>', true);
      }
    },

    // --- cây AVL ---
    cayXoaHl() { state.hlCay = []; state.rotCay = []; render(); },
    labXoaHet() { labReset(); render(); },
    labMau(el) {
      labReset();
      const m = el.dataset.m, { avl, bst } = state.lab;
      let ks = [];
      if (m === 'tang') ks = Array.from({ length: 15 }, (_, i) => String(i + 1));
      else if (m === 'ngau') { const s = new Set(); while (s.size < 15) s.add(String(1 + Math.floor(Math.random() * 99))); ks = Array.from(s); }
      else if (m === 'rr') ks = ['1', '2', '3'];
      else ks = ['3', '1', '2'];
      labChen(ks);
      render();
    },

    // --- dữ liệu ---
    async napMau() {
      if (!kho.cay.isEmpty() && !await confirmBox('Nạp dữ liệu mẫu?', '<p>Dữ liệu hiện tại (mặt hàng và phiếu) sẽ bị xóa.</p>', 'Nạp dữ liệu mẫu', true)) return;
      const r = kho.napDuLieuMau();
      kq(r);
      state.hlCay = []; state.rotCay = []; state.timMa = ''; state.gio = [];
      render();
      const co = r.log.filter((l) => l.events.length);
      modal('<h2>Đã nạp 10 mặt hàng mẫu</h2><p>Chèn theo thứ tự tăng dần nên cây liên tục bị lệch và phải tự cân bằng bằng phép quay:</p><div class="rot-log">' +
        (co.length ? co.map((l) => '<div>Chèn <b class="mono">' + l.ma + '</b> → ' + l.events.map((e) => '<span class="badge info">quay ' + e.type + ' tại ' + esc(e.key) + '</span>').join(' ') + '</div>').join('') : '<span class="muted">Không có phép quay.</span>') +
        '</div><p style="margin-top:10px">Cây: <b>' + kho.cay.size + '</b> nút, chiều cao <b>' + kho.cay.height + '</b>. Số phép quay: LL=' + kho.cay.rot.LL + ', RR=' + kho.cay.rot.RR + ', LR=' + kho.cay.rot.LR + ', RL=' + kho.cay.rot.RL +
        '</p><div class="actions"><button class="btn" data-act="dongVaCay">Xem cây AVL</button><button class="btn primary" data-act="dong">Đóng</button></div>');
    },
    dongVaCay(el) { closeModal(el); go('cayavl'); },
    luuTay() { const ok = kho.tuDongLuu(); toast(ok ? 'Đã lưu dữ liệu.' : kho.loiLuu, ok ? 'ok' : 'bad'); render(); },
    docLai() { const r = kho.docBoNho(); kq(r); if (r.ok) { state.hlCay = []; state.timMa = ''; } render(); },
    xuatJson() { taiXuong('kho.json', JSON.stringify(kho.toData(), null, 2), 'application/json'); toast('Đã tạo tệp kho.json.', 'ok'); },
    nhapJson() { $('#fileJson').click(); },
    xuatCsv() { taiXuong('kho.csv', kho.xuatCSV(), 'text/csv;charset=utf-8'); toast('Đã tạo tệp kho.csv.', 'ok'); },
    async xoaHet() {
      if (!await confirmBox('Xóa toàn bộ dữ liệu?', '<p>Mặt hàng và mọi phiếu sẽ bị xóa vĩnh viễn.</p>', 'Xóa hết', true)) return;
      kho.xoaTatCa(); state.hlCay = []; state.timMa = ''; state.gio = []; toast('Đã xóa toàn bộ dữ liệu.', 'ok'); render();
    },
  };

  function labChen(ks) {
    const { avl, bst } = state.lab;
    const log = [], rot = [];
    for (const k of ks) {
      const ok = avl.insert(k, k); bst.insert(k, k);
      if (!ok) { log.push('Khóa ' + k + ' đã tồn tại, bỏ qua.'); continue; }
      log.push('Chèn ' + k + (avl.events.length ? ' → ' + avl.events.map((e) => 'quay ' + e.type + ' tại ' + e.key).join(', ') : ' → không cần quay'));
      avl.events.forEach((e) => rot.push(e.key));
    }
    state.labLog = log.slice(-12); state.labRot = rot;
  }

  function taiXuong(ten, noiDung, kieu) {
    const url = URL.createObjectURL(new Blob([noiDung], { type: kieu }));
    const a = document.createElement('a');
    a.href = url; a.download = ten;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function moFormMatHang(sp) {
    const sua = !!sp;
    const ov = modal('<h2>' + (sua ? 'Sửa mặt hàng ' + esc(sp.ma) : 'Thêm mặt hàng') + '</h2><form data-form="mh" data-mode="' + (sua ? 'sua' : 'them') + '">' +
      '<div style="margin-bottom:12px"><label>Mã mặt hàng (mã vạch)</label><input name="ma" required ' + (sua ? 'disabled value="' + esc(sp.ma) + '"' : 'placeholder="VD: SP011"') + ' autocomplete="off">' +
      (sua ? '' : '<div class="hint">Tự chuyển thành chữ HOA. Nên đặt mã cùng độ dài (SP001, SP002…) vì khóa so sánh theo thứ tự từ điển.</div>') + '</div>' +
      '<div style="margin-bottom:12px"><label>Tên mặt hàng</label><input name="ten" required value="' + (sua ? esc(sp.ten) : '') + '"></div>' +
      '<div class="form-grid" style="margin-bottom:6px"><div><label>Giá bán (đ)</label><input name="gia" type="number" min="0" step="any" required value="' + (sua ? sp.gia : '') + '"></div>' +
      '<div><label>Mức tồn tối thiểu</label><input name="min" type="number" min="0" max="1000000" step="1" required value="' + (sua ? sp.min : '') + '"></div></div>' +
      '<div class="actions"><button type="button" class="btn" data-act="dong">Hủy</button><button class="btn primary">' + (sua ? 'Lưu thay đổi' : 'Thêm') + '</button></div></form>');
    ov.querySelector('form').dataset.ma = sua ? sp.ma : '';
  }

  // ====================== Form (data-form) ======================
  const FORMS = {
    login(f) {
      const u = f.elements.u.value, p = f.elements.p.value;
      if (TaiKhoan.dangNhap(u, p)) {
        state.role = 'admin'; state.fails = 0; renderShell(); go(location.hash.slice(1) || 'tongquan');
        toast('Đăng nhập thành công! Xin chào admin.', 'ok');
        return;
      }
      state.fails++;
      if (state.fails >= 3) { state.fails = 0; renderLogin('Sai quá 3 lần, quay lại màn hình đầu. Mật khẩu mặc định: admin123.'); return; }
      renderLogin('Sai tên đăng nhập hoặc mật khẩu! (lần ' + state.fails + '/3)');
    },
    mh(f) {
      const sua = f.dataset.mode === 'sua';
      const g = num(f.elements.gia.value), m = num(f.elements.min.value);
      const r = sua ? kho.suaMatHang(f.dataset.ma, f.elements.ten.value, g, m)
        : kho.themMatHang(f.elements.ma.value, f.elements.ten.value, g, m);
      kq(r);
      if (!r.ok) return;
      closeModal(f);
      state.rotCay = r.events ? r.events.map((e) => e.key) : [];
      render();
    },
    tim(f) { state.timMa = f.elements.ma.value.trim(); render(); },
    tcMa(f) {
      state.tcMa = { tu: f.elements.tu.value, den: f.elements.den.value };
      const r = kho.traCuuTheoMa(state.tcMa.tu, state.tcMa.den);
      if (!r.ok) { toast(r.msg, 'bad'); return; }
      state.tcMaKq = '<p style="margin-top:14px">Kết quả từ <b class="mono">' + esc(r.tu) + '</b> đến <b class="mono">' + esc(r.den) + '</b> — đã duyệt <b>' + r.visited + '</b>/' + kho.cay.size + ' nút của cây (nhờ cắt nhánh):</p>' + bangMH(r.items, false);
      render();
    },
    tcGia(f) {
      state.tcGia = { tu: f.elements.tu.value, den: f.elements.den.value };
      const r = kho.traCuuTheoGia(num(state.tcGia.tu), num(state.tcGia.den));
      if (!r.ok) { toast(r.msg, 'bad'); return; }
      state.tcGiaKq = '<p style="margin-top:14px">Kết quả giá từ <b>' + so(num(state.tcGia.tu)) + '</b> đến <b>' + so(num(state.tcGia.den)) + '</b> đ (sắp xếp bằng Quick Sort):</p>' + bangMH(r.items, false);
      render();
    },
    sx(f) {
      state.sx = f.elements.c.value;
      if (kho.cay.isEmpty()) { toast('Kho đang rỗng.', 'bad'); return; }
      const t0 = performance.now();
      const ds = state.sx === '1' ? kho.sapXepTheoGia(true) : state.sx === '2' ? kho.sapXepTheoGia(false) : state.sx === '3' ? kho.sapXepTheoTon(true) : kho.sapXepTheoTon(false);
      const ms = (performance.now() - t0).toFixed(2);
      state.sxKq = '<p style="margin-top:14px">Sắp xếp <b>' + ds.length + '</b> mặt hàng bằng Quick Sort trong ' + ms + ' ms:</p>' + bangMH(ds, false);
      render();
    },
    nhap(f) {
      const e = f.elements;
      const r = kho.nhapKho({ ma: e.ma.value, maLo: e.maLo.value, sl: num(e.sl.value), hsd: Ngay.tuInput(e.hsd.value), viTri: e.viTri.value, ncc: e.ncc.value });
      kq(r);
      if (r.ok && r.canhBao) toast('⚠ ' + r.canhBao, 'warn');
      if (r.ok) render();
    },
    gioThem(f) {
      const ma = f.elements.ma.value.trim().toUpperCase(), sl = num(f.elements.sl.value);
      const g = state.gio.find((x) => x.ma === ma);
      const r = kho.kiemTraDongXuat(ma, sl, g ? g.sl : 0);
      if (!r.ok) { toast(r.msg, 'bad'); return; }
      if (g) g.sl += sl; else state.gio.push({ ma, ten: r.sp.ten, gia: r.sp.gia, sl });
      toast('Đã thêm vào phiếu xuất.', 'ok');
      render();
    },
    cayTim(f) {
      const ma = f.elements.ma.value.trim();
      if (!ma) return;
      const p = kho.timDuongDi(ma);
      state.hlCay = p.path; state.rotCay = [];
      toast(p.found ? 'Tìm thấy sau ' + p.path.length + ' bước: ' + p.path.join(' → ') : 'Không có mã ' + ma.toUpperCase() + ' (đã đi qua ' + p.path.length + ' nút).', p.found ? 'ok' : 'bad');
      render();
    },
    labThem(f, ev) {
      const op = (ev.submitter && ev.submitter.value) || 'ins';
      const ks = f.elements.k.value.split(/[\s,;]+/).filter(Boolean);
      if (!ks.length) { toast('Nhập ít nhất một khóa.', 'bad'); return; }
      if (!state.lab) labReset();
      if (op === 'ins') labChen(ks);
      else {
        const log = [], rot = [];
        for (const k of ks) {
          const ok = state.lab.avl.remove(k); state.lab.bst.remove(k);
          log.push(ok ? 'Xóa ' + k + (state.lab.avl.events.length ? ' → ' + state.lab.avl.events.map((e) => 'quay ' + e.type + ' tại ' + e.key).join(', ') : ' → không cần quay') : 'Không có khóa ' + k + '.');
          state.lab.avl.events.forEach((e) => rot.push(e.key));
        }
        state.labLog = log.slice(-12); state.labRot = rot;
      }
      render();
    },
    mk(f) {
      const r = TaiKhoan.doiMatKhau(f.elements.cu.value, f.elements.moi.value, f.elements.lai.value);
      kq(r);
      if (r.ok) f.reset();
    },
  };

  // ====================== Gắn sự kiện (ủy quyền) ======================
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.matches('input')) return;
    const fn = ACTS[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    const fn = FORMS[f.dataset.form];
    if (fn) fn(f, e);
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.bind) { state[t.dataset.bind] = t.value; render(); return; }
    if (t.dataset && t.dataset.file === 'json' && t.files && t.files[0]) {
      const rd = new FileReader();
      rd.onload = () => {
        let o;
        try { o = JSON.parse(rd.result); } catch (err) { toast('Tệp không phải JSON hợp lệ.', 'bad'); return; }
        const r = kho.fromData(o);
        kq(r);
        if (r.ok) { kho.tuDongLuu(); state.hlCay = []; state.timMa = ''; state.gio = []; render(); }
      };
      rd.onerror = () => toast('Không đọc được tệp.', 'bad');
      rd.readAsText(t.files[0]);
      t.value = '';
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id !== 'xMa') return;
    const sp = kho.tim(e.target.value), box = $('#infoXuat');
    if (!box) return;
    box.textContent = e.target.value.trim() === '' ? '' : sp
      ? sp.ten + ' — ' + so(sp.gia) + ' đ — có thể xuất: ' + MH.tonXuatDuoc(sp) + ' (lô hết hạn không được tính)'
      : 'Không tìm thấy mặt hàng.';
  });
  window.addEventListener('hashchange', () => { if (state.role) go(location.hash.slice(1)); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const ov = $$('.overlay').pop();
      if (ov) ov.remove();
      closeSidebar();
    }
  });

  // ====================== Khởi động (tương ứng ql.khoiDong() trong main) ======================
  try { const t = localStorage.getItem('sieuthi_avl_theme'); if (t) document.documentElement.dataset.theme = t; } catch (e) { /* bỏ qua */ }
  const kd = kho.khoiDong();
  renderLogin();
  if (kd.ok) toast(kd.msg, 'ok');
})();
