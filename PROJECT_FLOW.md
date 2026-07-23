# 1. Tổng quan
- **Mục đích dự án**: Website giới thiệu và quản lý dịch vụ cho thuê xe du lịch Khánh Linh Trans (Hà Nội), hỗ trợ giao diện đa ngôn ngữ (VI/EN) và trang quản trị Admin.
- **Công nghệ sử dụng**: Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS (`globals.css`, `user.css`, `admin.css`), `bcryptjs`, JSON database file (`db.json`).
- **Cách chạy project**: 
  - Khởi chạy dev server: `npm run dev`
  - Khôi phục tài khoản admin mặc định: `npm run reset-admin`
  - Build sản phẩm: `npm run build`

# 2. Cấu trúc thư mục
- `app/`: Chứa giao diện người dùng, trang Admin và các REST API routes.
- `app/admin/`: Giao diện Dashboard quản trị nội dung (đội xe, bảng giá, sale, đánh giá, FAQ, tài khoản).
- `app/api/`: Các REST API endpoints phục vụ truy vấn công khai và quản trị.
- `app/api/admin/`: Các API quản trị nội bộ yêu cầu xác thực Header.
- `app/api/admin/_lib/`: Tiện ích xác thực Admin (`adminAuth.ts`) và đọc/ghi file `db.json`.
- `app/api/vehicles/`: API công khai hỗ trợ lấy và thao tác dữ liệu đội xe.
- `app/components/`: Component hệ thống dùng chung (như Toast thông báo).
- `public/`: Chứa tài nguyên tĩnh, hình ảnh thương hiệu và tệp ảnh được tải lên (`public/images/`).
- `scripts/`: Script tiện ích dòng lệnh (khôi phục mật khẩu Admin).
- `tools/`: Các script hỗ trợ audit CSS và thống kê media queries.
- `prototype/`: Lưu trữ bản mẫu thiết kế giao diện mobile.

# 3. Luồng hệ thống
- **Xem thông tin & Đội xe**: User → `app/page.tsx` → `db.json` / `app/api/vehicles` → Frontend Render
- **Đăng nhập Admin**: Admin → `app/admin/page.tsx` → `app/api/admin/account/route.ts` → `adminAuth.ts` → `db.json`
- **Quản lý dữ liệu Admin**: Admin → `app/admin/page.tsx` → `app/api/admin/data/route.ts` → `adminAuth.ts` → `db.json`
- **Tải lên / Xóa ảnh**: Admin → `app/admin/page.tsx` → `app/api/admin/upload/route.ts` → `adminAuth.ts` → `public/images/`
- **Thay đổi Tài khoản Admin**: Admin → `app/admin/page.tsx` → `app/api/admin/account/route.ts` → `bcryptjs` → `db.json`

# 4. Chức năng chính

## Trang chủ & Đa ngôn ngữ (VI/EN)
- **Mục đích**: Hiển thị thông tin dịch vụ, danh sách xe, bảng giá, đánh giá khách hàng, FAQ và cổng liên hệ Zalo/Hotline.
- **File liên quan**: `app/page.tsx`, `app/site-header.tsx`, `app/fleet-section.tsx`, `app/FloatingContactWidget.tsx`, `app/translations.ts`, `db.json`.
- **Luồng xử lý**: Page → Local State (`lang`) → Read `db.json` & `translations.ts` → UI Render

## Quản lý Đội xe (Admin Fleet Management)
- **Mục đích**: Thêm, sửa, xóa xe, giá thuê, badge, thông số kỹ thuật và hình ảnh theo ngôn ngữ.
- **File liên quan**: `app/admin/page.tsx`, `app/api/admin/vehicles/route.ts`, `app/api/admin/upload/route.ts`, `db.json`.
- **Luồng xử lý**: Admin Page → `/api/admin/upload` (Save Image) → `/api/admin/vehicles` (POST/PUT/DELETE) → `adminAuth.ts` → `db.json`

## Quản lý Nội dung (Pricing, Sales, Testimonials, FAQ)
- **Mục đích**: Cập nhật thông tin bảng giá tham khảo, chuyên viên tư vấn, đánh giá từ khách hàng và câu hỏi thường gặp.
- **File liên quan**: `app/admin/page.tsx`, `app/api/admin/data/route.ts`, `db.json`.
- **Luồng xử lý**: Admin Page → `/api/admin/data?type=...` → `adminAuth.ts` → Write `db.json`

## Bảo mật & Quản lý Tài khoản Admin
- **Mục đích**: Xác thực quyền truy cập trang quản trị và cho phép đổi username/mật khẩu mã hóa bcrypt.
- **File liên quan**: `app/admin/page.tsx`, `app/api/admin/account/route.ts`, `app/api/admin/_lib/adminAuth.ts`, `scripts/reset-admin.js`, `db.json`.
- **Luồng xử lý**: Admin Form → Request Header Auth → `/api/admin/account` → `bcryptjs` Hash → Update `db.json`

## Tải lên & Quản lý Hình ảnh
- **Mục đích**: Tải tệp ảnh trực tiếp lên thư mục server public và dọn dẹp ảnh cũ khi thay thế/xóa.
- **File liên quan**: `app/admin/page.tsx`, `app/api/admin/upload/route.ts`, `public/images/`.
- **Luồng xử lý**: Admin Form → Multipart Form Data → `/api/admin/upload` → Save/Unlink File in `public/images/`

# 5. Database
- **Kiểu dữ liệu**: Dữ liệu lưu vết trực tiếp dạng JSON File Storage tại `db.json`.
- **Danh sách cấu trúc chính**:
  - `vehicles`: Lưu danh sách xe phân biệt theo ngôn ngữ (`vi`, `en`), chứa `id`, `name`, `badge`, `price`, `image`, `specs`.
  - `pricing`: Lưu dữ liệu bảng giá phân theo ngôn ngữ (`vi`, `en`), chứa `heading`, `lead`, `note`, `cols`, `rows`.
  - `sales`: Mảng danh sách chuyên viên tư vấn, chứa `id`, `name`, `phone`, `zalo`, `avatar`.
  - `testimonials`: Lưu phản hồi & chỉ số uy tín theo ngôn ngữ (`vi`, `en`), chứa `heading`, `lead`, `items`, `stats`.
  - `faq`: Lưu câu hỏi thường gặp theo ngôn ngữ (`vi`, `en`), chứa `heading`, `lead`, `items`.
  - `admin`: Lưu thông tin tài khoản admin gồm `username`, `passwordHash`, `createdAt`, `updatedAt`.
- **Quan hệ giữa chúng**: 
  - Các phần dữ liệu độc lập với nhau, liên kết logic theo mã ngôn ngữ (`vi`, `en`).

# 6. API

| Endpoint | Method | Mục đích |
| --- | --- | --- |
| `/api/vehicles` | GET | Lấy danh sách xe công khai theo ngôn ngữ (`?lang=vi\|en`) |
| `/api/vehicles` | POST / PUT / DELETE | Thao tác dữ liệu xe (Endpoint phụ/tương thích) |
| `/api/admin/account` | GET | Lấy thông tin tài khoản Admin hiện tại |
| `/api/admin/account` | PUT | Cập nhật username hoặc mật khẩu Admin |
| `/api/admin/vehicles` | GET | Lấy danh sách xe trang Admin theo ngôn ngữ |
| `/api/admin/vehicles` | POST | Thêm xe mới vào danh sách theo ngôn ngữ |
| `/api/admin/vehicles` | PUT | Cập nhật xe theo ID và ngôn ngữ (`?id=...&lang=...`) |
| `/api/admin/vehicles` | DELETE | Xóa xe khỏi danh sách theo ID và ngôn ngữ (`?id=...&lang=...`) |
| `/api/admin/data` | GET | Lấy dữ liệu section theo type (`sales`, `vehicles`, `pricing`, `testimonials`, `faq`) |
| `/api/admin/data` | POST | Thêm item vào section dạng mảng (`sales`, `vehicles`) |
| `/api/admin/data` | PUT | Cập nhật dữ liệu cho từng section theo ngôn ngữ |
| `/api/admin/data` | DELETE | Xóa item khỏi section mảng theo ID |
| `/api/admin/upload` | POST | Tải tệp ảnh lên `public/images/` và tự động xóa ảnh cũ |
| `/api/admin/upload` | DELETE | Xóa tệp ảnh khỏi thư mục public theo đường dẫn (`?path=...`) |

# 7. Quyền người dùng
- **Khách hàng (Guest User)**:
  - Xem toàn bộ thông tin trang chủ, đổi ngôn ngữ (VI/EN), tra cứu xe, bảng giá, đánh giá và FAQ.
  - Tương tác gọi điện, gửi tin nhắn Zalo với chuyên viên tư vấn.
  - Không có quyền truy cập các route `/admin` và API `/api/admin/*`.
- **Quản trị viên (Admin)**:
  - Có toàn quyền truy cập trang `/admin` và toàn bộ các API quản trị `/api/admin/*`.
  - Xác thực qua thông tin Username & Password truyền trong Request Headers (`x-admin-username`, `x-admin-password`).
  - Được phép đổi username/mật khẩu đăng nhập và quản lý toàn bộ nội dung trong `db.json` cũng như tệp ảnh.

# 8. Luồng quan trọng nhất

## Flow 1: Khách hàng xem và chuyển đổi ngôn ngữ
1. User truy cập `/` -> Next.js render `app/page.tsx`.
2. Dữ liệu từ `db.json` và `translations.ts` được nạp vào React State.
3. User chọn ngôn ngữ (VI/EN) trên Header.
4. State `lang` cập nhật -> Giao diện tự động re-render nội dung tương ứng.

## Flow 2: Đăng nhập Quản trị viên
1. Admin truy cập `/admin` -> Nhập Username & Password.
2. Form lưu thông tin vào state local của trình duyệt.
3. Gửi Request kèm Header `x-admin-username` & `x-admin-password` tới `/api/admin/account`.
4. `adminAuth.ts` đọc `db.json` và đối soát hash mật khẩu bằng `bcryptjs`.
5. Nếu chính xác, Dashboard Admin mở khóa giao diện quản trị.

## Flow 3: Thêm mới xe vào hệ thống
1. Admin chọn tab "Đội xe", chọn ngôn ngữ hiển thị và bấm "Thêm xe".
2. Tải ảnh xe lên -> `/api/admin/upload` lưu tệp vào `public/images/` và trả về đường dẫn.
3. Admin điền tên xe, giá, badge và thông số kỹ thuật.
4. Bấm lưu -> Gửi `POST` tới `/api/admin/vehicles` (hoặc `/api/admin/data?type=vehicles`).
5. Server xác thực quyền Admin, tự tạo ID mới và lưu thông tin vào `db.json`.

## Flow 4: Cập nhật nội dung (Bảng giá / Đánh giá / FAQ)
1. Admin chọn tab tương ứng ("Bảng giá", "Đánh giá", "FAQ").
2. Chỉnh sửa dữ liệu trên các trường thông tin.
3. Bấm lưu -> Gửi `PUT` tới `/api/admin/data?type=...&lang=...`.
4. Server xác thực Admin và cập nhật trực tiếp vào section tương ứng trong `db.json`.

## Flow 5: Đổi mật khẩu Admin
1. Admin chọn tab "Tài khoản", chọn mục đổi mật khẩu.
2. Nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.
3. Bấm cập nhật -> Gửi `PUT` tới `/api/admin/account` với `action="password"`.
4. Server dùng `bcryptjs` mã hóa mật khẩu mới và cập nhật trường `admin` trong `db.json`.

## Flow 6: Reset tài khoản Admin qua CLI
1. Admin/Dev chạy lệnh `npm run reset-admin` trên môi trường terminal máy chủ.
2. Node.js thực thi script `scripts/reset-admin.js`.
3. Script dùng `bcryptjs` băm mật khẩu mặc định (`KhanhLinh2026!`).
4. Ghi trực tiếp Username (`adminKhanhLinhTrans`) và password hash mới vào `db.json`.

# 9. File cần đọc trước
1. [package.json](file:///f:/web_khanh_linh_trans/web_khanh_linh/package.json): Nắm danh sách các thư viện và lệnh thực thi.
2. [db.json](file:///f:/web_khanh_linh_trans/web_khanh_linh/db.json): Hiểu cấu trúc lưu trữ toàn bộ dữ liệu dự án.
3. [adminAuth.ts](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/api/admin/_lib/adminAuth.ts): Đọc cơ chế xác thực Admin và thao tác đọc/ghi JSON database.
4. [page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/page.tsx): Tìm hiểu trang chủ người dùng và cách kết nối các component hiển thị.
5. [admin/page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/page.tsx): Tìm hiểu toàn bộ giao diện quản trị Admin và cách gọi API.
6. [data/route.ts](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/api/admin/data/route.ts): Tìm hiểu các REST API CRUD dữ liệu chính.
7. [upload/route.ts](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/api/admin/upload/route.ts): Hiểu cách xử lý upload và dọn dẹp file hình ảnh.
8. [reset-admin.js](file:///f:/web_khanh_linh_trans/web_khanh_linh/scripts/reset-admin.js): Tham khảo script tiện ích khôi phục mật khẩu Admin.
