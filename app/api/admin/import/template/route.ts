import { NextResponse } from "next/server";
import * as xlsx from "xlsx";

export async function GET() {
  try {
    // 1. Create a new workbook
    const wb = xlsx.utils.book_new();

    // 2. Define sample stages data
    const stagesData = [
      {
        stage_code: "GD01",
        title: "Khơi gợi & Phân tích Yêu cầu BA",
        description: "Giai đoạn giúp nắm bắt phương pháp làm việc cùng stakeholders để khơi gợi và phân tích yêu cầu nghiệp vụ chuẩn xác.",
        goal: "Làm chủ các kỹ thuật khơi gợi tài liệu, viết User Story & thiết kế mô hình nghiệp vụ ban đầu.",
        order: 1,
        big_exercise: "Xây dựng tài liệu đặc tả yêu cầu nghiệp vụ (BRD) cho phân hệ Đặt xe của ứng dụng Đặt xe công nghệ.",
        expected_output: "Tài liệu BRD hoàn chỉnh, chứa tối thiểu 10 User Stories, làm rõ các stakeholder liên quan.",
        final_checklist: "Tài liệu không bị mâu thuẫn yêu cầu; Toàn bộ Stakeholder chính ký duyệt thông qua; Quy trình nghiệp vụ khép kín.",
        status: "PUBLISHED"
      },
      {
        stage_code: "GD02",
        title: "Thiết kế Giải pháp & Sơ đồ hóa Luồng Nghiệp vụ (UML)",
        description: "Nắm vững kỹ năng biểu diễn quy trình thông qua các loại sơ đồ tiêu chuẩn UML Diagrams chuyên nghiệp.",
        goal: "Biết sử dụng công cụ vẽ sơ đồ Activity Diagram, Use Case Diagram và Sequence Diagram cho hệ thống.",
        order: 2,
        big_exercise: "Vẽ bộ sơ đồ quy trình thanh toán tích hợp ví điện tử thông minh.",
        expected_output: "Tập tin lưu sơ đồ Activity, Use Case và mô tả chi tiết đặc tả các kịch bản phụ/lỗi.",
        final_checklist: "Sơ đồ tuân thủ quy tắc vẽ UML; Mô phỏng đầy đủ luồng thành công (Happy Path) và luồng lỗi (Alternative/Exception path).",
        status: "PUBLISHED"
      }
    ];

    // 3. Define sample lessons data
    const lessonsData = [
      {
        lesson_code: "GD01_L1",
        stage_code: "GD01",
        title: "Phỏng vấn Stakeholders hiệu quả",
        order: 1,
        objective: "Biết cách lập kịch bản phỏng vấn, đặt câu hỏi đúng trọng tâm và thu thập dữ liệu giá trị.",
        theory: "### 1. Chuẩn bị phỏng vấn\nNghiên cứu trước về phòng ban, lĩnh vực và vai trò của người tham gia...\n\n### 2. Thiết lập bộ câu hỏi phỏng vấn\nTránh hỏi câu hỏi đóng (Có/Không), thay vào đó dùng câu hỏi mở áp dụng nguyên lý 5W1H (Who, What, Where, When, Why, How)...\n\n### 3. Ghi lại thông tin họp\nBao gồm biên bản làm việc (Meeting minutes) để chuyển gửi các bên xác nhận lại thông tin.",
        example: "Kịch bản phỏng vấn Trưởng phòng kế toán về khó khăn trong quy trình xuất hóa đơn hoàn trả.",
        small_exercise: "Lập danh sách kịch bản gồm 8 câu hỏi phỏng vấn Stakeholder cho dự án mới 'Quản lý kho hàng'.",
        real_project_application: "Sử dụng trực tiếp trong giai đoạn khởi động dự án hoặc khi phát sinh một phân hệ chức năng mới cần tìm hiểu.",
        expected_output: "Bản kịch bản câu hỏi phỏng vấn soạn thảo hoàn thiện.",
        status: "PUBLISHED"
      },
      {
        lesson_code: "GD01_L2",
        stage_code: "GD01",
        title: "Viết User Story & Tiêu chí nghiệm thu (Acceptance Criteria)",
        order: 2,
        objective: "Biết viết User Story đúng khuôn mẫu INVEST và thiết lập các Acceptance Criteria chi tiết.",
        theory: "### 1. Cấu trúc chuẩn của User Story\n`As a <Role>, I want <Feature>, so that <Value>`.\n\n### 2. Tiêu chí Acceptance Criteria (AC)\nCó thể viết dưới dạng tự do hoặc viết dạng Cucumber Scenarios: `Given - When - Then`...\n\n### 3. Tiêu chí INVEST\n- **I**ndependent (Độc lập)\n- **N**egotiable (Có thể thương lượng)\n- **V**aluable (Có giá trị)\n- **E**stimable (Có thể ước lượng)\n- **S**mall (Độ lớn vừa đủ)\n- **T**estable (Có thể kiểm thử được)",
        example: "User story Đăng nhập hệ thống:\n`As a Customer, I want to login with email, so that I can access my order history.`\n\nAcceptance Criteria 1:\n`Given the customer has a valid account, When they fill in correct credentials, Then they are redirected to home and session is logged in.`",
        small_exercise: "Hãy lập 3 User Stories kèm tiêu chí Acceptance Criteria chi tiết cho tính năng 'Quên mật khẩu'.",
        real_project_application: "Dùng để bàn giao trực tiếp từ khâu phân tích qua khâu lập trình của Dev và QA/QC thực hiện viết testcases.",
        expected_output: "Tài liệu danh sách 3 User Stories hoàn chỉnh kèm AC rõ ràng.",
        status: "PUBLISHED"
      }
    ];

    // 4. Define sample checklists data
    const checklistsData = [
      {
        lesson_code: "GD01_L1",
        checklist_order: 1,
        checklist_content: "Lập kịch bản phỏng vấn tối thiểu có 5 câu hỏi mở dạng 5W1H."
      },
      {
        lesson_code: "GD01_L1",
        checklist_order: 2,
        checklist_content: "Có biên bản xác nhận thông tin gửi lại stakeholder duyệt qua email."
      },
      {
        lesson_code: "GD01_L2",
        checklist_order: 1,
        checklist_content: "Mỗi User story đều thỏa mãn hoàn toàn tối thiểu 5 tiêu chí của quy tắc INVEST."
      },
      {
        lesson_code: "GD01_L2",
        checklist_order: 2,
        checklist_content: "Có ít nhất 2 kịch bản Acceptance Criteria sử dụng cấu trúc Given-When-Then cho mỗi story."
      }
    ];

    // Create sheet data structures
    const stagesSheet = xlsx.utils.json_to_sheet(stagesData);
    const lessonsSheet = xlsx.utils.json_to_sheet(lessonsData);
    const checklistsSheet = xlsx.utils.json_to_sheet(checklistsData);

    // Set custom column widths for readability in Excel
    const wscols_stages = [
      { wch: 15 }, // stage_code
      { wch: 40 }, // title
      { wch: 50 }, // description
      { wch: 40 }, // goal
      { wch: 10 }, // order
      { wch: 40 }, // big_exercise
      { wch: 40 }, // expected_output
      { wch: 40 }, // final_checklist
      { wch: 12 }  // status
    ];
    stagesSheet["!cols"] = wscols_stages;

    const wscols_lessons = [
      { wch: 15 }, // lesson_code
      { wch: 15 }, // stage_code
      { wch: 40 }, // title
      { wch: 10 }, // order
      { wch: 40 }, // objective
      { wch: 60 }, // theory
      { wch: 40 }, // example
      { wch: 40 }, // small_exercise
      { wch: 40 }, // real_project_application
      { wch: 40 }, // expected_output
      { wch: 12 }  // status
    ];
    lessonsSheet["!cols"] = wscols_lessons;

    const wscols_checklists = [
      { wch: 15 }, // lesson_code
      { wch: 15 }, // checklist_order
      { wch: 60 }  // checklist_content
    ];
    checklistsSheet["!cols"] = wscols_checklists;

    // Append worksheets into the workbook wrapper
    xlsx.utils.book_append_sheet(wb, stagesSheet, "Stages");
    xlsx.utils.book_append_sheet(wb, lessonsSheet, "Lessons");
    xlsx.utils.book_append_sheet(wb, checklistsSheet, "Lesson_Checklists");

    // Write workbook to buffer
    const excelBuffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return the response spreadsheet download
    return new Response(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=ba-learning-os-template.xlsx",
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (err: any) {
    console.error("Fatal error generating import Excel template", err);
    return NextResponse.json(
      { error: "Lỗi kết xuất Excel mẫu: " + err.message },
      { status: 500 }
    );
  }
}
