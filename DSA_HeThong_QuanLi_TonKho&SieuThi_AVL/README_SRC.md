# Cấu trúc mã nguồn C++ đã tách

Mã nguồn C++ trước đây nằm trong `main_full.cpp` đã được chia theo các module tương ứng với `src`:

- `src/main.cpp`: menu và điểm bắt đầu chương trình.
- `src/Date.h`, `src/Utils.h`: ngày tháng và hàm tiện ích/nhập liệu.
- `src/MatHang.h`, `src/Phieu.h`, `src/AVLTree.h`: mô hình hàng hóa, phiếu và cây AVL.
- `src/Excel.h`, `src/FileIO.h`, `src/TaiKhoan.h`: Excel, lưu trữ nhị phân và tài khoản.
- `src/QuanLyKho.h`: khai báo lớp điều phối.
- `src/QuanLyMatHang.h`, `src/SapXep.h`, `src/TongGiaTri.h`, `src/NhapXuat.h`, `src/XuatHuy.h`, `src/ThongKe.h`, `src/LuuTru.h`, `src/DuLieuMau.h`: xử lý nghiệp vụ theo chức năng.

## Biên dịch

Tại thư mục dự án:

```bash
make
```

Hoặc chạy trực tiếp:

```bash
g++ -std=c++11 -O2 -Isrc src/main.cpp -o sieuthi
```

Các phần nghiệp vụ vẫn nằm trong header như cấu trúc `sieuthi_src` ban đầu, để không thay đổi cách liên kết và tránh thay đổi hành vi chương trình khi tách file.
