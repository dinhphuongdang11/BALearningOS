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

## 🚀 Hướng dẫn Deploy lên Vercel

Ứng dụng được thiết lập chu đáo để dễ dàng triển khai lên dịch vụ đám mây Vercel.

### Cách 1: Deploy Dự án Full-stack Node + React lên Vercel
Do Vercel hỗ trợ tuyệt vời cho cấu trúc Serverless Functions, bạn có thể ánh xạ các Router API trong file `server.ts` sang các API Routes của Vercel (đặt trong thư mục `/api/*` của Vercel) hoặc cấu hình `vercel.json` để trỏ toàn bộ request `/api` sang tệp server chạy Node.js.

#### File cấu hình `vercel.json` tham khảo:
Hãy tạo tệp tin `vercel.json` ở thư mục gốc nếu muốn deploy Node server sang Vercel Serverless:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Cách 2: Setup Next.js App Router (Nếu bạn muốn tự bọc code vào Next.js)
Nếu sau này bạn lựa chọn chuyển sang framework Next.js như yêu cầu ban đầu:
1. Bạn có thể tận dụng chính xác toàn bộ cấu trúc các trang JSX/TSX chúng tôi viết sẵn trong thư mục `/src/components/*` để chuyển thể thành cấu trúc các Page của Next.js (bằng cách di chuyển chúng vào `/app/` hoặc từng Route tương ứng).
2. Tận dụng nguyên vẹn tệp `/prisma/schema.prisma` và mã nạp dữ liệu mẫu `/prisma/seed.ts`.
3. Thay thế các lệnh gọi API `fetch(/api/...)` thành các Server Actions của Next.js hoặc viết API Routes tương đương trong `/app/api/.../route.ts` bằng các truy vấn trực tiếp Prisma Client:
   ```typescript
   // Ví dụ trong Next.js Route Handler
   import { NextResponse } from 'next/server';
   import { prisma } from '@/lib/prisma';

   export async function GET() {
     const stats = await prisma.lesson.findMany();
     return NextResponse.json(stats);
   }
   ```

### 🔐 Thiết lập Environment Variables trên Vercel:
Trong trang quản trị bảng điều khiển dự án của Vercel, hãy truy cập **Settings -> Environment Variables** và định nghĩa các khóa bảo mật sau:

* `DATABASE_URL`: Hãy dán chuỗi kết nối PostgreSQL thật của bạn (ví dụ từ Supabase hoặc Neon Postgres).
* `NODE_ENV`: Đặt giá trị `"production"`.
* `GEMINI_API_KEY` (Tùy chọn phụ sau này): Điền mã khóa bí mật Gemini của bạn nếu muốn mở rộng tính năng AI phân tích.

---

## 📐 Kiến trúc Danh mục Cơ sở Dữ liệu Prisma (Prisma Models)

```prisma
// Stage / Giai đoạn học tập
model Stage {
  id          String   @id @default(uuid())
  title       String
  description String
  goal        String
  order       Int
  lessons     Lesson[]
}

// Lesson / Bài học cố định trong Lộ trình
model Lesson {
  id                     String         @id @default(uuid())
  stageId                String
  stage                  Stage          @relation(fields: [stageId], references: [id], onDelete: Cascade)
  title                  String
  order                  Int
  objective              String
  theory                 String
  example                String
  exercise               String
  realProjectApplication String
  expectedOutput         String
  status                 LessonStatus   @default(NOT_STARTED)
  personalNote           String         @default("")
  checklistItems         ChecklistItem[]
  practices              Practice[]
}

// Checklist Item / Tiêu chí tự review của từng bài
model ChecklistItem {
  id        String   @id @default(uuid())
  lessonId  String
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  content   String
  isChecked Boolean  @default(false)
  order     Int
}

// Practice / Không gian bài làm thực phẩm của từng môn
model Practice {
  id          String   @id @default(uuid())
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  projectName String   @default("")
  content     String   @default("")
  reflection  String   @default("")
}
```

Hãy bắt đầu ngày học tập hôm nay bằng cách mở các tab bài học và ôn tập các kiến thức phân tích nghiệp vụ tuyệt vời nhất! 🚀📈
