# 🛒 Hệ thống quản lý hàng tồn kho & doanh thu siêu thị

> Ứng dụng mô phỏng quy trình quản lý sản phẩm, nhập kho, bán hàng và thống kê doanh thu cho một siêu thị nhỏ. Điểm nhấn của dự án là **cây cân bằng AVL** được sử dụng làm cấu trúc dữ liệu chính để quản lý và tra cứu sản phẩm hiệu quả.

<p align="center">
  <strong>Đề tài ĐT05 · Data Structures & Algorithms · C++ / JavaScript</strong>
</p>

---

## 📌 Giới thiệu

Trong hoạt động bán lẻ, việc theo dõi sản phẩm, số lượng tồn kho, hạn sử dụng và doanh thu là những nghiệp vụ quan trọng. Dự án này xây dựng một hệ thống quản lý siêu thị ở quy mô mô phỏng, tập trung vận dụng kiến thức **Cấu trúc dữ liệu và Giải thuật (DSA)** vào một bài toán thực tế.

Thay vì chỉ lưu danh sách sản phẩm bằng mảng thông thường, chương trình sử dụng **cây AVL** với khóa là mã sản phẩm. Cây tự động cân bằng sau thao tác thêm và xóa, giúp duy trì hiệu quả tìm kiếm. Hệ thống còn hỗ trợ quản lý nhiều lô hàng cho một sản phẩm, xuất kho theo nguyên tắc FEFO, cảnh báo hàng sắp hết và theo dõi doanh thu.

Dự án gồm hai phiên bản:

- **Phiên bản C++ Console:** triển khai nghiệp vụ và cấu trúc dữ liệu bằng C++11, có chức năng lưu/đọc dữ liệu bằng tệp nhị phân.
- **Phiên bản Web:** giao diện HTML, CSS và JavaScript, mô phỏng các nghiệp vụ chính, trực quan hóa cây AVL và lưu dữ liệu trong `localStorage` của trình duyệt.

## ✨ Tính năng chính

### 1. Quản lý sản phẩm

- Thêm sản phẩm với mã, tên, giá bán và mức tồn tối thiểu.
- Cập nhật thông tin sản phẩm.
- Xóa sản phẩm khỏi hệ thống.
- Kiểm tra mã sản phẩm trùng lặp.
- Hiển thị danh sách sản phẩm theo thứ tự mã tăng dần.
- Theo dõi tổng số lượng tồn và trạng thái tồn kho.

### 2. Tra cứu sản phẩm

- Tìm sản phẩm theo mã bằng cây AVL.
- Tìm sản phẩm trong một khoảng mã (*Range Search*).
- Lọc sản phẩm theo khoảng giá.
- Hiển thị kết quả tìm kiếm trực tiếp trên giao diện web.

### 3. Quản lý nhập kho và lô hàng

- Chọn sản phẩm cần nhập kho.
- Nhập mã lô, số lượng, hạn sử dụng, vị trí lưu kho và nhà cung cấp.
- Lập phiếu nhập kho và lưu lịch sử nhập.
- Nếu nhập lại đúng mã lô của cùng sản phẩm, hệ thống cộng số lượng vào lô hiện có.
- Theo dõi nhiều lô hàng thuộc cùng một sản phẩm.

Mỗi lô hàng có các thông tin cơ bản: mã lô, số lượng tồn, hạn sử dụng và vị trí kho.

### 4. Bán hàng và thanh toán

- Chọn sản phẩm và số lượng cần bán.
- Thêm sản phẩm vào giỏ hàng.
- Tính thành tiền từng mặt hàng và tổng tiền đơn hàng.
- Thanh toán và tạo hóa đơn.
- Cập nhật số lượng tồn kho sau khi bán.

**Nguyên tắc FEFO (First Expired, First Out):** hệ thống ưu tiên xuất các lô có hạn sử dụng gần nhất trước. Các lô đã hết hạn không được tính vào lượng hàng có thể bán.

### 5. Cảnh báo tồn kho và hạn sử dụng

- Cảnh báo sản phẩm có lượng tồn bằng hoặc thấp hơn mức tồn tối thiểu.
- Liệt kê các lô đã hết hạn nhưng vẫn còn số lượng tồn.
- Hiển thị thông tin mã sản phẩm, mã lô, số lượng, hạn sử dụng và vị trí kho để tiện theo dõi.

> Lưu ý: lô hết hạn được đưa vào danh sách cảnh báo; việc nhập lô mới không đồng nghĩa với tự động xóa lô cũ.

### 6. Thống kê doanh thu

- Tổng hợp tổng doanh thu.
- Thống kê số lượng hóa đơn.
- Tra cứu doanh thu theo ngày.
- Tra cứu doanh thu theo tháng.
- Xếp hạng sản phẩm bán chạy theo số lượng và doanh thu.

### 7. Trực quan hóa cây AVL (phiên bản Web)

- Hiển thị cấu trúc cây AVL.
- Theo dõi chiều cao và hệ số cân bằng (*Balance Factor*).
- Ghi nhận nhật ký các phép quay khi cây mất cân bằng.
- Thống kê bốn trường hợp quay LL, RR, LR và RL.

### 8. Lưu trữ và sao lưu dữ liệu

| Phiên bản | Cách lưu dữ liệu |
|---|---|
| C++ Console | Đọc và ghi dữ liệu bằng tệp nhị phân |
| Web | Tự động lưu trong `localStorage` của trình duyệt |
| Web | Hỗ trợ xuất dữ liệu ra JSON và nhập lại từ JSON |

---

## 🧠 Cấu trúc dữ liệu và thuật toán

### Cây AVL

Cây AVL là cây tìm kiếm nhị phân tự cân bằng. Với mỗi nút, độ chênh lệch chiều cao giữa cây con trái và cây con phải không vượt quá 1.

Trong dự án:

- **Khóa (Key):** mã sản phẩm.
- **Dữ liệu (Data):** thông tin sản phẩm và danh sách các lô hàng.
- **Balance Factor:** `height(left) - height(right)`.
- Sau khi chèn hoặc xóa, chương trình cập nhật chiều cao và kiểm tra cân bằng để thực hiện phép quay phù hợp.

Bốn trường hợp mất cân bằng:

| Trường hợp | Cách xử lý |
|---|---|
| LL | Quay phải |
| RR | Quay trái |
| LR | Quay trái ở cây con trái, sau đó quay phải |
| RL | Quay phải ở cây con phải, sau đó quay trái |

### Độ phức tạp tham khảo

Gọi `N` là số lượng sản phẩm trong cây AVL.

| Thao tác | Độ phức tạp |
|---|---:|
| Tìm kiếm theo mã | `O(log N)` |
| Thêm sản phẩm | `O(log N)` |
| Xóa sản phẩm | `O(log N)` |
| Tìm kiếm theo khoảng mã | `O(log N + K)` với `K` là số kết quả |
| Duyệt toàn bộ cây | `O(N)` |

Các độ phức tạp trên áp dụng cho cây AVL có chiều cao được duy trì cân bằng. Lọc theo giá trong phiên bản web hiện thực bằng cách duyệt danh sách sản phẩm, vì vậy thao tác này có độ phức tạp tuyến tính trước bước sắp xếp kết quả.

### FEFO trong quản lý lô hàng

Khi thực hiện xuất kho, hệ thống:

1. Chỉ xét các lô còn hạn sử dụng và có số lượng lớn hơn 0.
2. Sắp xếp các lô theo hạn sử dụng tăng dần.
3. Trừ số lượng lần lượt từ lô gần hết hạn nhất.
4. Không cho phép bán vượt quá lượng tồn có thể bán.

Cách làm này giúp hạn chế tình trạng hàng có hạn sử dụng gần nhất bị lưu kho quá lâu.

---

## 🧰 Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| C++11 | Xây dựng phiên bản chương trình console |
| HTML5 | Xây dựng cấu trúc giao diện web |
| CSS3 | Thiết kế và trình bày giao diện |
| JavaScript (ES6) | Xử lý nghiệp vụ và tương tác trên trình duyệt |
| AVL Tree | Cấu trúc dữ liệu quản lý sản phẩm |
| SVG | Vẽ cây AVL trên giao diện web |
| Local Storage | Lưu dữ liệu phía trình duyệt |
| JSON | Sao lưu và khôi phục dữ liệu phiên bản web |
| Binary File I/O | Lưu và đọc dữ liệu phiên bản C++ |

**Không sử dụng framework frontend hoặc cơ sở dữ liệu máy chủ** trong phiên bản web hiện tại. Đây là ứng dụng web tĩnh chạy trực tiếp trên trình duyệt.

---

## 📂 Cấu trúc thư mục

```text
sieuthi_avl_web/
│
├── index.html              # Trang giao diện chính
├── README.md               # Tài liệu giới thiệu dự án
│
├── css/
│   └── style.css           # Định dạng giao diện
│
├── js/
│   ├── avl.js              # Cài đặt Node và cây AVL bằng JavaScript
│   └── app.js              # Nghiệp vụ, xử lý dữ liệu và giao diện
│
└── cpp/
    └── main.cpp            # Phiên bản quản lý siêu thị bằng C++
```

Trong gói mã nguồn ban đầu có thể có thêm một tệp `main.cpp` ở thư mục ngoài cùng. Phiên bản nằm trong `cpp/main.cpp` là bản được đặt theo cấu trúc thư mục dự án.

---

## 🚀 Cài đặt và chạy dự án

### A. Chạy phiên bản Web

Phiên bản web không yêu cầu cài đặt framework hay máy chủ backend.

**Cách 1: Mở trực tiếp**

1. Tải dự án về máy và giải nén.
2. Mở thư mục `sieuthi_avl_web`.
3. Mở tệp `index.html` bằng Chrome, Edge hoặc Firefox.
4. Chọn **Nạp dữ liệu mẫu** để xem dữ liệu minh họa.
5. Chuyển sang tab **Cây AVL** để quan sát cấu trúc cây và nhật ký phép quay.

**Cách 2: Chạy bằng VS Code**

1. Mở thư mục dự án bằng Visual Studio Code.
2. Mở `index.html`.
3. Chạy bằng tiện ích Live Server nếu đã cài đặt.

### B. Biên dịch phiên bản C++

Yêu cầu trình biên dịch hỗ trợ chuẩn **C++11** trở lên, ví dụ GCC/G++.

Mở Terminal tại thư mục chứa `main.cpp`, chạy:

```bash
g++ -std=c++11 -o sieuthi main.cpp
```

Trên Windows:

```bash
g++ -std=c++11 -o sieuthi.exe main.cpp
```

Chạy chương trình:

```bash
./sieuthi
```

Trên Windows CMD:

```bash
sieuthi.exe
```

Có thể mở và biên dịch mã nguồn bằng Code::Blocks, Dev-C++ hoặc Visual Studio Code kết hợp MinGW/GCC. Nếu dùng Dev-C++, hãy chọn chuẩn C++11 trong phần thiết lập trình biên dịch.

---

## 🖥️ Hướng dẫn sử dụng phiên bản Web

Sau khi mở `index.html`, giao diện có các khu vực:

| Tab | Chức năng |
|---|---|
| Sản phẩm | Thêm, sửa, xóa và tra cứu sản phẩm |
| Nhập kho | Nhập lô hàng và xem lịch sử phiếu nhập |
| Bán hàng | Tạo giỏ hàng, thanh toán và xem hóa đơn |
| Cảnh báo | Theo dõi sản phẩm sắp hết và lô hết hạn |
| Doanh thu | Xem thống kê và sản phẩm bán chạy |
| Cây AVL | Quan sát cây, hệ số cân bằng và nhật ký phép quay |

### Sao lưu dữ liệu

- Chọn **Xuất file JSON** để tải dữ liệu hiện tại về máy.
- Chọn **Nhập file JSON** để khôi phục dữ liệu từ tệp JSON đã xuất trước đó.
- Nút **Xóa tất cả** sẽ xóa dữ liệu đang sử dụng trong ứng dụng; hãy sao lưu trước nếu cần giữ lại dữ liệu.

Dữ liệu `localStorage` gắn với trình duyệt và môi trường chạy hiện tại. Xóa dữ liệu trang web hoặc đổi trình duyệt có thể khiến dữ liệu chưa sao lưu không còn khả dụng.

---

## 🧪 Dữ liệu mẫu và kiểm thử gợi ý

Bạn có thể dùng nút **Nạp dữ liệu mẫu** để bắt đầu trải nghiệm. Sau đó thử các tình huống:

1. Thêm nhiều sản phẩm với mã tăng dần hoặc theo thứ tự khác nhau để quan sát cây AVL.
2. Tìm kiếm một mã sản phẩm đã tồn tại và một mã không tồn tại.
3. Tìm theo khoảng mã và khoảng giá.
4. Nhập thêm một lô hàng cho sản phẩm, sau đó kiểm tra tổng tồn và lịch sử phiếu nhập.
5. Nhập hai lô có hạn sử dụng khác nhau, rồi bán hàng để kiểm tra thứ tự xuất FEFO.
6. Tạo sản phẩm có lượng tồn thấp hơn hoặc bằng mức tối thiểu để kiểm tra cảnh báo.
7. Kiểm tra danh sách lô đã hết hạn còn tồn.
8. Tạo một số hóa đơn để xem thống kê doanh thu và sản phẩm bán chạy.
9. Xuất JSON, làm mới trang và nhập lại JSON để kiểm tra khả năng sao lưu/khôi phục.

---

## ⚠️ Phạm vi và giới hạn hiện tại

Đây là dự án học tập/mô phỏng nghiệp vụ, chưa phải hệ thống thương mại triển khai thực tế.

- Phiên bản web lưu dữ liệu trên trình duyệt, chưa có backend, API hoặc cơ sở dữ liệu dùng chung giữa nhiều người.
- Chưa có hệ thống đăng nhập, phân quyền nhân viên/quản trị viên.
- Chưa tích hợp máy quét mã vạch, máy in hóa đơn hoặc cổng thanh toán.
- Dữ liệu mẫu phục vụ việc trải nghiệm và kiểm tra chức năng.
- Việc đồng bộ dữ liệu giữa phiên bản C++ và phiên bản Web chưa được triển khai tự động; hai phiên bản đang sử dụng cơ chế lưu trữ riêng.
- Tệp nhị phân của phiên bản C++ không phải định dạng JSON và không thể mở trực tiếp bằng trình duyệt như tệp dữ liệu web.

---

## 🛣️ Hướng phát triển

Một số hướng có thể mở rộng trong các phiên bản tiếp theo:

- Xây dựng backend và cơ sở dữ liệu để nhiều máy có thể sử dụng chung.
- Bổ sung đăng nhập, phân quyền và nhật ký thao tác.
- Tự động sinh mã sản phẩm, mã lô và mã phiếu.
- Bổ sung chức năng chỉnh sửa/xóa lô hàng có kiểm soát.
- Thêm bộ lọc theo nhà cung cấp, vị trí kho và hạn sử dụng.
- Xuất hóa đơn hoặc báo cáo doanh thu ra PDF/Excel.
- Bổ sung biểu đồ trực quan doanh thu theo ngày, tháng và sản phẩm.
- Viết bộ kiểm thử tự động cho các thao tác AVL, nhập kho và xuất kho.
- Tạo API để đồng bộ dữ liệu giữa giao diện web và chương trình C++ hoặc backend.

---

## 🎓 Mục tiêu học tập

Thông qua dự án, người thực hiện có cơ hội vận dụng:

- Cấu trúc dữ liệu cây tìm kiếm nhị phân và cây AVL.
- Đệ quy, con trỏ và quản lý bộ nhớ trong C++.
- Các phép quay cân bằng LL, RR, LR, RL.
- Tìm kiếm theo khóa và tìm kiếm theo khoảng.
- Quản lý dữ liệu bằng `vector`, `queue` và các cấu trúc phù hợp.
- Đọc/ghi tệp nhị phân trong C++.
- Xây dựng giao diện web bằng HTML, CSS và JavaScript.
- Lưu trữ dữ liệu phía trình duyệt với Local Storage và JSON.
- Phân tích một bài toán quản lý thực tế thành các chức năng phần mềm.

## 🤝 Đóng góp

Nếu muốn phát triển dự án, bạn có thể:

1. Fork repository.
2. Tạo nhánh mới cho tính năng hoặc bản sửa lỗi.
3. Thực hiện thay đổi và kiểm tra lại các nghiệp vụ liên quan.
4. Gửi Pull Request kèm mô tả ngắn gọn về nội dung thay đổi.

Các góp ý về thuật toán AVL, tính đúng đắn của nghiệp vụ kho và trải nghiệm giao diện đều được hoan nghênh.

## 📄 Giấy phép

Dự án hiện chưa khai báo giấy phép sử dụng. Nếu muốn công khai mã nguồn để người khác sử dụng, chỉnh sửa hoặc phân phối, hãy chọn và bổ sung một giấy phép phù hợp (ví dụ MIT) cùng tệp `LICENSE`.

---

<p align="center">
  <strong>Built for learning · Powered by AVL Tree 🌳</strong><br>
  <sub>Quản lý tốt dữ liệu hôm nay — vận hành hiệu quả hơn ngày mai.</sub>
</p>
