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

## Giao diện & Layout Chuyên viên hỗ trợ (Support Specialists UI)
- **Mục đích**: Hiển thị danh sách chuyên viên tư vấn hỗ trợ đặt xe, gọi Hotline và gửi tin nhắn Zalo.
- **File liên quan**: `app/page.tsx`, `app/user.css`, `db.json`.
- **Quy chuẩn Layout**:
  - Avatar tỉ lệ chuẩn 1:1 tròn (`aspect-ratio: 1/1`, `object-fit: cover`, `border-radius: 50%`), không biến dạng.
  - Tên chuyên viên cho phép hiển thị tối đa 2 dòng khi tên dài ~5 từ (ví dụ: *"Nguyễn Văn Minh Anh"*), có `line-clamp: 2` và `word-break: break-word`.
  - Giữ chiều cao các card bằng nhau trên cùng hàng (`grid-template-columns: repeat(2, 1fr)`, `align-items: stretch`).
  - Các nút hành động (Liên hệ Hotline / Zalo) luôn căn sát lề phải và thẳng hàng dọc giữa các card (`margin-left: auto`, `flex-shrink: 0`).
  - Responsive: Desktop (2 cột layout ngang), Mobile (1 cột layout dọc căn giữa, nút bấm 2 cột song song).

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

## Kiến trúc Module Blog & Block Editor Architecture (Gutenberg/Notion style)
- **Mục đích**: Hệ thống quản lý bài viết độc lập dạng Block CMS, cho phép người viết chèn, di chuyển, nhân bản và xóa từng khối nội dung (Paragraph, Heading, Image, Gallery, Quote, Divider, Youtube).
- **Cấu trúc lưu trữ**:
  - `data/news-index.json`: Lưu danh sách metadata nhẹ (ID, slug, tiêu đề, tóm tắt, thumbnail, ngày đăng, trạng thái draft/published, featured).
  - `data/news/{slug}.json`: Lưu chi tiết các mảng khối `blocks: { vi: BlogBlock[], en: BlogBlock[] }` và thông tin SEO.
- **Tương thích ngược (Backward Compatibility)**:
  - Tự động phát hiện các tệp JSON bài viết cũ lưu `content` HTML và chuyển đổi (migrate) tự động thành các Block tương ứng (`migrateLegacyHtmlToBlocks`).
- **Các Component Block (`app/components/blog/`)**:
  - `types.ts`: Khai báo các type khối (`ParagraphBlockData`, `HeadingBlockData`, `ImageBlockData`, `GalleryBlockData`, `QuoteBlockData`, `DividerBlockData`, `YoutubeBlockData`).
  - `ParagraphBlock.tsx`: Render đoạn văn bản.
  - `HeadingBlock.tsx`: Render tiêu đề H1-H4.
  - `ImageBlock.tsx`: Render hình ảnh với căn lề Left/Center/Right/Full Width và chú thích.
  - `GalleryBlock.tsx`: Render bộ sưu tập ảnh 2, 3, 4 cột responsive.
  - `QuoteBlock.tsx`: Render khối trích dẫn kèm tác giả.
  - `DividerBlock.tsx`: Render đường kẻ phân đoạn.
  - `YoutubeBlock.tsx`: Render video Youtube nhúng tỉ lệ 16:9 responsive.
  - `BlockRenderer.tsx`: Component trung tâm điều phối render mảng blocks theo `type`.
- **Trình chỉnh sửa Admin Block Editor (`app/admin/blog/BlockEditor.tsx`)**:
  - Giao diện Card Block trực quan.
  - Hỗ trợ nút thao tác trên từng card: Di chuyển Up/Down (▲/▼), Nhân bản (📋), Xóa (🗑️).
  - Menu chèn Block mới sinh động: `+ Paragraph`, `+ Heading`, `+ Image`, `+ Gallery`, `+ Quote`, `+ Divider`, `+ Youtube`.

# 9. File cần đọc trước
1. [package.json](file:///f:/web_khanh_linh_trans/web_khanh_linh/package.json): Nắm danh sách các thư viện và lệnh thực thi.
2. [db.json](file:///f:/web_khanh_linh_trans/web_khanh_linh/db.json): Hiểu cấu trúc lưu trữ toàn bộ dữ liệu dự án.
3. [adminAuth.ts](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/api/admin/_lib/adminAuth.ts): Đọc cơ chế xác thực Admin và thao tác đọc/ghi JSON database.
4. [page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/page.tsx): Tìm hiểu trang chủ người dùng và cách kết nối các component hiển thị.
5. [user.css](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/user.css): Tìm hiểu hệ thống style, layout responsive và quy chuẩn UI Chuyên viên hỗ trợ.
6. [admin/page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/page.tsx): Tìm hiểu toàn bộ giao diện quản trị Admin và cách gọi API.
7. [blogDb.ts](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/lib/blogDb.ts): Xử lý đọc/ghi cơ sở dữ liệu bài viết Blog và migrate Block Editor.
8. [BlockEditor.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/blog/BlockEditor.tsx): Trình quản lý bài viết theo dạng khối Card Block.
9. [BlockRenderer.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/components/blog/BlockRenderer.tsx): Component render động các Block bài viết phía User.
