/* ============================================================================
 * avl.js - Cây cân bằng AVL (khóa = mã mặt hàng)
 * Tương ứng AVLTree.h (Node, cayVL) trong bản C++.
 * Gồm: phép quay LL/RR/LR/RL, balance factor, range search (cắt nhánh),
 *      duyệt LNR, duyệt theo tầng BFS, kiểm tra tính hợp lệ AVL.
 * ========================================================================== */
(function (root) {
  'use strict';

  const H = (n) => (n ? n.height : 0);

  class AVLNode {
    constructor(key, data) {
      this.key = key;
      this.data = data;
      this.height = 1;
      this.left = null;
      this.right = null;
    }
  }

  const cmpMacDinh = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  class AVLTree {
    /**
     * @param {function} cmp       hàm so sánh khóa (mặc định: so sánh chuỗi như C++)
     * @param {boolean}  canBang   false = cây nhị phân tìm kiếm thường (dùng để so sánh trong phòng thí nghiệm)
     */
    constructor(cmp, canBang) {
      this.cmp = cmp || cmpMacDinh;
      this.canBang = canBang !== false;
      this.root = null;
      this.size = 0;
      this.rot = { LL: 0, RR: 0, LR: 0, RL: 0 };
      this.events = []; // các phép quay của thao tác gần nhất
    }

    // ---------- tiện ích ----------
    static height(n) { return H(n); }
    // balance factor = h(trái) - h(phải)
    static bf(n) { return n ? H(n.left) - H(n.right) : 0; }
    _upd(n) { n.height = 1 + Math.max(H(n.left), H(n.right)); }
    _ev(type, key) { this.rot[type]++; this.events.push({ type, key }); }

    //       y                x
    //      / \              / \
    //     x   C    --->    A   y
    //    / \                  / \
    //   A   B                B   C
    _rotR(y) {
      const x = y.left, B = x.right;
      x.right = y; y.left = B;
      this._upd(y); this._upd(x);
      return x;
    }
    _rotL(x) {
      const y = x.right, B = y.left;
      y.left = x; x.right = B;
      this._upd(x); this._upd(y);
      return y;
    }

    // Cân bằng lại nút n (dùng sau khi chèn / xóa)
    _bal(n) {
      this._upd(n);
      if (!this.canBang) return n;
      const b = AVLTree.bf(n);
      if (b > 1) {                              // lệch trái
        if (AVLTree.bf(n.left) < 0) { n.left = this._rotL(n.left); this._ev('LR', n.key); }
        else this._ev('LL', n.key);
        return this._rotR(n);
      }
      if (b < -1) {                             // lệch phải
        if (AVLTree.bf(n.right) > 0) { n.right = this._rotR(n.right); this._ev('RL', n.key); }
        else this._ev('RR', n.key);
        return this._rotL(n);
      }
      return n;
    }

    // ---------- chèn ----------
    _ins(n, key, data, ok) {
      if (!n) { this.size++; ok.v = true; return new AVLNode(key, data); }
      const c = this.cmp(key, n.key);
      if (c < 0) n.left = this._ins(n.left, key, data, ok);
      else if (c > 0) n.right = this._ins(n.right, key, data, ok);
      else { ok.v = false; return n; }          // trùng khóa
      return this._bal(n);
    }
    insert(key, data) {
      this.events = [];
      const ok = { v: false };
      this.root = this._ins(this.root, key, data, ok);
      return ok.v;
    }

    // ---------- xóa ----------
    static _min(n) { while (n.left) n = n.left; return n; }
    _rem(n, key, ok) {
      if (!n) { ok.v = false; return null; }
      const c = this.cmp(key, n.key);
      if (c < 0) n.left = this._rem(n.left, key, ok);
      else if (c > 0) n.right = this._rem(n.right, key, ok);
      else {
        ok.v = true;
        if (!n.left || !n.right) {              // 0 hoặc 1 con
          this.size--;
          return n.left || n.right;
        }
        const s = AVLTree._min(n.right);        // 2 con: thay bằng nút kế nhiệm
        const kS = s.key;
        n.key = s.key; n.data = s.data;
        n.right = this._rem(n.right, kS, { v: false });
      }
      return this._bal(n);
    }
    remove(key) {
      this.events = [];
      const ok = { v: false };
      this.root = this._rem(this.root, key, ok);
      return ok.v;
    }

    // ---------- tìm kiếm ----------
    search(key) {
      let n = this.root;
      while (n) {
        const c = this.cmp(key, n.key);
        if (c === 0) return n.data;
        n = c < 0 ? n.left : n.right;
      }
      return null;
    }
    /** Đường đi khi tìm: các khóa đã duyệt qua, từ gốc xuống */
    searchPath(key) {
      const path = [];
      let n = this.root, found = false;
      while (n) {
        path.push(n.key);
        const c = this.cmp(key, n.key);
        if (c === 0) { found = true; break; }
        n = c < 0 ? n.left : n.right;
      }
      return { found, path };
    }
    /** Tìm theo khoảng [low, high], cắt nhánh -> O(log n + k). Trả về {items, visited} */
    rangeSearch(low, high) {
      const items = [];
      let visited = 0;
      const go = (n) => {
        if (!n) return;
        visited++;
        if (this.cmp(low, n.key) < 0) go(n.left);                         // cắt nhánh trái
        if (this.cmp(low, n.key) <= 0 && this.cmp(n.key, high) <= 0) items.push(n.data);
        if (this.cmp(high, n.key) > 0) go(n.right);                       // cắt nhánh phải
      };
      go(this.root);
      return { items, visited };
    }

    // ---------- duyệt ----------
    inorderNodes() {                            // LNR: tăng dần theo khóa
      const out = [];
      const go = (n) => { if (!n) return; go(n.left); out.push(n); go(n.right); };
      go(this.root);
      return out;
    }
    inorder() { return this.inorderNodes().map((n) => n.data); }
    bfsNodes() {                                // theo từng tầng: cha luôn đứng trước con
      const out = [];
      if (!this.root) return out;
      const q = [this.root];
      for (let i = 0; i < q.length; i++) {
        const n = q[i];
        out.push(n);
        if (n.left) q.push(n.left);
        if (n.right) q.push(n.right);
      }
      return out;
    }

    clear() {
      this.root = null;
      this.size = 0;
      this.rot = { LL: 0, RR: 0, LR: 0, RL: 0 };
      this.events = [];
    }
    get height() { return H(this.root); }
    isEmpty() { return this.root === null; }

    /** Kiểm tra: đúng thứ tự BST, chiều cao lưu đúng, mọi nút |bf| <= 1. Trả về mảng lỗi */
    validate() {
      const loi = [];
      const go = (n, lo, hi) => {
        if (!n) return 0;
        if ((lo !== null && this.cmp(n.key, lo) <= 0) || (hi !== null && this.cmp(n.key, hi) >= 0))
          loi.push(n.key + ': sai thứ tự BST');
        const hl = go(n.left, lo, n.key);
        const hr = go(n.right, n.key, hi);
        const h = 1 + Math.max(hl, hr);
        if (this.canBang && Math.abs(hl - hr) > 1) loi.push(n.key + ': |bf| > 1');
        if (n.height !== h) loi.push(n.key + ': chiều cao lưu sai');
        return h;
      };
      go(this.root, null, null);
      return loi;
    }

    /** Tọa độ để vẽ cây: x theo thứ tự LNR, y theo độ sâu */
    layout() {
      const nodes = [], edges = [];
      let idx = 0;
      const go = (n, depth) => {
        if (!n) return null;
        const l = go(n.left, depth + 1);
        const me = { key: n.key, h: n.height, bf: AVLTree.bf(n), col: idx++, depth };
        nodes.push(me);
        const r = go(n.right, depth + 1);
        if (l) edges.push([me, l]);
        if (r) edges.push([me, r]);
        return me;
      };
      go(this.root, 0);
      return { nodes, edges, cols: idx, depth: this.height };
    }
  }

  root.AVLTree = AVLTree;
  if (typeof module !== 'undefined' && module.exports) module.exports = { AVLTree };
})(typeof window !== 'undefined' ? window : globalThis);
