/* ============================================================================
 * quicksort.js - Quick Sort tự cài đặt (median-of-three), tương ứng QuickSort.h
 * truoc(a, b) = true nếu a phải đứng trước b.
 * Quick Sort không ổn định nên hàm so sánh luôn có thêm tiêu chí phụ (mã mặt hàng).
 * ========================================================================== */
(function (root) {
  'use strict';

  function quickSort(a, lo, hi, truoc) {
    if (typeof lo === 'function') { truoc = lo; lo = 0; hi = a.length - 1; }
    const swap = (i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; };
    while (lo < hi) {
      const mid = lo + ((hi - lo) >> 1);
      // median-of-three: đưa trung vị về giữa để tránh trường hợp xấu nhất khi dữ liệu đã sắp
      if (truoc(a[mid], a[lo])) swap(mid, lo);
      if (truoc(a[hi], a[lo])) swap(hi, lo);
      if (truoc(a[hi], a[mid])) swap(hi, mid);
      const pivot = a[mid];
      let i = lo, j = hi;
      while (i <= j) {
        while (truoc(a[i], pivot)) i++;
        while (truoc(pivot, a[j])) j--;
        if (i <= j) { swap(i, j); i++; j--; }
      }
      // đệ quy nửa nhỏ hơn, lặp nửa lớn hơn -> độ sâu ngăn xếp O(log n)
      if (j - lo < hi - i) { quickSort(a, lo, j, truoc); lo = i; }
      else { quickSort(a, i, hi, truoc); hi = j; }
    }
    return a;
  }

  root.quickSort = quickSort;
  if (typeof module !== 'undefined' && module.exports) module.exports = { quickSort };
})(typeof window !== 'undefined' ? window : globalThis);
