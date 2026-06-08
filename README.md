# BA Learning OS 📄🚀

Hệ thống quản lý lộ trình học tập, tài liệu học và ghi chú thực hành cá nhân dành cho Business Analyst (BA) theo lộ trình 6 giai đoạn chuyên nghiệp. 

Ứng dụng được thiết kế tối ưu hóa cho việc tự ôn luyện, sao chép nội dung từ các AI Chatbot (như ChatGPT, Gemini) vào hệ thống dồi dào, tự làm bài tập thực hành theo dự án thực tế, và đánh dấu mốc checklist tự đánh giá.

---

## 🛠️ Trải nghiệm MVP nhanh trên Google AI Studio
Trong môi trường sandbox của Google AI Studio, ứng dụng chạy dưới dạng fullstack **React + Express** sử dụng tệp dữ liệu cục bộ `db.json` cực kỳ nhanh chóng và ổn định mà không yêu cầu cấu hình thêm bất kỳ cơ sở dữ liệu PostgreSQL bên ngoài nào.

### Các Tính năng Đạt được:
1. **Bảng tổng quan (Dashboard):** Xem tổng thể tiến độ học theo tỉ lệ %, số lượng bài hoàn thành, các bài học vừa cập nhật và tiến trình cụ thể từng Giai đoạn.
2. **Lộ trình 6 Giai đoạn học BA:** Sắp xếp theo thứ tự chuẩn, hiển thị mục tiêu phát triển và sản lượng bài của mỗi giai đoạn.
3. **Chi tiết Giai đoạn học:** Xem toàn bộ bài học thuộc giai đoạn, trạng thái Chưa học / Đang học / Hoàn thành.
4. **Không gian học tập & Vở làm bài:** 
   - Đọc lý thuyết ngắn cốt lõi, ví dụ doanh nghiệp thực tế.
   - Viết bài giải bài tập, thiết lập tên Dự án áp dụng thực tiễn, viết Ghi chú thu hoạch bài học (Reflection).
   - Tương tác với **Checklist tự đánh giá (Self-review):** Cho phép tick check hoàn thành từng dòng và bổ sung tiêu chí đánh giá tức thời.
5. **Đồng bộ và Quản lý Học liệu:** Thêm bài học mới hoặc Sửa đổi mọi trường dữ liệu (objective, theory, example) bằng biểu mẫu đa dòng. Hỗ trợ nhập danh sách checklist tự đánh giá bằng cách nhập/dán danh sách văn bản ngăn cách bằng dòng mới (`\n`).
6. **Bảng Quản lý Admin:** Tìm kiếm bài học và Lọc theo từng giai đoạn vô cùng linh hoạt.

---

## 💻 Hướng dẫn Chạy Local dự án này

Dự án sử dụng cơ chế Express + Vite full-stack giúp việc khởi tạo và phát triển local trở nên cực kỳ tinh gọn.

### Bước 1: Cài đặt Dependencies
Trỏ terminal vào thư mục gốc của project và chạy lệnh cài đặt các thư viện:
```bash
npm install
```

### Bước 2: Tạo Cơ sở dữ liệu và cấu hình Prisma (Sẵn sàng cho Production)
Mặc dù MVP chạy trên sqlite/file để mượt mà nhất trong sandbox, mã nguồn đã được đóng gói hoàn toàn sẵn sàng cho Prisma Client và Database PostgreSQL (Neon, Supabase, Vercel Postgres).

1. Tạo một cơ sở dữ liệu PostgreSQL mới từ một dịch vụ lưu trữ bất kỳ.
2. Sao chép tệp cấu hình môi trường `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```
3. Cập nhật chuỗi kết nối PostgreSQL của bạn vào biến môi trường `DATABASE_URL` trong file `.env`:
   ```env
   DATABASE_URL="postgresql://username:password@your-postgres-host:5432/ba_learning_os?schema=public"
   ```

### Bước 3: Chạy Prisma Migrate & Seed Data
Để ánh xạ các Model trong file `prisma/schema.prisma` lên Database thực tế và nạp dữ liệu mẫu ban đầu:

1. Chạy lệnh Migration để đồng bộ cấu trúc bảng:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Chạy lệnh nạp dữ liệu mẫu (Seed) đã được chúng tôi viết sẵn chi tiết (bao gồm 6 Giai đoạn chính và 8 Bài học điển hình chuẩn BABOK):
   ```bash
   npx prisma db seed
   ```

> [!WARNING]
> **CẢNH BÁO BẢO TRÌ DỮ LIỆU THỰC TẾ:**
> - Tuyệt đối không viết thêm các mã lệnh `deleteMany()` hoặc xóa bảng vào file `prisma/seed.ts` khi hệ thống đã đi vào vận hành chính thức hoặc có dữ liệu học tập thực tế của người dùng.
> - Phiên bản seed hiện tại là **safe seed (seed an toàn)**. Lệnh seed này có thể chạy lập lại nhiều lần hoàn toàn độc lập mà **không xóa dữ liệu đã học**, không reset check các danh mục học viên đã phản hồi, và giữ nguyên vẹn ghi chú thực hành `Practice` / `personalNote`.

### Bước 4: Khởi phát Project ở chế độ Local Dev
Khởi chạy server Express làm backend API (cổng 3000) kiêm Vite làm hot-reload frontend:
```bash
npm run dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`

---

## 🚀 Hướng dẫn Deploy lên Vercel & Cấu hình Database Connection Pooling

Ứng dụng này được xây dựng trên nền tảng **Next.js 15 App Router** hiện đại và **Prisma ORM**. Khi deploy lên môi trường Serverless như Vercel, các kết nối Database có thể bị scale đột ngột gây ra lỗi quá tải kết nối (`EMAXCONNSESSION: max clients reached`). Hãy tuân thủ hướng dẫn sau để cấu hình tối ưu.

### 1. Chuẩn bị Connection Pooling cho PostgreSQL

#### Nếu dùng Neon:
1. Sử dụng chuỗi kết nối **Pooled Connection** (Thường có hậu tố `-pooler.postgres.neon.tech` hoặc cấu hình Neon pooling).
2. Định nghĩa tham số cấu hình pooling trong chuỗi kết nối của bạn:
   ```env
   DATABASE_URL="postgresql://username:password@your-neon-pooler-domain.tech/neondb?sslmode=require&connection_limit=1"
   ```
   *Lưu ý:* Việc thêm `connection_limit=1` là tối quan trọng đối với các Serverless functions trên Vercel để giới hạn mỗi instance logic chỉ sử dụng duy nhất 1 kết nối.

#### Nếu dùng Supabase:
1. Không dùng cổng kết nối trực tiếp (5432). Thay vào đó, lấy chuỗi kết nối **Connection Pooler (Transaction Mode)**, thường dùng cổng `6543` và chế độ Transactions.
2. Thêm các tham số pgbouncer phù hợp vào chuỗi kết nối:
   ```env
   DATABASE_URL="postgresql://postgres.your-ref-id:your-password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```

### 2. Thiết lập Environment Variables trên Vercel

Truy cập trang quản trị dự án trên Vercel: **Settings -> Environment Variables** và khai báo các khóa sau:

| Tên biến | Giá trị khuyên dùng | Diễn giải |
| :--- | :--- | :--- |
| `DATABASE_URL` | *Chuỗi kết nối Pooled của bạn* | Xem hướng dẫn cấu hình ở Mục 1 phía trên |
| `NODE_ENV` | `production` | Chạy ứng dụng trong chế độ Production tối ưu |

*Quan trọng:* Sau khi thay đổi hoặc bổ sung biến môi trường (Environment Variables) trong Vercel settings, bạn cần kích hoạt **Redeploy** lại phiên bản để Vercel nạp các giá trị cấu hình mới nhất vào RAM của Serverless.

### 📐 Kiến trúc Mô hình Cơ sở Dữ liệu (Prisma Models)

Hệ thống lưu trữ dữ liệu an toàn dựa trên schema sau:

```prisma
// Stage / Giai đoạn học tập
model Stage {
  id             String          @id @default(uuid())
  code           String          @unique
  title          String
  description    String
  goal           String
  order          Int             @unique
  bigExercise    String          @default("")
  expectedOutput String          @default("")
  finalChecklist String          @default("")
  status         PublishStatus   @default(PUBLISHED)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  lessons        Lesson[]
  stagePractices StagePractice[]
}

// Lesson / Bài học cố định trong Lộ trình
model Lesson {
  id                     String                @id @default(uuid())
  code                   String                @unique
  stageId                String
  stage                  Stage                 @relation(fields: [stageId], references: [id], onDelete: Cascade)
  title                  String
  order                  Int
  objective              String
  theory                 String
  example                String
  smallExercise          String                @default("")
  realProjectApplication String
  expectedOutput         String
  status                 PublishStatus         @default(PUBLISHED)
  createdAt              DateTime              @default(now())
  updatedAt              DateTime              @updatedAt
  checklistItems         LessonChecklistItem[]
  lessonPractices        LessonPractice[]
}
```

Hãy bắt đầu rèn luyện hôm nay bằng cách mở các tab bài học và ôn tập các kiến thức phân tích nghiệp vụ thiết kế sẵn! 🚀📈

