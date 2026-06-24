import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

export async function GET() {
  try {
    const wb = xlsx.utils.book_new();

    const templateData = [
      {
        "Course Title": "Lộ trình Business Analyst chuyên nghiệp",
        "Course Description": "Khóa học toàn diện từ cơ bản đến chuyên sâu giúp bạn tự tin trở thành một Business Analyst thực thụ.",
        "Course Level": "Beginner to Intermediate",
        "Course Category": "Business Analysis",
        "Module Title": "Giai đoạn 1: Khơi gợi & Phân tích Yêu cầu BA",
        "Module Description": "Giai đoạn giúp nắm bắt phương pháp làm việc cùng stakeholders để khơi gợi và phân tích yêu cầu nghiệp vụ chuẩn xác.",
        "Lesson Title": "Bài 1: Phỏng vấn Stakeholders hiệu quả",
        "Lesson Short Description": "Biết cách lập kịch bản phỏng vấn, đặt câu hỏi đúng trọng tâm và thu thập dữ liệu giá trị.",
        "Estimated Time": "45",
        "Exercise Title": "Bài tập nhỏ: Kịch bản phỏng vấn dự án Quản lý Kho",
        "Exercise Description": "Lập danh sách kịch bản gồm 8 câu hỏi phỏng vấn Stakeholder cho phân hệ quản lý tồn kho.",
        "Exercise Instruction": "Sử dụng tối thiểu 5 câu hỏi mở dạng 5W1H và 3 câu hỏi đào sâu thông tin nghiệp vụ chính."
      },
      {
        "Course Title": "Lộ trình Business Analyst chuyên nghiệp",
        "Course Description": "Khóa học toàn diện từ cơ bản đến chuyên sâu giúp bạn tự tin trở thành một Business Analyst thực thụ.",
        "Course Level": "Beginner to Intermediate",
        "Course Category": "Business Analysis",
        "Module Title": "Giai đoạn 1: Khơi gợi & Phân tích Yêu cầu BA",
        "Module Description": "Giai đoạn giúp nắm bắt phương pháp làm việc cùng stakeholders để khơi gợi và phân tích yêu cầu nghiệp vụ chuẩn xác.",
        "Lesson Title": "Bài 2: Viết User Story & Tiêu chí nghiệm thu (AC)",
        "Lesson Short Description": "Biết viết User Story đúng khuôn mẫu INVEST và thiết lập các Acceptance Criteria chi tiết.",
        "Estimated Time": "60",
        "Exercise Title": "Bài tập nhỏ: Viết câu chuyện người dùng cho chức năng Quên mật khẩu",
        "Exercise Description": "Hãy lập 3 User Stories kèm tiêu chí Acceptance Criteria chi tiết cho tính năng khôi phục tài khoản.",
        "Exercise Instruction": "Mỗi User Story phải tuân thủ quy tắc INVEST và có ít nhất 2 kịch bản Acceptance Criteria dạng Given-When-Then."
      },
      {
        "Course Title": "Lộ trình Business Analyst chuyên nghiệp",
        "Course Description": "Khóa học toàn diện từ cơ bản đến chuyên sâu giúp bạn tự tin trở thành một Business Analyst thực thụ.",
        "Course Level": "Beginner to Intermediate",
        "Course Category": "Business Analysis",
        "Module Title": "Giai đoạn 2: Thiết kế Giải pháp & Sơ đồ hóa Luồng Nghiệp vụ (UML)",
        "Module Description": "Nắm vững kỹ năng biểu diễn quy trình thông qua các loại sơ đồ tiêu chuẩn UML Diagrams chuyên nghiệp.",
        "Lesson Title": "Bài 1: Vẽ sơ đồ hoạt động (Activity Diagram)",
        "Lesson Short Description": "Hướng dẫn sử dụng công cụ draw.io vẽ các hoạt động xử lý song song, rẽ nhánh luồng nghiệp vụ.",
        "Estimated Time": "90",
        "Exercise Title": "Bài tập lớn: Vẽ sơ đồ quy trình thanh toán Ví điện tử",
        "Exercise Description": "Vẽ bộ sơ đồ quy trình thanh toán tích hợp ví điện tử thông minh, mô tả luồng chính và luồng lỗi.",
        "Exercise Instruction": "Nộp file hình ảnh xuất từ draw.io hoặc đường dẫn chia sẻ liên kết trực tiếp để giảng viên chấm điểm."
      }
    ];

    const sheet = xlsx.utils.json_to_sheet(templateData);

    // Set custom column widths
    const wscols = [
      { wch: 35 }, // Course Title
      { wch: 45 }, // Course Description
      { wch: 20 }, // Course Level
      { wch: 20 }, // Course Category
      { wch: 35 }, // Module Title
      { wch: 45 }, // Module Description
      { wch: 35 }, // Lesson Title
      { wch: 45 }, // Lesson Short Description
      { wch: 15 }, // Estimated Time
      { wch: 35 }, // Exercise Title
      { wch: 45 }, // Exercise Description
      { wch: 45 }  // Exercise Instruction
    ];
    sheet["!cols"] = wscols;

    xlsx.utils.book_append_sheet(wb, sheet, "Courses_Import");

    const excelBuffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    return new Response(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=ba-learning-courses-template.xlsx",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (err: any) {
    console.error("Fatal error generating course import template", err);
    return NextResponse.json(
      { error: "Lỗi kết xuất Excel mẫu: " + err.message },
      { status: 500 }
    );
  }
}
