# Quản lý hàng tồn kho & doanh thu siêu thị — bản Web (ĐT05, cây AVL)

Bản web của bài tập lớn **Cấu trúc dữ liệu và Giải thuật** (đề tài ĐT05). Có **đầy đủ chức năng của bản C++** (20 mục menu),
cài đặt lại **cây AVL, Quick Sort, FEFO, range search** bằng JavaScript thuần, kèm phần **vẽ cây AVL trực quan** để thuyết trình.

- Không cần cài đặt, không cần server, không cần Internet: **mở file `index.html` bằng Chrome / Edge / Firefox là chạy.**
- Dữ liệu tự lưu trong trình duyệt (localStorage) sau mỗi thay đổi — thay cho `kho.dat`.
- Tài khoản admin mặc định: **`admin` / `admin123`** (hoặc vào bằng chế độ **Khách** chỉ xem).

## 1. Cách chạy

1. Giải nén file zip.
2. Nhấp đúp `index.html`.
3. Bấm **Đăng nhập admin** → vào **Dữ liệu & tệp → Nạp dữ liệu mẫu** để có ngay 10 mặt hàng và xem các phép quay AVL.

Nếu trình duyệt chặn lưu dữ liệu khi mở bằng `file://` (hiếm gặp), chạy server cục bộ:
```bash
python -m http.server 8000     # rồi mở http://localhost:8000
```
Có thể đưa lên **GitHub Pages / Netlify** (thư mục này là site tĩnh, không cần build).

## 2. Đối chiếu với bản C++

| Menu C++ | Chức năng | Trang web | Quyền |
|---|---|---|---|
| 1 / 2 / 3 | Thêm / Sửa / Xóa mặt hàng | Danh sách mặt hàng (nút ＋, Sửa, Xóa) | Admin |
| 4 | Tìm theo mã | Danh sách mặt hàng → ô tìm (hiện **đường đi từ gốc**) | Tất cả |
| 5 | Tra cứu khoảng mã (Range Search) | Tra cứu & sắp xếp → Khoảng mã (hiện số nút đã duyệt nhờ cắt nhánh) | Tất cả |
| 6 | Tra cứu khoảng giá | Tra cứu & sắp xếp → Khoảng giá | Tất cả |
| 7 | Danh sách (LNR) | Danh sách mặt hàng | Tất cả |
| 8 | Sắp xếp giá / tồn kho (Quick Sort) | Tra cứu & sắp xếp → Sắp xếp | Tất cả |
| 9 | Nhập kho (phiếu PNxxxx) | Nhập kho | Admin |
| 10 | Xuất kho (phiếu PXxxxx, FEFO) | Xuất kho (lập phiếu nhiều dòng → xác nhận) | Admin |
| 11 | Cảnh báo tồn kho | Cảnh báo tồn kho | Tất cả |
| 12 | Tổng giá trị tồn kho | Tổng giá trị tồn kho | Tất cả |
| 13 | Thống kê (tổng / ngày / tháng / top / hủy) | Doanh thu / xuất kho / hủy (+ lịch sử phiếu) | Admin |
| 14 | Xem cấu trúc cây AVL | Cấu trúc cây AVL (vẽ SVG, h, bf, số phép quay, kiểm tra AVL) | Tất cả |
| 15 / 16 | Ghi / đọc tệp nhị phân | Dữ liệu & tệp (Lưu, Đọc lại, tải/nạp `kho.json`) | Admin |
| 17 | Nạp dữ liệu mẫu | Dữ liệu & tệp → Nạp dữ liệu mẫu (có nhật ký phép quay) | Admin |
| 18 | Đổi mật khẩu admin | Đổi mật khẩu | Admin |
| 19 | Đăng xuất | Nút Đăng xuất (góc trên phải) | Tất cả |
| 20 | Hủy hàng hết hạn (phiếu PHxxxx) | Hủy hàng hết hạn | Admin |
| — | `kho.xlsx` | Xuất **kho.csv** (mở bằng Excel) | Admin |

**Thêm so với bản C++:** trang *Tổng quan*, *Phòng thí nghiệm AVL* (so sánh AVL với cây BST thường), tô sáng đường tìm kiếm trên cây, giao diện sáng/tối.

Các quy tắc nghiệp vụ giữ nguyên: cùng mã lô chỉ cộng dồn khi **cùng hạn sử dụng**; lô hết hạn không xuất được; hủy hàng lập **phiếu xuất hủy riêng** nên không làm sai doanh thu; mã tự chuyển thành chữ HOA; tự động lưu sau mỗi thay đổi; khách không dùng được chức năng admin; nhập sai mật khẩu 3 lần thì quay lại màn hình đầu.

## 3. Cấu trúc thư mục

```
sieuthi-avl-web/
├── index.html
├── css/style.css
├── js/
│   ├── avl.js         # Cây AVL: quay LL/RR/LR/RL, balance factor, range search, LNR, BFS, kiểm tra AVL   (AVLTree.h)
│   ├── quicksort.js   # Quick Sort tự cài đặt, median-of-three                                         (QuickSort.h)
│   ├── store.js       # Nghiệp vụ: mặt hàng, lô, nhập/xuất FEFO, hủy, thống kê, lưu trữ, tài khoản
│   └── ui.js          # Giao diện, các trang, vẽ cây SVG
├── tests/logic.test.js  # Kiểm thử tự động (node tests/logic.test.js)
└── README.md
```
Thứ tự nạp trong `index.html`: `avl.js` → `quicksort.js` → `store.js` → `ui.js` (phần cấu trúc dữ liệu không phụ thuộc giao diện nên chạy được cả bằng Node).

## 4. Độ phức tạp (giống bản C++)

| Thao tác | Độ phức tạp |
|---|---|
| Tìm, thêm, xóa mặt hàng | O(log n) |
| Range Search theo khoảng mã | O(log n + k) |
| Duyệt toàn bộ (LNR) | O(n) |
| Quick Sort | O(n log n) trung bình, O(n²) xấu nhất |
| Xuất kho một mặt hàng (FEFO) | O(m log m), m là số lô |
| Hủy hàng hết hạn | O(n · m) |

## 5. Kịch bản demo (3–5 phút)

1. **Đăng nhập admin → Dữ liệu & tệp → Nạp dữ liệu mẫu.** Cửa sổ hiện ra liệt kê từng phép quay xảy ra khi chèn SP001 … SP010 theo thứ tự tăng dần.
2. **Cấu trúc cây AVL:** cây cao 4 (thay vì 10 nếu là cây thường), dòng *HỢP LỆ ✔*. Gõ `SP007` ở ô tô sáng để thấy đường tìm kiếm chỉ qua vài nút.
3. **Phòng thí nghiệm AVL:** bấm *Chèn 1…15 tăng dần* → AVL cao 4, BST thường cao 15. Thử các ví dụ RR (1,2,3) và LR (3,1,2) để thấy nút vừa quay được tô vàng.
4. **Tra cứu:** khoảng mã `SP002 → SP005` (xem số nút được duyệt), khoảng giá, rồi sắp xếp bằng Quick Sort.
5. **Nhập kho** SP006, lô `L-CU`, hạn khác `01/01/2024` → hệ thống từ chối (cùng mã lô khác hạn).
6. **Xuất kho:** thêm vài mặt hàng vào phiếu → xác nhận → có phiếu PX và cảnh báo tồn kho nếu xuống mức tối thiểu.
7. **Hủy hàng hết hạn:** lô `L-CU` bị xóa, tạo phiếu PH; vào *Thống kê* kiểm tra doanh thu **không đổi**.
8. **Xóa** một nút có hai con (VD SP004 – gốc) rồi xem lại cây vẫn *HỢP LỆ*.
9. F5 tải lại trang: dữ liệu còn nguyên (đã tự lưu); cây được dựng lại **không phát sinh phép quay** vì lưu theo thứ tự BFS.

## 6. Câu hỏi giảng viên hay hỏi

- **Vì sao AVL, không dùng `map`/hash?** Cần duyệt theo thứ tự mã và tra cứu theo khoảng (range search) — hash không làm được; AVL đảm bảo O(log n) kể cả khi nhập dữ liệu đã sắp xếp.
- **Khi nào xảy ra LL, RR, LR, RL?** Chèn/xóa làm bf của một nút thành ±2: lệch trái-trái → LL (quay phải), phải-phải → RR (quay trái), trái-phải → LR (quay trái con rồi quay phải), phải-trái → RL. Xem `_bal()` trong `js/avl.js`.
- **Xóa nút hai con làm thế nào?** Thay bằng nút kế nhiệm (nhỏ nhất bên phải) rồi xóa nút đó, sau đó cân bằng ngược lên gốc (`_rem()`).
- **Vì sao lưu theo BFS?** Chèn lại theo thứ tự tầng sẽ dựng đúng hình dạng cây cũ mà không cần quay.
- **FEFO là gì?** First-Expired-First-Out: lô hết hạn sớm nhất xuất trước; lô đã quá hạn bị bỏ qua (`xuatFEFO()` trong `js/store.js`).
- **Vì sao Quick Sort cần tiêu chí phụ?** Quick Sort không ổn định; so sánh thêm mã hàng để kết quả luôn xác định.

## 7. Hạn chế

- Dữ liệu lưu trong trình duyệt của từng máy (xóa dữ liệu trình duyệt sẽ mất — hãy dùng **Tải kho.json** để sao lưu).
- Mật khẩu admin chỉ lưu cục bộ dạng văn bản (giống bản C++), không phải bảo mật thật. Muốn nhiều người dùng chung dữ liệu cần thêm backend + cơ sở dữ liệu.
- Khóa so sánh theo chuỗi nên mã mặt hàng nên có độ dài cố định (`SP001`, `SP002`…).
- Chưa có xuất trả hàng, hủy theo lý do khác (hư hỏng, mất mát), tài khoản nhân viên.


## Bản sửa giao diện (2026-10-30)
- Sửa màn hình đăng nhập: `#app.login-mode` không còn dùng flex-row của màn hình quản trị; login-wrap phủ toàn bộ chiều rộng và chiều cao viewport.
- Sửa menu ba gạch: sidebar trượt từ cạnh trái, có lớp nền phủ; nhấn nút để mở/đóng, nhấn vùng tối hoặc phím Escape để đóng; chuyển trang cũng tự đóng menu.
- Nút menu có `aria-controls` và `aria-expanded` để hỗ trợ truy cập.


### Sửa bổ sung menu ba gạch (2026-10-30)
- Desktop (trên 900px): nút ba gạch thu gọn sidebar về 0px, phần nội dung tự mở rộng; nhấn lần nữa để hiện lại.
- Mobile / màn hình hẹp (tối đa 900px): sidebar trượt ra/vào dạng drawer, có backdrop; nút menu luôn hiển thị.
- Đồng bộ `aria-expanded`; chuyển trang đóng drawer trên màn hình hẹp.
