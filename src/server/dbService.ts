/**
 * BA Learning OS
 * Hybrid Storage Layer (PostgreSQL Prisma ORM <=> Local db.json Fallback)
 * Highly optimized for Vercel host deployment compatibility.
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { DatabaseSchema, Stage, Lesson, ChecklistItem, Practice, LessonStatus } from "../types.js";

const DB_FILE_PATH = path.join(process.cwd(), "db.json");

// Helper to generate UUIDs
function generateUUID(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Lazy-initialized Prisma instance for database connection
let prismaInstance: PrismaClient | null = null;
function getPrisma(): PrismaClient | null {
  if (!prismaInstance && process.env.DATABASE_URL) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

// Default Seed Data
const DEFAULT_STAGES: Stage[] = [
  {
    id: "stage-1",
    title: "1. Xây bản đồ nghề BA",
    description: "Tìm hiểu tổng quan về nghề Business Analyst, các kỹ năng cần thiết và xây dựng định hướng sự nghiệp.",
    goal: "Hiểu rõ các vai trò của BA trong dự án, cấu trúc của chuẩn nghề nghiệp BABOK và lộ trình phát triển của bản thân.",
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stage-2",
    title: "2. Xây lõi tư duy phân tích",
    description: "Luyện tập tư duy phân tách vấn đề, phân tích nguyên nhân gốc rễ và liên kết Problem - Need - Solution.",
    goal: "Làm chủ kỹ thuật xương cá, 5 Whys, phân biệt được vấn đề thực sự của doanh nghiệp và mong muốn giải pháp.",
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stage-3",
    title: "3. Khai thác và làm rõ yêu cầu",
    description: "Học cách giao tiếp, đặt câu hỏi phỏng vấn, workshop định hướng và thu thập thông tin từ stakeholder.",
    goal: "Lên kế hoạch khơi gợi yêu cầu hiệu quả, bộ câu hỏi phỏng vấn tối ưu và ghi chép tóm tắt biên bản họp chuẩn xác.",
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stage-4",
    title: "4. Viết requirement và tài liệu",
    description: "Viết tài liệu đặc tả yêu cầu chi tiết (SRS, User Story), định nghĩa Business Rule và điều kiện nghiệm thu (Acceptance Criteria).",
    goal: "Soạn thảo tài liệu đặc tả chức năng rõ ràng, không mơ hồ, giúp Dev phát triển và Tester xây dựng kịch bản kiểm thử dễ dàng.",
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stage-5",
    title: "5. Mô hình hóa nghiệp vụ",
    description: "Vẽ sơ đồ quy trình nghiệp vụ (BPMN), Use Case Diagram, Activity Diagram để mô tả luồng xử lý trực quan.",
    goal: "Sử dụng thành thạo BPMN 2.0 để mô hình hóa toàn bộ nghiệp vụ hiện tại (As-is) và cải tiến tương lai (To-be).",
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "stage-6",
    title: "6. Support Dev/Test/UAT và quản lý thay đổi",
    description: "Hỗ trợ đội ngũ lập trình, kiểm thử và đồng hành cùng khách hàng trong kiểm thử nghiệm thu (UAT), kiểm soát sự thay đổi của yêu cầu.",
    goal: "Giải quyết xung đột yêu cầu, viết biên bản nghiệm thu UAT kỹ lưỡng và quản lý quy trình Change Request chuyên nghiệp.",
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const DEFAULT_LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    stageId: "stage-1",
    title: "BA là gì?",
    order: 1,
    objective: "Hiểu đúng về định nghĩa Business Analyst, phân loại BA và vai trò cụ thể trong vòng đời phát triển phần mềm (SDLC).",
    theory: "Business Analyst (BA) là người trung gian kết nối giữa phòng ban nghiệp vụ/khách hàng và đội ngũ kỹ thuật. BA phân tích hoạt động kinh doanh, xác định vấn đề và cơ hội, từ đó đề xuất giải pháp công nghệ hoặc quy trình tối ưu để giúp doanh nghiệp đạt được mục tiêu.",
    example: "Tại ngân hàng TPBank, khi phòng kinh doanh muốn tự động hóa quy trình mở tài khoản từ xa (eKYC), BA sẽ làm việc với bên nghiệp vụ để hiểu điều kiện pháp lý, sau đó vẽ quy trình và đặc tả yêu cầu cho Dev code tính năng quét căn cước công dân và so khớp khuôn mặt.",
    exercise: "Hãy chọn một ứng dụng bạn dùng hàng ngày (ví dụ: Grab, Shopee) và liệt kê 3 tính năng chính, phân tích xem BA đã phải giải quyết bài toán nghiệp vụ gì khi làm tính năng đó.",
    realProjectApplication: "Áp dụng cho dự án tại chỗ của bạn: Xác định vai trò của bạn hoặc BA trong dự án hiện tại. Bạn đang giao tiếp với những ai? Stakeholders chính gồm những ai?",
    expectedOutput: "Bản phân tích stakeholder matrix đơn giản và phân loại thuộc nhóm BA nào (IT BA, Business System Analyst, hay Agile BA).",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lesson-2",
    stageId: "stage-1",
    title: "BABOK Overview",
    order: 2,
    objective: "Làm quen với cấu trúc Sách Hướng dẫn chuẩn Kiến thức Phân tích Nghiệp vụ (BABOK v3) và 6 Vùng Kiến thức chính.",
    theory: "BABOK Guide là tài liệu chuẩn toàn cầu cho nghề BA do IIBA phát triển. Nó bao gồm 6 Vùng Kiến thức (Knowledge Areas):\n1. Business Analysis Planning & Monitoring\n2. Elicitation & Collaboration\n3. Requirements Life Cycle Management\n4. Strategy Analysis\n5. Requirements Analysis & Design Definition\n6. Solution Evaluation.",
    example: "Khi bắt đầu một dự án nâng cấp hệ thống ERP cũ kỹ, thay vì nhảy vào viết tài liệu ngay (KA 5), BA chuyên nghiệp sẽ khảo sát Strategy Analysis (KA 4) để hiểu mục tiêu chiến lược và hoạch định quy trình thu thập yêu cầu (KA 1).",
    exercise: "Hãy tạo biểu đồ mindmap cá nhân tóm tắt 6 vùng kiến thức của BABOK và ghi chú 1 kỹ thuật (Technique) đại diện cho mỗi vùng.",
    realProjectApplication: "Nhìn nhận quy trình làm việc hiện tại của công ty bạn và đối chiếu xem quy trình đó đang thiếu hụt hay bỏ qua các hoạt động thuộc Vùng kiến thức nào trong BABOK.",
    expectedOutput: "Sơ đồ tư duy dạng tập tin ảnh/pdf hoặc vẽ tay tóm lược 6 vùng kiến thức BABOK.",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lesson-3",
    stageId: "stage-2",
    title: "Problem - Need - Requirement - Solution",
    order: 1,
    objective: "Phân biệt rõ ràng 4 khái niệm kinh điển giúp BA tư duy sâu sắc, tránh nhầm lẫn giữa giải pháp mong muốn và yêu cầu cốt lõi.",
    theory: "1. Problem: Nỗi đau/khó khăn thực tế của khách hàng.\n2. Need: Mong muốn/nhu cầu cần được giải quyết.\n3. Requirement: Đặc tả yêu cầu cụ thể hệ thống cần làm để đáp ứng Need.\n4. Solution: Cách thức hiện thực hóa yêu cầu đó.\nSai lầm phổ biến của BA non tay là copy nguyên giải pháp khách hàng đề xuất thành Requirement mà không phân tích Problem & Need.",
    example: "Khách hàng nói: \"Tôi cần nút xuất file Excel màu xanh lá cây\" (Solution). BA hỏi sâu hơn phát hiện: \"Hàng tuần tôi mất cả buổi sáng tổng hợp số liệu báo cáo thủ công để gửi CEO\" (Problem). Need thực sự là: \"Xem nhanh báo cáo tổng hợp để gửi CEO\". Requirement cứu cánh: \"Hệ thống tự động gửi báo cáo thống kê qua email vào 8g sáng thứ Hai hàng tuần\".",
    exercise: "Chuyển đổi phát biểu sau của khách hàng thành Problem - Need - Requirement: \"Tôi muốn ứng dụng có chatbox cài AI ChatGPT ở góc màn hình để hỗ trợ khách hàng mua sắm nhanh hơn\".",
    realProjectApplication: "Lọc ra 3 yêu cầu chức năng mới nhất từ khách hàng của dự án bạn đang làm, bóc tách xem khách hàng đang nói Solution hay thực sự truyền tải Problem.",
    expectedOutput: "Bảng phân tích 3 cột chi tiết bóc tách Problem -> Need -> Requirement tương ứng giải pháp gợi ý.",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lesson-4",
    stageId: "stage-3",
    title: "Bộ câu hỏi khai thác yêu cầu",
    order: 1,
    objective: "Thiết lập bộ khung câu hỏi chất vấn thông minh (Elicitation Questions) áp dụng cho mọi buổi phỏng vấn Stakeholder.",
    theory: "Khai thác yêu cầu không chỉ là lắng nghe mà còn hướng dẫn khách hàng tư duy. Sử dụng mô hình câu hỏi mở (Who, What, Why, How, When, Where) kết hợp với kỹ thuật đặt giả thuyết biên (Edge Cases). Tránh các câu hỏi đóng dẫn dắt dạng \"Anh có muốn hệ thống tự động gửi mail không?\".",
    example: "Thay vì hỏi \"Hệ thống phân quyền thế nào?\", BA chuyên sâu hỏi: \"Ai là người trực tiếp duyệt hóa đơn này? Nếu họ đi vắng thì ai có quyền duyệt thay? Có giới hạn số tiền tối đa cho mỗi cấp duyệt không?\".",
    exercise: "Xây dựng bộ 10 câu hỏi phỏng vấn chuẩn bị cho buổi họp tìm hiểu quy trình thanh toán trực tuyến của một website thương mại điện tử mới.",
    realProjectApplication: "Chuẩn bị kịch bản cuộc họp (Agenda) và checklist câu hỏi cho buổi workshop hoặc meeting sắp tới với khách hàng.",
    expectedOutput: "Tài liệu Elicitation Questionnaire gồm ít nhất 3 nhóm: Hiện trạng (As-is), Kỳ vọng (To-be), Ràng buộc (Constraints).",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lesson-5",
    stageId: "stage-4",
    title: "Cấu trúc một chức năng SRS",
    order: 1,
    objective: "Nắm vững cấu trúc chuẩn mực khi mô tả chi tiết một tính năng/chức năng phần mềm trong tài liệu SRS (Software Requirement Specification).",
    theory: "Một chức năng đặc tả chi tiết trong SRS thường bao gồm các phần:\n1. Tên tính năng & Mã định danh (ID).\n2. Mô tả tổng quan ngắn (Description).\n3. Tác nhân kích hoạt (Actor).\n4. Điều kiện tiên quyết (Pre-condition).\n5. Luồng xử lý chính (Main Flow/Normal Flow).\n6. Các luồng rẽ nhánh/thất bại (Alternative Flows & Exception Flows).\n7. Điều kiện sau khi thực hiện (Post-condition).\n8. Các Business Rules / Ràng buộc kỹ thuật liên quan.",
    example: "Đặc tả chức năng \"Đăng nhập\": Luồng chính nhập đúng mật khẩu thì chuyển vào Home. Luồng rẽ nhánh: Sai mật khẩu dưới 5 lần hiển thị thông báo lỗi. Luồng exception: Sai quá 5 lần thì khóa tài khoản tạm thời 15 phút.",
    exercise: "Hãy viết tài liệu đặc tả SRS đầy đủ luồng chính, luồng rẽ nhánh và exception cho tính năng \"Đổi mật khẩu\" của người dùng.",
    realProjectApplication: "Soạn thảo trực tiếp một chương tài liệu chứa đặc tả chức năng sắp được bàn giao cho đội phát triển của bạn.",
    expectedOutput: "Bản đặc tả chức năng dạng Word hoặc Markdown có chi tiết cấu trúc 8 mục chuẩn.",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lesson-6",
    stageId: "stage-4",
    title: "Business Rule và Validation Rule",
    order: 2,
    objective: "Phân biệt chính xác Luật nghiệp vụ (Business Rule) mang tính chất sống còn của doanh nghiệp với Quy tắc kiểm tra tính hợp lệ dữ liệu nhập (Validation Rule).",
    theory: "- Business Rule: Quy định, chính sách hoạt động của doanh nghiệp tồn tại độc lập có hoặc không có phần mềm. Ví dụ: \"Thẻ thành viên thẻ Vàng được giảm giá 10%\".\n- Validation Rule: Quy định mang tính kỹ thuật của hệ thống để nhập liệu chuẩn xác. Ví dụ: \"Trường Email phải chứa ký tự @\", \"Mật khẩu có tối thiểu 8 ký tự\".\nBA cần tách riêng Business Rules để dễ cập nhật khi chính sách doanh nghiệp thay đổi không ảnh hưởng đến cấu trúc code cốt lõi.",
    example: "Tại công ty Tiki, Business Rule là \"Đơn giao hỏa tốc chỉ áp dụng trong phạm vi TP.HCM và Hà Nội\". Validation Rule là \"Trường Số điện thoại nhận hàng bắt buộc phải là số và dài đúng 10 chữ số\".",
    exercise: "Hãy phân loại 5 quy định sau thành Business Rule hoặc Validation Rule:\n1. Tuổi khách hàng phải từ 18;\n2. Hệ thống bắt buộc nhập họ tên;\n3. Khách quen được nợ tối đa 5 triệu đồng;\n4. Số tài khoản ngân hàng không chứa chữ cái;\n5. Mỗi khách hàng chỉ có duy nhất 1 mã định danh.",
    realProjectApplication: "Liệt kê danh sách các Business Rules trong dự án bạn đang làm việc để quản lý tập trung thay vì viết rải rác trong các chức năng.",
    expectedOutput: "Tài liệu Business Rule Matrix (Bảng ma trận luật nghiệp vụ) quản lý tập trung cho dự án.",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lesson-7",
    stageId: "stage-4",
    title: "Acceptance Criteria",
    order: 3,
    objective: "Viết tiêu chí nghiệm thu (Acceptance Criteria - AC) chuẩn mực dùng cho User Story, giúp Developer tự tin lập trình và Tester kiểm thử.",
    theory: "Acceptance Criteria định nghĩa ranh giới hoạt động của một User Story. Kỹ thuật viết AC phổ biến nhất là Scenario-based (Given-When-Then):\n- GIVEN: Bối cảnh ban đầu.\n- WHEN: Hành động của người dùng.\n- THEN: Kết quả hệ thống thực thi.\nAC giúp loại bỏ sự không chắc chắn và thiết lập định nghĩa về \"Hoàn thành\" (Definition of Done).",
    example: "Story: Là khách mua hàng, tôi muốn áp dụng mã coupon giảm giá để tiết kiệm chi phí.\nAC Scenario: Áp dụng mã giảm giá thành công\n- GIVEN khách hàng đã chọn sản phẩm trị giá 500k vào giỏ hàng\n- WHEN người dùng nhập mã \"GIAM50\" và nhấn áp dụng\n- THEN hệ thống hiển thị thông tin giảm 50k đồng thời cập nhật tổng tiền thanh toán còn 450k.",
    exercise: "Hãy viết 2 kịch bản AC dưới dạng Given-When-Then cho tính năng rút tiền tại ATM (Thành công và Thất bại do không đủ số dư).",
    realProjectApplication: "Viết Acceptance Criteria cho một User Story cụ thể trong Sprint Backlog dự án hiện tại của bạn.",
    expectedOutput: "Danh sách ít nhất 3 kịch bản Acceptance Criteria dạng Given-When-Then cho câu chuyện người dùng đã chọn.",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lesson-8",
    stageId: "stage-5",
    title: "BPMN cơ bản",
    order: 1,
    objective: "Sử dụng chuẩn BPMN (Business Process Model and Notation) để biểu diễn dòng chảy nghiệp vụ từ đầu đến cuối một cách chuyên nghiệp.",
    theory: "BPMN là chuẩn mô tả quy trình nghiệp vụ bằng sơ đồ trực quan. Các ký hiệu cốt lõi gồm:\n1. Pool & Lane: Đại diện cho Tổ chức (Pool) và Vai trò/Phòng ban xử lý (Lane).\n2. Tasks (Hình chữ nhật bo góc): Công việc cụ thể cần làm.\n3. Gateways (Hình thoi): Điểm rẽ nhánh điều kiện (Exclusive X, Parallel +, Inclusive O).\n4. Events (Hình tròn): Điểm bắt đầu (Start), kết thúc (End), hoặc trung gian (Intermediate).",
    example: "Trong quy trình \"Đặt món ăn trên ShopeeFood\", Pool là ShopeeFood, các Lanes gồm: Khách hàng, Nhà hàng, Shipper. Quá trình bắt đầu từ khách chọn món -> Nhà hàng chuẩn bị (Task) -> Shipper giao hàng -> Kết thúc khi khách nhận món thành công.",
    exercise: "Vẽ quy trình BPMN đơn giản mô tả quy trình duyệt đơn xin nghỉ phép của nhân viên trong công ty (Nhân viên -> Trưởng phòng duyệt -> Nhân sự lưu hồ sơ). Hãy xác định rõ các Swimlanes và Gateways tương ứng.",
    realProjectApplication: "Khảo sát và vẽ lại quy trình nghiệp vụ thực tế (mức As-Is) cho một phòng ban nghiệp vụ mà phần mềm của bạn đang nhắm tới phục vụ.",
    expectedOutput: "Tệp sơ đồ quy trình nghiệp vụ xuất dạng PDF/PNG vẽ từ công cụ như Camunda, draw.io hoặc Bizagi.",
    status: LessonStatus.NOT_STARTED,
    personalNote: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "c-1", lessonId: "lesson-1", content: "Tôi đã nắm được 3 vai trò cốt lõi của BA.", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-2", lessonId: "lesson-1", content: "Tôi phân biệt được IT BA và Business BA.", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-3", lessonId: "lesson-1", content: "Tôi hiểu vị trí của BA trong các giai đoạn SDLC (Waterfall vs Agile).", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  { id: "c-4", lessonId: "lesson-2", content: "Tôi hiểu 6 vùng kiến thức cốt lõi của BABOK.", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-5", lessonId: "lesson-2", content: "Tôi nhớ được ít nhất 5 kỹ thuật chính được nhắc đến trong BABOK.", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-6", lessonId: "lesson-2", content: "Tôi tự định vị được kỹ năng hiện tại của mình thuộc vùng kiến thức nào.", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  { id: "c-7", lessonId: "lesson-3", content: "Tôi phân biệt được rạch ròi giữa Nhu cầu (Need) và Giải pháp (Solution).", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-8", lessonId: "lesson-3", content: "Tôi nắm được kỹ thuật đặt câu hỏi \"Tại sao\" để tìm về Problem gốc rễ.", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-9", lessonId: "lesson-3", content: "Tôi biết cách viết một câu Requirement trung lập không lồng ghép giải pháp giao diện.", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  { id: "c-10", lessonId: "lesson-4", content: "Tôi đã chuẩn bị được bộ câu hỏi có tính bao quát từ nghiệp vụ đến kỹ thuật.", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-11", lessonId: "lesson-4", content: "Tôi tránh được các câu hỏi đóng gây định kiến cho khách hàng.", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-12", lessonId: "lesson-4", content: "Tôi biết cách phân loại các câu hỏi áp dụng cho người dùng cuối (User) và người quản lý (Manager).", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  { id: "c-13", lessonId: "lesson-5", content: "Tôi đã viết đầy đủ các luồng ngoại lệ (Exceptions) cho tính năng.", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-14", lessonId: "lesson-5", content: "Tôi đã xác định rõ ràng tác nhân (Actor) và các điều kiện kích hoạt hệ thống.", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-15", lessonId: "lesson-5", content: "Tôi mô tả các bước hành động một cách khách quan, rõ ràng, không tối nghĩa.", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  { id: "c-16", lessonId: "lesson-6", content: "Tôi nhận diện được đâu là chính sách bên ngoài (Business Rule) và đâu là ràng buộc trên màn hình (Validation Rule).", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-17", lessonId: "lesson-6", content: "Tôi biết cách gom nhóm các Business Rules vào một bảng riêng để dễ bảo trì tài liệu.", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-18", lessonId: "lesson-6", content: "Tôi viết rõ ràng các điều kiện đúng/sai để lập trình viên áp dụng nghiệp vụ.", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  { id: "c-19", lessonId: "lesson-7", content: "Tôi áp dụng trôi chảy công thức Given-When-Then.", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-20", lessonId: "lesson-7", content: "Kịch bản của tôi bao trùm cả trường hợp thành công (Sunny day) và thất bại (Rainy day).", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-21", lessonId: "lesson-7", content: "Acceptance Criteria của tôi có thể kiểm thử trực quan được.", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },

  { id: "c-22", lessonId: "lesson-8", content: "Tôi đã nắm được ý nghĩa của Pools và Lanes.", isChecked: false, order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-23", lessonId: "lesson-8", content: "Tôi biết cách dùng cổng rẽ nhánh Exclusive (X) và Parallel (+) hợp lý.", isChecked: false, order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "c-24", lessonId: "lesson-8", content: "Sơ đồ nghiệp vụ của tôi có một điểm bắt đầu rõ ràng và các điểm kết thúc logic.", isChecked: false, order: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

export class DBService {
  private static loadDB(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE_PATH)) {
        const initialDB: DatabaseSchema = {
          stages: DEFAULT_STAGES,
          lessons: DEFAULT_LESSONS,
          checklistItems: DEFAULT_CHECKLIST,
          practices: []
        };
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDB, null, 2), "utf-8");
        return initialDB;
      }
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(raw) as DatabaseSchema;
    } catch (e) {
      console.error("Error reading db file, returning empty state", e);
      return { stages: [], lessons: [], checklistItems: [], practices: [] };
    }
  }

  private static saveDB(db: DatabaseSchema): void {
    if (process.env.DATABASE_URL) return; // Prevent writing to JSON when on Prisma
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing db file", e);
    }
  }

  // --- STAGES CRUD ---
  public static async getStages(): Promise<Stage[]> {
    const prisma = getPrisma();
    if (prisma) {
      const stages = await prisma.stage.findMany({
        orderBy: { order: "asc" }
      });
      return stages.map(s => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString()
      })) as Stage[];
    }
    const db = this.loadDB();
    return db.stages.sort((a, b) => a.order - b.order);
  }

  public static async getStageById(id: string): Promise<Stage | null> {
    const prisma = getPrisma();
    if (prisma) {
      const stage = await prisma.stage.findUnique({
        where: { id }
      });
      if (!stage) return null;
      return {
        ...stage,
        createdAt: stage.createdAt.toISOString(),
        updatedAt: stage.updatedAt.toISOString()
      } as Stage;
    }
    const db = this.loadDB();
    return db.stages.find(s => s.id === id) || null;
  }

  public static async createStage(title: string, description: string, goal: string, order: number): Promise<Stage> {
    const prisma = getPrisma();
    if (prisma) {
      const stage = await prisma.stage.create({
        data: {
          title,
          description,
          goal,
          order: order || 0
        }
      });
      return {
        ...stage,
        createdAt: stage.createdAt.toISOString(),
        updatedAt: stage.updatedAt.toISOString()
      } as Stage;
    }
    const db = this.loadDB();
    const newStage: Stage = {
      id: "stage-" + generateUUID(),
      title,
      description,
      goal,
      order: order || (db.stages.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.stages.push(newStage);
    this.saveDB(db);
    return newStage;
  }

  public static async updateStage(id: string, updates: Partial<Omit<Stage, "id" | "createdAt" | "updatedAt">>): Promise<Stage | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const stage = await prisma.stage.update({
          where: { id },
          data: updates
        });
        return {
          ...stage,
          createdAt: stage.createdAt.toISOString(),
          updatedAt: stage.updatedAt.toISOString()
        } as Stage;
      } catch (e) {
        return null;
      }
    }
    const db = this.loadDB();
    const index = db.stages.findIndex(s => s.id === id);
    if (index === -1) return null;

    db.stages[index] = {
      ...db.stages[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDB(db);
    return db.stages[index];
  }

  public static async deleteStage(id: string): Promise<boolean> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.stage.delete({
          where: { id }
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    const db = this.loadDB();
    const originalLength = db.stages.length;
    db.stages = db.stages.filter(s => s.id !== id);
    
    // Waterfall deletion
    db.lessons = db.lessons.filter(l => {
      if (l.stageId === id) {
        db.checklistItems = db.checklistItems.filter(c => c.lessonId !== l.id);
        db.practices = db.practices.filter(p => p.lessonId !== l.id);
        return false;
      }
      return true;
    });

    this.saveDB(db);
    return db.stages.length < originalLength;
  }

  // --- LESSONS CRUD ---
  public static async getLessons(stageId?: string): Promise<Lesson[]> {
    const prisma = getPrisma();
    if (prisma) {
      const condition = stageId ? { stageId } : {};
      const lessons = await prisma.lesson.findMany({
        where: condition,
        orderBy: { order: "asc" }
      });
      return lessons.map(l => ({
        ...l,
        status: l.status as LessonStatus,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString()
      })) as Lesson[];
    }
    const db = this.loadDB();
    let lessons = db.lessons;
    if (stageId) {
      lessons = lessons.filter(l => l.stageId === stageId);
    }
    return lessons.sort((a, b) => a.order - b.order);
  }

  public static async getLessonById(id: string): Promise<Lesson | null> {
    const prisma = getPrisma();
    if (prisma) {
      const lesson = await prisma.lesson.findUnique({
        where: { id }
      });
      if (!lesson) return null;
      return {
        ...lesson,
        status: lesson.status as LessonStatus,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString()
      } as Lesson;
    }
    const db = this.loadDB();
    return db.lessons.find(l => l.id === id) || null;
  }

  public static async createLesson(lessonInput: Omit<Lesson, "id" | "createdAt" | "updatedAt" | "status" | "personalNote">, checklistText?: string): Promise<Lesson> {
    const prisma = getPrisma();
    if (prisma) {
      const newLesson = await prisma.lesson.create({
        data: {
          stageId: lessonInput.stageId,
          title: lessonInput.title,
          order: lessonInput.order,
          objective: lessonInput.objective,
          theory: lessonInput.theory,
          example: lessonInput.example,
          exercise: lessonInput.exercise,
          realProjectApplication: lessonInput.realProjectApplication,
          expectedOutput: lessonInput.expectedOutput,
          status: "NOT_STARTED",
          personalNote: ""
        }
      });

      if (checklistText) {
        const lines = checklistText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        for (let i = 0; i < lines.length; i++) {
          const content = lines[i].replace(/^[-\*\s\d\.\)]+/, "").trim();
          await prisma.checklistItem.create({
            data: {
              lessonId: newLesson.id,
              content,
              isChecked: false,
              order: i + 1
            }
          });
        }
      }

      return {
        ...newLesson,
        status: newLesson.status as LessonStatus,
        createdAt: newLesson.createdAt.toISOString(),
        updatedAt: newLesson.updatedAt.toISOString()
      } as Lesson;
    }

    const db = this.loadDB();
    const newId = "lesson-" + generateUUID();
    const newLesson: Lesson = {
      ...lessonInput,
      id: newId,
      status: LessonStatus.NOT_STARTED,
      personalNote: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.lessons.push(newLesson);

    if (checklistText) {
      const lines = checklistText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      lines.forEach((line, index) => {
        const content = line.replace(/^[-\*\s\d\.\)]+/, "").trim();
        db.checklistItems.push({
          id: "checklist-" + generateUUID(),
          lessonId: newId,
          content,
          isChecked: false,
          order: index + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    }

    this.saveDB(db);
    return newLesson;
  }

  public static async updateLesson(id: string, updates: Partial<Omit<Lesson, "id" | "createdAt" | "updatedAt">>): Promise<Lesson | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const parsedUpdates: any = {};
        if (updates.stageId !== undefined) parsedUpdates.stageId = updates.stageId;
        if (updates.title !== undefined) parsedUpdates.title = updates.title;
        if (updates.order !== undefined) parsedUpdates.order = updates.order;
        if (updates.objective !== undefined) parsedUpdates.objective = updates.objective;
        if (updates.theory !== undefined) parsedUpdates.theory = updates.theory;
        if (updates.example !== undefined) parsedUpdates.example = updates.example;
        if (updates.exercise !== undefined) parsedUpdates.exercise = updates.exercise;
        if (updates.realProjectApplication !== undefined) parsedUpdates.realProjectApplication = updates.realProjectApplication;
        if (updates.expectedOutput !== undefined) parsedUpdates.expectedOutput = updates.expectedOutput;
        if (updates.status !== undefined) parsedUpdates.status = updates.status;
        if (updates.personalNote !== undefined) parsedUpdates.personalNote = updates.personalNote;

        const lesson = await prisma.lesson.update({
          where: { id },
          data: parsedUpdates
        });
        return {
          ...lesson,
          status: lesson.status as LessonStatus,
          createdAt: lesson.createdAt.toISOString(),
          updatedAt: lesson.updatedAt.toISOString()
        } as Lesson;
      } catch (e) {
        return null;
      }
    }

    const db = this.loadDB();
    const index = db.lessons.findIndex(l => l.id === id);
    if (index === -1) return null;

    db.lessons[index] = {
      ...db.lessons[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDB(db);
    return db.lessons[index];
  }

  public static async deleteLesson(id: string): Promise<boolean> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.lesson.delete({
          where: { id }
        });
        return true;
      } catch (e) {
        return false;
      }
    }

    const db = this.loadDB();
    const originalLength = db.lessons.length;
    db.lessons = db.lessons.filter(l => l.id !== id);
    
    db.checklistItems = db.checklistItems.filter(c => c.lessonId !== id);
    db.practices = db.practices.filter(p => p.lessonId !== id);

    this.saveDB(db);
    return db.lessons.length < originalLength;
  }

  // --- CHECKLIST CRUD ---
  public static async getChecklistItems(lessonId: string): Promise<ChecklistItem[]> {
    const prisma = getPrisma();
    if (prisma) {
      const items = await prisma.checklistItem.findMany({
        where: { lessonId },
        orderBy: { order: "asc" }
      });
      return items.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      })) as ChecklistItem[];
    }

    const db = this.loadDB();
    return db.checklistItems.filter(c => c.lessonId === lessonId).sort((a, b) => a.order - b.order);
  }

  public static async createChecklistItem(lessonId: string, content: string, order?: number): Promise<ChecklistItem> {
    const prisma = getPrisma();
    if (prisma) {
      const count = await prisma.checklistItem.count({ where: { lessonId } });
      const item = await prisma.checklistItem.create({
        data: {
          lessonId,
          content,
          isChecked: false,
          order: order || (count + 1)
        }
      });
      return {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      } as ChecklistItem;
    }

    const db = this.loadDB();
    const nextOrder = order || (db.checklistItems.filter(c => c.lessonId === lessonId).length + 1);
    const newItem: ChecklistItem = {
      id: "checklist-" + generateUUID(),
      lessonId,
      content,
      isChecked: false,
      order: nextOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.checklistItems.push(newItem);
    this.saveDB(db);
    return newItem;
  }

  public static async updateChecklistItem(id: string, content: string): Promise<ChecklistItem | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const item = await prisma.checklistItem.update({
          where: { id },
          data: { content }
        });
        return {
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        } as ChecklistItem;
      } catch (e) {
        return null;
      }
    }

    const db = this.loadDB();
    const index = db.checklistItems.findIndex(c => c.id === id);
    if (index === -1) return null;

    db.checklistItems[index].content = content;
    db.checklistItems[index].updatedAt = new Date().toISOString();
    this.saveDB(db);
    return db.checklistItems[index];
  }

  public static async toggleChecklistItem(id: string): Promise<ChecklistItem | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const current = await prisma.checklistItem.findUnique({ where: { id } });
        if (!current) return null;
        const item = await prisma.checklistItem.update({
          where: { id },
          data: { isChecked: !current.isChecked }
        });
        return {
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString()
        } as ChecklistItem;
      } catch (e) {
        return null;
      }
    }

    const db = this.loadDB();
    const index = db.checklistItems.findIndex(c => c.id === id);
    if (index === -1) return null;

    db.checklistItems[index].isChecked = !db.checklistItems[index].isChecked;
    db.checklistItems[index].updatedAt = new Date().toISOString();
    this.saveDB(db);
    return db.checklistItems[index];
  }

  public static async deleteChecklistItem(id: string): Promise<boolean> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.checklistItem.delete({ where: { id } });
        return true;
      } catch (e) {
        return false;
      }
    }

    const db = this.loadDB();
    const lenBefore = db.checklistItems.length;
    db.checklistItems = db.checklistItems.filter(c => c.id !== id);
    this.saveDB(db);
    return db.checklistItems.length < lenBefore;
  }

  // Bulk update / sync checklists for edit form
  public static async syncChecklistItems(lessonId: string, lines: string[]): Promise<void> {
    const prisma = getPrisma();
    if (prisma) {
      await prisma.checklistItem.deleteMany({ where: { lessonId } });
      for (let i = 0; i < lines.length; i++) {
        await prisma.checklistItem.create({
          data: {
            lessonId,
            content: lines[i],
            isChecked: false,
            order: i + 1
          }
        });
      }
      return;
    }

    const db = this.loadDB();
    db.checklistItems = db.checklistItems.filter(c => c.lessonId !== lessonId);
    lines.forEach((line, index) => {
      db.checklistItems.push({
        id: "checklist-" + generateUUID(),
        lessonId,
        content: line,
        isChecked: false,
        order: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });
    this.saveDB(db);
  }

  // --- PRACTICE / LESSON WORKSPACE WORK ---
  public static async getPracticeByLesson(lessonId: string): Promise<Practice> {
    const prisma = getPrisma();
    if (prisma) {
      let practice = await prisma.practice.findFirst({
        where: { lessonId }
      });
      if (!practice) {
        practice = await prisma.practice.create({
          data: {
            lessonId,
            projectName: "",
            content: "",
            reflection: ""
          }
        });
      }
      return {
        ...practice,
        createdAt: practice.createdAt.toISOString(),
        updatedAt: practice.updatedAt.toISOString()
      } as Practice;
    }

    const db = this.loadDB();
    let practice = db.practices.find(p => p.lessonId === lessonId);
    if (!practice) {
      practice = {
        id: "practice-" + generateUUID(),
        lessonId,
        projectName: "",
        content: "",
        reflection: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.practices.push(practice);
      this.saveDB(db);
    }
    return practice;
  }

  public static async savePractice(lessonId: string, projectName: string, content: string, reflection: string): Promise<Practice> {
    const prisma = getPrisma();
    if (prisma) {
      const practice = await prisma.practice.findFirst({
        where: { lessonId }
      });

      const pData = {
        projectName,
        content,
        reflection
      };

      let result;
      if (!practice) {
        result = await prisma.practice.create({
          data: {
            lessonId,
            ...pData
          }
        });
      } else {
        result = await prisma.practice.update({
          where: { id: practice.id },
          data: pData
        });
      }
      return {
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString()
      } as Practice;
    }

    const db = this.loadDB();
    const index = db.practices.findIndex(p => p.lessonId === lessonId);
    
    const pData = {
      projectName,
      content,
      reflection,
      updatedAt: new Date().toISOString()
    };

    if (index === -1) {
      const newPractice: Practice = {
        id: "practice-" + generateUUID(),
        lessonId,
        ...pData,
        createdAt: new Date().toISOString()
      };
      db.practices.push(newPractice);
      this.saveDB(db);
      return newPractice;
    } else {
      db.practices[index] = {
        ...db.practices[index],
        ...pData
      };
      this.saveDB(db);
      return db.practices[index];
    }
  }

  // --- DASHBOARD / STATS METRICS ---
  public static async getDashboardStats(): Promise<any> {
    const prisma = getPrisma();
    if (prisma) {
      const totalStages = await prisma.stage.count();
      const totalLessons = await prisma.lesson.count();
      const completedLessons = await prisma.lesson.count({
        where: { status: "COMPLETED" }
      });
      const inProgressLessons = await prisma.lesson.count({
        where: { status: "IN_PROGRESS" }
      });

      const recentLessonsRaw = await prisma.lesson.findMany({
        orderBy: { updatedAt: "desc" },
        take: 3
      });
      const recentLessons = recentLessonsRaw.map(l => ({
        ...l,
        status: l.status as LessonStatus,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString()
      }));

      const stages = await prisma.stage.findMany({
        orderBy: { order: "asc" }
      });

      const stageProgress = [];
      for (const stage of stages) {
        const sTotal = await prisma.lesson.count({ where: { stageId: stage.id } });
        const sCompleted = await prisma.lesson.count({
          where: { stageId: stage.id, status: "COMPLETED" }
        });
        const sInProgress = await prisma.lesson.count({
          where: { stageId: stage.id, status: "IN_PROGRESS" }
        });
        const percentage = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;

        stageProgress.push({
          stageId: stage.id,
          stageTitle: stage.title,
          totalLessons: sTotal,
          completedLessons: sCompleted,
          inProgressLessons: sInProgress,
          percentage
        });
      }

      return {
        totalStages,
        totalLessons,
        completedLessons,
        inProgressLessons,
        recentLessons,
        stageProgress
      };
    }

    const db = this.loadDB();
    const totalStages = db.stages.length;
    const totalLessons = db.lessons.length;
    const completedLessons = db.lessons.filter(l => l.status === LessonStatus.COMPLETED).length;
    const inProgressLessons = db.lessons.filter(l => l.status === LessonStatus.IN_PROGRESS).length;

    const recentLessons = [...db.lessons]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    const stageProgress = db.stages.map(stage => {
      const stageLessons = db.lessons.filter(l => l.stageId === stage.id);
      const sTotal = stageLessons.length;
      const sCompleted = stageLessons.filter(l => l.status === LessonStatus.COMPLETED).length;
      const sInProgress = stageLessons.filter(l => l.status === LessonStatus.IN_PROGRESS).length;
      const percentage = sTotal > 0 ? Math.round((sCompleted / sTotal) * 100) : 0;
      
      return {
        stageId: stage.id,
        stageTitle: stage.title,
        totalLessons: sTotal,
        completedLessons: sCompleted,
        inProgressLessons: sInProgress,
        percentage
      };
    });

    return {
      totalStages,
      totalLessons,
      completedLessons,
      inProgressLessons,
      recentLessons,
      stageProgress
    };
  }
}
