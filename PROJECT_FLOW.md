# 1. Tổng quan
- **Mục đích dự án**: Website giới thiệu và quản lý dịch vụ cho thuê xe du lịch Khánh Linh Trans (Hà Nội), hỗ trợ giao diện đa ngôn ngữ (VI/EN), hệ thống Blog/Tin tức CMS dạng Block Editor và trang quản trị Admin với kiến trúc Authentication & Authorization phân quyền nhiều cấp độ.
- **Công nghệ sử dụng**: Next.js 15 (App Router), React 19, TypeScript, Vanilla CSS (`globals.css`, `user.css`, `admin.css`, `blog.css`, `blog-admin.css`), `bcryptjs`, JSON database file Storage (`db.json` cho website data, `data/accounts.json` cho tài khoản quản trị, `data/sessions.json` cho phiên đăng nhập, `data/news-index.json`, `data/news/*.json`).
- **Cách chạy project**: 
  - Khởi chạy dev server: `npm run dev`
  - Khôi phục tài khoản admin mặc định: `npm run reset-admin`
  - Build sản phẩm: `npm run build`

# 2. Cấu trúc thư mục
- `app/`: Chứa giao diện người dùng, trang Admin, hệ thống Blog, Middleware và các REST API routes.
- `middleware.ts`: Middleware kiểm tra sự tồn tại của session cookie mỏng nhẹ cho các route `/admin*` và tự động redirect `/admin/blog/login` sang `/login`.
- `app/login/`: Giao diện người dùng Đăng nhập tập trung duy nhất (`/login`).
- `app/blog/`: Giao diện người dùng xem danh sách tin tức (`page.tsx`) và trang chi tiết bài viết (`[slug]/page.tsx`), kèm `blog.css`.
- `app/admin/`: Giao diện Dashboard quản trị nội dung (đội xe, bảng giá, sale, đánh giá, FAQ).
- `app/admin/accounts/`: Trang quản lý tài khoản quản trị (`page.tsx`) dành riêng cho `SUPER_ADMIN`.
- `app/admin/media/`: Trang quản lý thư viện hình ảnh tập trung (`page.tsx`).
- `app/admin/blog/`: Trình quản lý bài viết tin tức (`page.tsx`), trình chỉnh sửa dạng khối Block Editor (`BlockEditor.tsx`), kèm `blog-admin.css`.
- `app/components/`: Component hệ thống dùng chung (như Toast thông báo).
- `app/components/blog/`: Các component hiển thị từng khối nội dung bài viết (`ParagraphBlock.tsx`, `HeadingBlock.tsx`, `ImageBlock.tsx`, `GalleryBlock.tsx`, `QuoteBlock.tsx`, `DividerBlock.tsx`, `YoutubeBlock.tsx`, `BlockRenderer.tsx`, `types.ts`).
- `app/api/admin/_lib/adminAuth.ts`: Utility xác thực phiên đăng nhập, cấp/hủy UUID session, phân quyền theo Role/Permission, đọc/ghi `data/accounts.json` & `data/sessions.json`.
- `app/lib/blogDb.ts`: Utility đọc/ghi cơ sở dữ liệu tin tức JSON, xử lý slug, dọn dẹp ảnh mồ côi và tự động chuyển đổi bài viết legacy HTML sang Block Editor.
- `app/api/`: Các REST API endpoints phục vụ truy vấn công khai và quản trị.
- `app/api/admin/login/`: API xử lý đăng nhập, cấp cookie session UUID `admin_session`.
- `app/api/admin/logout/`: API xử lý đăng xuất, hủy session UUID trong `sessions.json`.
- `app/api/admin/me/`: API trả về thông tin tài khoản đang đăng nhập.
- `app/api/admin/accounts/`: API CRUD quản lý tài khoản (`SUPER_ADMIN`).
- `app/api/admin/media/`: API quản lý file thư viện hình ảnh media (`/public/uploads/`).
- `app/api/blog/`: REST API công khai lấy danh sách (`/api/blog`) và chi tiết (`/api/blog/[slug]`) bài viết tin tức.
- `app/api/admin/blog/`: REST API quản trị bài viết (`/api/admin/blog` & `/api/admin/blog/[slug]`).
- `data/`: Thư mục lưu trữ dữ liệu JSON phân tách rõ ràng:
  - `data/accounts.json`: Lưu danh sách tài khoản quản trị.
  - `data/sessions.json`: Lưu bản đồ phiên đăng nhập `{ [sessionId]: { accountId, expire } }`.
  - `data/news-index.json`: Chỉ mục tin tức.
  - `data/news/{slug}.json`: Chi tiết mảng khối bài viết tin tức.
- `public/`: Chứa tài nguyên tĩnh, hình ảnh thương hiệu và tệp ảnh được tải lên (`public/uploads/blog/`, `public/uploads/fleet/`, `public/uploads/sales/`, `public/images/news/`).
- `scripts/`: Script tiện ích dòng lệnh (`reset-admin.js` khôi phục tài khoản Admin `SUPER_ADMIN`).

# 3. Luồng hệ thống
- **Xem thông tin & Đội xe**: User → `app/page.tsx` → `db.json` / `app/api/vehicles` → Frontend Render
- **Xem danh sách & Bài viết Blog**: User → `app/blog/page.tsx` & `app/blog/[slug]/page.tsx` → `/api/blog` & `/api/blog/[slug]` → `blogDb.ts` & `adminAuth.ts` (giải mã `authorId`) → `BlockRenderer.tsx` → Frontend Render
- **Đăng nhập Hệ thống**: User/Admin → `/login` → `POST /api/admin/login` → `accounts.json` & `sessions.json` → Set Cookie `admin_session=<uuid>` → Redirect `/admin` hoặc `/admin/blog`
- **Xác thực Route Admin**: Client → `/admin*` → `middleware.ts` (kiểm tra cookie `admin_session`) → Page Component (gọi `GET /api/admin/me` & kiểm tra Role/Permission)
- **Quản lý Tài khoản (SUPER_ADMIN)**: Admin → `/admin/accounts` → `/api/admin/accounts` → `adminAuth.ts` → `data/accounts.json`
- **Quản lý Media Thư viện**: Admin → `/admin/media` → `/api/admin/media` → `/public/uploads/`
- **Quản lý Bài viết Blog**: Admin → `/admin/blog` & `BlockEditor.tsx` → `/api/admin/blog` & `/api/admin/blog/[slug]` → `adminAuth.ts` (gắn `authorId`) → `blogDb.ts` → `data/news-index.json` & `data/news/{slug}.json`
- **Đăng xuất Hệ thống**: Admin → Bấm "Đăng xuất" → `POST /api/admin/logout` → Xóa session trong `sessions.json` & clear cookie `admin_session` → `router.replace("/login")`

# 4. Chức năng chính

## Hệ thống Đăng nhập & Xác thực Phiên Tập Trung
- **Mục đích**: Quản lý phiên làm việc duy nhất thông qua Cookie HTTP-Only `admin_session` chứa mã UUID ngẫu nhiên trỏ tới `data/sessions.json`.
- **File liên quan**: `app/login/page.tsx`, `middleware.ts`, `app/api/admin/login/route.ts`, `app/api/admin/logout/route.ts`, `app/api/admin/me/route.ts`, `app/api/admin/_lib/adminAuth.ts`, `data/sessions.json`.

## Quản lý Tài khoản & Phân quyền Role-based Access Control (RBAC)
- **Mục đích**: Cho phép `SUPER_ADMIN` quản lý danh sách tài khoản, tạo mới, chỉnh sửa thông tin, đổi vai trò (Role), đổi mật khẩu và khóa/mở khóa tài khoản.
- **File liên quan**: `app/admin/accounts/page.tsx`, `app/api/admin/accounts/route.ts`, `data/accounts.json`.
- **Các Role hệ thống**:
  - `SUPER_ADMIN`: Có toàn quyền hệ thống (được vào trang Quản lý tài khoản `/admin/accounts`).
  - `ADMIN`: Quản lý nội dung website (Đội xe, Bảng giá, Chuyên viên, Đánh giá, FAQ) và bài viết Tin tức.Không vào được `/admin/accounts`.
  - `BLOG_EDITOR`: Chỉ quản lý bài viết Tin tức (`/admin/blog`) và Thư viện Media (`/admin/media`). Nếu cố vào các trang khác sẽ bị tự động chuyển về `/admin/blog`.

## Thư viện Quản lý Hình ảnh Media Manager
- **Mục đích**: Tập trung quản lý hình ảnh hệ thống tại `/public/uploads/`, hỗ trợ tải ảnh lên, sao chép URL nhanh và chọn ảnh trực tiếp từ Block Editor trong bài viết Blog mà không bị upload lặp nhiều lần.
- **File liên quan**: `app/admin/media/page.tsx`, `app/api/admin/media/route.ts`, `public/uploads/`.

## Quản lý Blog & Tin tức (Block CMS & Block Editor)
- **Mục đích**: Quản lý bài viết tin tức dạng khối Block (Paragraph, Heading, Image, Gallery, Quote, Divider, Youtube), tự động lưu `authorId` tham chiếu tới tài khoản tạo bài viết.
- **File liên quan**: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/admin/blog/page.tsx`, `app/admin/blog/BlockEditor.tsx`, `app/components/blog/*`, `app/lib/blogDb.ts`, `app/api/blog/route.ts`, `app/api/blog/[slug]/route.ts`.

# 5. Database
- **Kiểu dữ liệu**: Dữ liệu lưu vết trực tiếp dạng JSON File Storage phân tách độc lập trong thư mục `data/`:
  - `db.json`: Lưu dữ liệu hiển thị website (`vehicles`, `pricing`, `sales`, `testimonials`, `faq`).
  - `data/accounts.json`: Mảng chứa các đối tượng `Account`:
    - `id`: Mã tài khoản (`acc_001`...).
    - `username`: Tên đăng nhập duy nhất.
    - `passwordHash`: Mật khẩu mã hóa bcrypt.
    - `displayName`: Tên hiển thị tác giả.
    - `avatar`: Đường dẫn ảnh đại diện.
    - `role`: Vai trò (`SUPER_ADMIN` | `ADMIN` | `BLOG_EDITOR`).
    - `permissions`: Mảng chuỗi quyền mở rộng.
    - `active`: Trạng thái hoạt động (boolean).
    - `createdAt` / `updatedAt` / `lastLogin`: Thời gian ISO string.
  - `data/sessions.json`: Bản đồ lưu trữ phiên làm việc `{ [sessionId]: { accountId, expire } }`.
  - `data/news-index.json`: Mảng chứa metadata bài viết tin tức (có chứa `authorId`).
  - `data/news/{slug}.json`: Chi tiết mảng khối bài viết tin tức (có chứa `authorId`).

# 6. API

| Endpoint | Method | Mục đích | Quyền tối thiểu |
| --- | --- | --- | --- |
| `/api/admin/login` | POST | Đăng nhập tài khoản, ghi nhận lastLogin và cấp cookie session UUID | Tất cả |
| `/api/admin/logout` | POST | Đăng xuất hệ thống, xóa session UUID trong `sessions.json` | Đã đăng nhập |
| `/api/admin/me` | GET | Lấy thông tin tài khoản hiện tại từ cookie `admin_session` | Đã đăng nhập |
| `/api/admin/accounts` | GET / POST / PUT / DELETE | CRUD Quản lý tài khoản người dùng | `SUPER_ADMIN` |
| `/api/admin/media` | GET / POST / DELETE | Quản lý tải lên, danh sách và xóa file hình ảnh media | `BLOG_EDITOR`, `ADMIN`, `SUPER_ADMIN` |
| `/api/vehicles` | GET | Lấy danh sách xe công khai theo ngôn ngữ (`?lang=vi\|en`) | Công khai |
| `/api/blog` | GET | Lấy danh sách bài viết đã xuất bản (`status=published`) | Công khai |
| `/api/blog/[slug]` | GET | Lấy chi tiết bài viết công khai theo slug (tự giải mã `authorId` thành tên tác giả) | Công khai |
| `/api/admin/vehicles` | GET / POST / PUT / DELETE | Thao tác dữ liệu đội xe | `ADMIN`, `SUPER_ADMIN` |
| `/api/admin/data` | GET / POST / PUT / DELETE | Cập nhật dữ liệu các section Bảng giá, Đánh giá, FAQ, Sales | `ADMIN`, `SUPER_ADMIN` |
| `/api/admin/blog` | GET / POST | Lấy danh sách bài viết Admin và Tạo mới bài viết (lưu `authorId`) | `BLOG_EDITOR`, `ADMIN`, `SUPER_ADMIN` |
| `/api/admin/blog/[slug]` | GET / PUT / DELETE | Lấy chi tiết, Cập nhật và Xóa bài viết Blog | `BLOG_EDITOR`, `ADMIN`, `SUPER_ADMIN` |

# 7. Quyền người dùng & Roles
- **Khách hàng (Guest User)**: Xem toàn bộ thông tin trang chủ, tìm kiếm tin tức và đọc chi tiết các bài viết blog `published`.
- **Quản trị viên Cấp cao (SUPER_ADMIN)**: Toàn quyền hệ thống. Được vào Quản lý tài khoản (`/admin/accounts`), Thư viện Media (`/admin/media`), Dashboard (`/admin`) và Blog (`/admin/blog`).
- **Quản trị viên Nội dung (ADMIN)**: Được quản lý toàn bộ nội dung website (Xe, Bảng giá, Đánh giá, FAQ, Chuyên viên), Blog và Media. Không được truy cập Quản lý tài khoản.
- **Biên tập viên Tin tức (BLOG_EDITOR)**: Chỉ được truy cập quản lý bài viết Blog (`/admin/blog`) và Thư viện Media (`/admin/media`). Nếu cố vào các đường dẫn `/admin` khác sẽ bị tự động chuyển về `/admin/blog`.

# 8. Luồng quan trọng nhất

## Flow 1: Đăng nhập tập trung và khởi tạo Session UUID
1. User truy cập `/login` -> Điền Username & Password.
2. Gửi request `POST /api/admin/login`.
3. Server đối soát `data/accounts.json`, kiểm tra `active === true` và so sánh password băm bcrypt.
4. Nếu hợp lệ, server cập nhật `lastLogin`, tạo mã Session UUID ngẫu nhiên lưu vào `data/sessions.json` kèm thời gian hết hạn 7 ngày.
5. Server thiết lập Cookie HTTP-Only `admin_session=<uuid>`.
6. Client dựa vào `role` để chuyển hướng: `BLOG_EDITOR` chuyển sang `/admin/blog`, các role khác chuyển sang `/admin`.

## Flow 2: Truy cập trang quản trị & Middleware Check
1. Admin truy cập bất kỳ route `/admin*`.
2. `middleware.ts` kiểm tra nếu không có Cookie `admin_session` -> Redirect ngay về `/login`. Nếu truy cập `/admin/blog/login` -> Redirect ngay về `/login`.
3. Component phía Admin gọi `GET /api/admin/me` để lấy thông tin `Account` thực tế từ `sessions.json`.
4. Nếu role là `BLOG_EDITOR` nhưng truy cập `/admin` -> Tự động redirect về `/admin/blog`.
5. Sidebar render danh sách menu phù hợp dựa trên cấu hình điều kiện `MENU_ITEMS` permission.

## Flow 3: Quản lý bài viết Blog kèm Author ID & Media
1. Editor truy cập `/admin/blog` -> Bấm "Viết Bài Mới" hoặc "Chỉnh sửa".
2. Trong Block Editor, Editor có thể dán URL ảnh, tải ảnh mới hoặc bấm "🖼️ Chọn từ Media" để mở modal chọn trực tiếp ảnh từ `/public/uploads/`.
3. Khi bấm "Lưu bài viết", API `POST/PUT /api/admin/blog` tự động đính kèm `authorId` của tài khoản đang đăng nhập.
4. Phía công khai `/blog/[slug]`, API đọc `authorId`, đối soát `data/accounts.json` để lấy `displayName` và `avatar` tác giả mới nhất.

## Flow 4: Đăng xuất Hệ thống
1. Admin nhấp nút "Đăng xuất" trên Sidebar ở bất kỳ trang quản trị nào.
2. Client gửi request `POST /api/admin/logout`.
3. Server xóa mã Session UUID tương ứng trong `data/sessions.json` và xóa cookie `admin_session`.
4. Client thực hiện `router.replace("/login")` và `router.refresh()`. Trình duyệt bị chặn không thể bấm nút Back quay lại trang Admin.

# 9. File cần đọc trước
1. [package.json](file:///f:/web_khanh_linh_trans/web_khanh_linh/package.json): Nắm danh sách các thư viện và lệnh thực thi.
2. [adminAuth.ts](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/api/admin/_lib/adminAuth.ts): Đọc cơ chế xác thực Session UUID, phân quyền Role/Permission và thao tác dữ liệu `accounts.json` & `sessions.json`.
3. [middleware.ts](file:///f:/web_khanh_linh_trans/web_khanh_linh/middleware.ts): Đọc quy tắc bảo vệ đường dẫn `/admin*` bằng middleware.
4. [login/page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/login/page.tsx): Trang Đăng nhập tập trung duy nhất của toàn hệ thống.
5. [admin/page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/page.tsx): Trang Dashboard chính quản trị nội dung website.
6. [admin/accounts/page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/accounts/page.tsx): Trang Quản lý tài khoản dành cho `SUPER_ADMIN`.
7. [admin/media/page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/media/page.tsx): Trang Quản lý thư viện hình ảnh Media.
8. [admin/blog/page.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/blog/page.tsx): Module quản lý bài viết Blog tin tức.
9. [BlockEditor.tsx](file:///f:/web_khanh_linh_trans/web_khanh_linh/app/admin/blog/BlockEditor.tsx): Trình biên tập nội dung bài viết theo khối Card Block tích hợp Media Picker.
