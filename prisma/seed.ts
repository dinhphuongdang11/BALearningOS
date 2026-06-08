import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Safe setup of Stages
  console.log('Checking default stages...');
  const stagesData = [
    {
      title: 'Xây bản đồ nghề BA',
      description: 'Tìm hiểu tổng quan về nghề Business Analyst, các kỹ năng cần thiết và định hướng phát triển nghề nghiệp.',
      goal: 'Hiểu rõ vai trò của BA trong dự án, cấu trúc chuẩn nghề nghiệp BABOK và lộ trình phát triển cá nhân.',
      order: 1,
    },
    {
      title: 'Xây lõi tư duy phân tích',
      description: 'Luyện tập tư duy phân tích vấn đề, phân tích nguyên nhân gốc rễ và liên kết Problem - Need - Requirement - Solution.',
      goal: 'Biết phân biệt vấn đề, nhu cầu, yêu cầu và giải pháp; biết phân tích nguyên nhân gốc rễ.',
      order: 2,
    },
    {
      title: 'Khai thác và làm rõ yêu cầu',
      description: 'Học cách giao tiếp, đặt câu hỏi phỏng vấn, workshop định hướng và thu thập thông tin từ stakeholder.',
      goal: 'Biết chuẩn bị câu hỏi, khai thác thông tin, xác nhận hiểu biết và ghi nhận quyết định sau buổi làm việc.',
      order: 3,
    },
    {
      title: 'Viết requirement và tài liệu',
      description: 'Học cách đặc tả yêu cầu, viết SRS/PRD, mô tả chức năng, business rule, validation rule và acceptance criteria.',
      goal: 'Viết được requirement rõ ràng, đầy đủ thông tin để Dev/Test có thể hiểu và triển khai.',
      order: 4,
    },
    {
      title: 'Mô hình hóa nghiệp vụ',
      description: 'Học cách mô hình hóa quy trình nghiệp vụ bằng BPMN, activity diagram, use case, context diagram và state diagram.',
      goal: 'Biết bóc tách hệ thống lớn, mô tả business process và vẽ diagram phục vụ phân tích yêu cầu.',
      order: 5,
    },
    {
      title: 'Support Dev/Test/UAT và quản lý thay đổi',
      description: 'Học cách hỗ trợ Dev/Test/UAT, trả lời expected result, phân tích bug/change request và đánh giá impact.',
      goal: 'Biết support triển khai, kiểm thử, nghiệm thu và quản lý thay đổi yêu cầu trong dự án thật.',
      order: 6,
    },
  ];

  // We assign stages to an order-indexed map for lesson linking
  const stagesMap = new Map<number, any>();

  for (const item of stagesData) {
    const existingStage = await prisma.stage.findUnique({
      where: { order: item.order },
    });

    if (existingStage) {
      // Stage already exists - update details to guarantee mapping is synchronized but preserve DB entity
      const updatedStage = await prisma.stage.update({
        where: { id: existingStage.id },
        data: {
          title: item.title,
          description: item.description,
          goal: item.goal,
        },
      });
      stagesMap.set(item.order, updatedStage);
      console.log(`Stage already exists: ${item.title}`);
    } else {
      // Create new stage
      const newStage = await prisma.stage.create({
        data: item,
      });
      stagesMap.set(item.order, newStage);
      console.log(`Created stage: ${item.title}`);
    }
  }

  // 2. Safe setup of Lessons
  console.log('Checking sample lessons...');
  const lessonsData = [
    {
      stageOrder: 1, // Xây bản đồ nghề BA
      title: 'BA là gì?',
      order: 1,
      objective: 'Hiểu đúng về định nghĩa Business Analyst, phân loại BA và vai trò cụ thể trong vòng đời phát triển phần mềm (SDLC).',
      theory: 'Business Analyst (BA) là người trung gian kết nối giữa phòng ban nghiệp vụ/khách hàng và đội ngũ kỹ thuật. BA phân tích hoạt động kinh doanh, xác định vấn đề và cơ hội, từ đó đề xuất giải pháp công nghệ hoặc quy trình tối ưu để giúp doanh nghiệp đạt được mục tiêu.',
      example: 'Tại ngân hàng TPBank, khi phòng kinh doanh muốn tự động hóa quy trình mở tài khoản từ xa (eKYC), BA sẽ làm việc với bên nghiệp vụ để hiểu điều kiện pháp lý, sau đó vẽ quy trình và đặc tả yêu cầu cho Dev code tính năng quét căn cước công dân và so khớp khuôn mặt.',
      exercise: 'Hãy chọn một ứng dụng bạn dùng hàng ngày (ví dụ: Grab, Shopee) và liệt kê 3 tính năng chính, phân tích xem BA đã phải giải quyết bài toán nghiệp vụ gì khi làm tính năng đó.',
      realProjectApplication: 'Áp dụng cho dự án tại chỗ của bạn: Xác định vai trò của bạn hoặc BA trong dự án hiện tại. Bạn đang giao tiếp với những ai? Stakeholders chính gồm những ai?',
      expectedOutput: 'Bản phân tích stakeholder matrix đơn giản và phân loại thuộc nhóm BA nào (IT BA, Business System Analyst, hay Agile BA).',
      checklist: [
        'Tôi đã nắm được 3 vai trò cốt lõi của BA.',
        'Tôi phân biệt được IT BA và Business BA.',
        'Tôi hiểu vị trí của BA trong các giai đoạn SDLC (Waterflow vs Agile).'
      ]
    },
    {
      stageOrder: 1, // Xây bản đồ nghề BA
      title: 'BABOK overview',
      order: 2,
      objective: 'Làm quen với cấu trúc Sách Hướng dẫn chuẩn Kiến thức Phân tích Nghiệp vụ (BABOK v3) và 6 Vùng Kiến thức chính.',
      theory: 'BABOK Guide là tài liệu chuẩn toàn cầu cho nghề BA do IIBA phát triển. Nó bao gồm 6 Vùng Kiến thức (Knowledge Areas): 1. Business Analysis Planning & Monitoring, 2. Elicitation & Collaboration, 3. Requirements Life Cycle Management, 4. Strategy Analysis, 5. Requirements Analysis & Design Definition, 6. Solution Evaluation.',
      example: 'Khi bắt đầu một dự án nâng cấp hệ thống ERP cũ kỹ, thay vì nhảy vào viết tài liệu ngay (KA 5), BA chuyên nghiệp sẽ khảo sát Strategy Analysis (KA 4) để hiểu mục tiêu chiến lược và hoạch định quy trình thu thập yêu cầu (KA 1).',
      exercise: 'Hãy tạo biểu đồ mindmap cá nhân tóm tắt 6 vùng kiến thức của BABOK và ghi chú 1 kỹ thuật (Technique) đại diện cho mỗi vùng.',
      realProjectApplication: 'Nhìn nhận quy trình làm việc hiện tại của công ty bạn và đối chiếu xem quy trình đó đang thiếu hụt hay bỏ qua các hoạt động thuộc Vùng kiến thức nào trong BABOK.',
      expectedOutput: 'Sơ đồ tư duy dạng tập tin ảnh/pdf hoặc vẽ tay tóm lược 6 vùng kiến thức BABOK.',
      checklist: [
        'Tôi hiểu 6 vùng kiến thức cốt lõi của BABOK.',
        'Tôi nhớ được ít nhất 5 kỹ thuật chính được nhắc đến trong BABOK.',
        'Tôi tự định vị được kỹ năng hiện tại của mình thuộc vùng kiến thức nào.'
      ]
    },
    {
      stageOrder: 2, // Xây lõi tư duy phân tích
      title: 'Problem - Need - Requirement - Solution',
      order: 1,
      objective: 'Phân biệt rõ ràng 4 khái niệm kinh điển giúp BA tư duy sâu sắc, tránh nhầm lẫn giữa giải pháp mong muốn và yêu cầu cốt lõi.',
      theory: '1. Problem: Nỗi đau/khó khăn thực tế của khách hàng.\n2. Need: Mong muốn/nhu cầu cần được giải quyết.\n3. Requirement: Đặc tả yêu cầu cụ thể hệ thống cần làm để đáp ứng Need.\n4. Solution: Cách thức hiện thực hóa yêu cầu đó.\nSai lầm phổ biến của BA non tay là copy nguyên giải pháp khách hàng đề xuất thành Requirement mà không phân tích Problem & Need.',
      example: 'Khách hàng nói: "Tôi cần nút xuất file Excel màu xanh lá cây" (Solution). BA hỏi sâu hơn phát hiện: "Hàng tuần tôi mất cả buổi sáng tổng hợp số liệu báo cáo thủ công để gửi CEO" (Problem). Need thực sự là: "Xem nhanh báo cáo tổng hợp để gửi CEO". Requirement cứu cánh: "Hệ thống tự động gửi báo cáo thống kê qua email vào 8g sáng thứ Hai hàng tuần".',
      exercise: 'Chuyển đổi phát biểu sau của khách hàng thành Problem - Need - Requirement: "Tôi muốn ứng dụng có chatbox cài AI ChatGPT ở góc màn hình để hỗ trợ khách hàng mua sắm nhanh hơn".',
      realProjectApplication: 'Lọc ra 3 yêu cầu chức năng mới nhất từ khách hàng của dự án bạn đang làm, bóc tách xem khách hàng đang nói Solution hay thực sự truyền tải Problem.',
      expectedOutput: 'Bảng phân tích 3 cột chi tiết bóc tách Problem -> Need -> Requirement tương ứng giải pháp gợi ý.',
      checklist: [
        'Tôi phân biệt được rạch ròi giữa Nhu cầu (Need) và Giải pháp (Solution).',
        'Tôi nắm được kỹ thuật đặt câu hỏi "Tại sao" để tìm về Problem gốc rễ.',
        'Tôi biết cách viết một câu Requirement trung lập không lồng ghép giải pháp giao diện.'
      ]
    },
    {
      stageOrder: 3, // Khai thác và làm rõ yêu cầu
      title: 'Bộ câu hỏi khai thác yêu cầu',
      order: 1,
      objective: 'Thiết lập bộ khung câu hỏi chất vấn thông minh (Elicitation Questions) áp dụng cho mọi buổi phỏng vấn Stakeholder.',
      theory: 'Khai thác yêu cầu không chỉ là lắng nghe mà còn hướng dẫn khách hàng tư duy. Sử dụng mô hình câu hỏi mở (Who, What, Why, How, When, Where) kết hợp với kỹ thuật đặt giả thuyết biên (Edge Cases). Tránh các câu hỏi đóng dẫn dắt dạng "Anh có muốn hệ thống tự động gửi mail không?".',
      example: 'Thay vì hỏi "Hệ thống phân quyền thế nào?", BA chuyên sâu hỏi: "Ai là người trực tiếp duyệt hóa đơn này? Nếu họ đi vắng thì ai có quyền duyệt thay? Có giới hạn số tiền tối đa cho mỗi cấp duyệt không?".',
      exercise: 'Xây dựng bộ 10 câu hỏi phỏng vấn chuẩn bị cho buổi họp tìm hiểu quy trình thanh toán trực tuyến của một website thương mại điện tử mới.',
      realProjectApplication: 'Chuẩn bị kịch bản cuộc họp (Agenda) và checklist câu hỏi cho buổi workshop hoặc meeting sắp tới với khách hàng.',
      expectedOutput: 'Tài liệu Elicitation Questionnaire gồm ít nhất 3 nhóm: Hiện trạng (As-is), Kỳ vọng (To-be), Ràng buộc (Constraints).',
      checklist: [
        'Tôi đã chuẩn bị được bộ câu hỏi có tính bao quát từ nghiệp vụ đến kỹ thuật.',
        'Tôi tránh được các câu hỏi đóng gây định kiến cho khách hàng.',
        'Tôi biết cách phân loại các câu hỏi áp dụng cho người dùng cuối (User) và người quản lý (Manager).'
      ]
    },
    {
      stageOrder: 4, // Viết requirement và tài liệu
      title: 'Cấu trúc một chức năng SRS',
      order: 1,
      objective: 'Nắm vững cấu trúc chuẩn mực khi mô tả chi tiết một tính năng/chức năng phần mềm trong tài liệu SRS (Software Requirement Specification).',
      theory: 'Một chức năng đặc tả chi tiết trong SRS thường bao gồm các phần:\n1. Tên tính năng & Mã định danh (ID).\n2. Mô tả tổng quan ngắn (Description).\n3. Tác nhân kích hoạt (Actor).\n4. Điều kiện tiên quyết (Pre-condition).\n5. Luồng xử lý chính (Main Flow/Normal Flow).\n6. Các luồng rẽ nhánh/thất bại (Alternative Flows & Exception Flows).\n7. Điều kiện sau khi thực hiện (Post-condition).\n8. Các Business Rules / Ràng buộc kỹ thuật liên quan.',
      example: 'Đặc tả chức năng "Đăng nhập": Luồng chính nhập đúng mật khẩu thì chuyển vào Home. Luồng rẽ nhánh: Sai mật khẩu dưới 5 lần hiển thị thông báo lỗi. Luồng exception: Sai quá 5 lần thì khóa tài khoản tạm thời 15 phút.',
      exercise: 'Hãy viết tài liệu đặc tả SRS đầy đủ luồng chính, luồng rẽ nhánh và exception cho tính năng "Đổi mật khẩu" của người dùng.',
      realProjectApplication: 'Soạn thảo trực tiếp một chương tài liệu chứa đặc tả chức năng sắp được bàn giao cho đội phát triển của bạn.',
      expectedOutput: 'Bản đặc tả chức năng dạng Word hoặc Markdown có chi tiết cấu trúc 8 mục chuẩn.',
      checklist: [
        'Tôi đã viết đầy đủ các luồng ngoại lệ (Exceptions) cho tính năng.',
        'Tôi đã xác định rõ ràng tác nhân (Actor) và các điều kiện kích hoạt hệ thống.',
        'Tôi mô tả các bước hành động một cách khách quan, rõ ràng, không tối nghĩa.'
      ]
    },
    {
      stageOrder: 4, // Viết requirement và tài liệu
      title: 'Business Rule và Validation Rule',
      order: 2,
      objective: 'Phân biệt chính xác Luật nghiệp vụ (Business Rule) mang tính chất sống còn của doanh nghiệp với Quy tắc kiểm tra tính hợp lệ dữ liệu nhập (Validation Rule).',
      theory: '- Business Rule: Quy định, chính sách hoạt động của doanh nghiệp tồn tại độc lập có hoặc không có phần mềm. Ví dụ: "Thẻ thành viên thẻ Vàng được giảm giá 10%".\n- Validation Rule: Quy định mang tính kỹ thuật của hệ thống để nhập liệu chuẩn xác. Ví dụ: "Trường Email phải chứa ký tự @", "Mật khẩu có tối thiểu 8 ký tự".\nBA cần tách riêng Business Rules để dễ cập nhật khi chính sách doanh nghiệp thay đổi không ảnh hưởng đến cấu trúc code cốt lõi.',
      example: 'Tại công ty Tiki, Business Rule là "Đơn giao hỏa tốc chỉ áp dụng trong phạm vi TP.HCM và Hà Nội". Validation Rule là "Trường Số điện thoại nhận hàng bắt buộc phải là số và dài đúng 10 chữ số".',
      exercise: 'Hãy phân loại 5 quy định sau thành Business Rule hoặc Validation Rule: 1. Tuổi khách hàng phải từ 18; 2. Hệ thống bắt buộc nhập họ tên; 3. Khách quen được nợ tối đa 5 triệu đồng; 4. Số tài khoản ngân hàng không chứa chữ cái; 5. Mỗi khách hàng chỉ có duy nhất 1 mã định danh.',
      realProjectApplication: 'Liệt kê danh sách các Business Rules trong dự án bạn đang làm việc để quản lý tập trung thay vì viết rải rác trong các chức năng.',
      expectedOutput: 'Tài liệu Business Rule Matrix (Bảng ma trận luật nghiệp vụ) quản lý tập trung cho dự án.',
      checklist: [
        'Tôi nhận diện được đâu là chính sách bên ngoài (Business Rule) và đâu là ràng buộc trên màn hình (Validation Rule).',
        'Tôi biết cách gom nhóm các Business Rules vào một bảng riêng để dễ bảo trì tài liệu.',
        'Tôi viết rõ ràng các điều kiện đúng/sai để lập trình viên áp dụng nghiệp vụ.'
      ]
    },
    {
      stageOrder: 4, // Viết requirement và tài liệu
      title: 'Acceptance Criteria',
      order: 3,
      objective: 'Viết tiêu chí nghiệm thu (Acceptance Criteria - AC) chuẩn mực dùng cho User Story, giúp Developer tự tin lập trình và Tester kiểm thử.',
      theory: 'Acceptance Criteria định nghĩa ranh giới hoạt động của một User Story. Kỹ thuật viết AC phổ biến nhất là Scenario-based ( Given-When-Then):\n- GIVEN: Bối cảnh ban đầu.\n- WHEN: Hành động của người dùng.\n- THEN: Kết quả hệ thống thực thi.\nAC giúp loại bỏ sự không chắc chắn và thiết lập định nghĩa về "Hoàn thành" (Definition of Done).',
      example: 'Story: Là khách mua hàng, tôi muốn áp dụng mã coupon giảm giá để tiết kiệm chi phí.\nAC Scenario: Áp dụng mã giảm giá thành công\n- GIVEN khách hàng đã chọn sản phẩm trị giá 500k vào giỏ hàng\n- WHEN người dùng nhập mã "GIAM50" và nhấn áp dụng\n- THEN hệ thống hiển thị thông tin giảm 50k đồng thời cập nhật tổng tiền thanh toán còn 450k.',
      exercise: 'Hãy viết 2 kịch bản AC dưới dạng Given-When-Then cho tính năng rút tiền tại ATM (Thành công và Thất bại do không đủ số dư).',
      realProjectApplication: 'Viết Acceptance Criteria cho một User Story cụ thể trong Sprint Backlog dự án hiện tại của bạn.',
      expectedOutput: 'Danh sách ít nhất 3 kịch bản Acceptance Criteria dạng Given-When-Then cho câu chuyện người dùng đã chọn.',
      checklist: [
        'Tôi áp dụng trôi chảy công thức Given-When-Then.',
        'Kịch bản của tôi bao trùm cả trường hợp thành công (Sunny day) và thất bại (Rainy day).',
        'Acceptance Criteria của tôi có thể kiểm thử trực quan được.'
      ]
    },
    {
      stageOrder: 5, // Mô hình hóa nghiệp vụ
      title: 'BPMN cơ bản',
      order: 1,
      objective: 'Sử dụng chuẩn BPMN (Business Process Model and Notation) để biểu diễn dòng chảy nghiệp vụ từ đầu đến cuối một cách chuyên nghiệp.',
      theory: 'BPMN là chuẩn mô tả quy trình nghiệp vụ bằng sơ đồ trực quan. Các ký hiệu cốt lõi gồm:\n1. Pool & Lane: Đại diện cho Tổ chức (Pool) và Vai trò/Phòng ban xử lý (Lane).\n2. Tasks (Hình chữ nhật bo góc): Công việc cụ thể cần làm.\n3. Gateways (Hình thoi): Điểm rẽ nhánh điều kiện (Exclusive X, Parallel +, Inclusive O).\n4. Events (Hình tròn): Điểm bắt đầu (Start), kết thúc (End), hoặc trung gian (Intermediate).',
      example: 'Trong quy trình "Đặt món ăn trên ShopeeFood", Pool là ShopeeFood, các Lanes gồm: Khách hàng, Nhà hàng, Shipper. Quá trình bắt đầu từ khách chọn món -> Nhà hàng chuẩn bị (Task) -> Shipper giao hàng -> Kết thúc khi khách nhận món thành công.',
      exercise: 'Vẽ quy trình BPMN đơn giản mô tả quy trình duyệt đơn xin nghỉ phép của nhân viên trong công ty (Nhân viên -> Trưởng phòng duyệt -> Nhân sự lưu hồ sơ). Hãy xác định rõ các Swimlanes và Gateways tương ứng.',
      realProjectApplication: 'Khảo sát và vẽ lại quy trình nghiệp vụ thực tế (mức As-Is) cho một phòng ban nghiệp vụ mà phần mềm của bạn đang nhắm tới phục vụ.',
      expectedOutput: 'Tệp sơ đồ quy trình nghiệp vụ xuất dạng PDF/PNG vẽ từ công cụ như Camunda, draw.io hoặc Bizagi.',
      checklist: [
        'Tôi đã nắm được ý nghĩa của Pools và Lanes.',
        'Tôi biết cách dùng cổng rẽ nhánh Exclusive (X) và Parallel (+) hợp lý.',
        'Sơ đồ nghiệp vụ của tôi có một điểm bắt đầu rõ ràng và các điểm kết thúc logic.'
      ]
    }
  ];

  for (const item of lessonsData) {
    const s = stagesMap.get(item.stageOrder);
    if (!s) {
      console.warn(`No stage found with order ${item.stageOrder} for lesson ${item.title}`);
      continue;
    }

    const existingLesson = await prisma.lesson.findFirst({
      where: {
        stageId: s.id,
        title: item.title,
      }
    });

    if (existingLesson) {
      console.log(`Lesson already exists, skipped: ${item.title}`);
    } else {
      // Create new lesson
      const l = await prisma.lesson.create({
        data: {
          stageId: s.id,
          title: item.title,
          order: item.order,
          objective: item.objective,
          theory: item.theory,
          example: item.example,
          exercise: item.exercise,
          realProjectApplication: item.realProjectApplication,
          expectedOutput: item.expectedOutput,
          status: 'NOT_STARTED',
          personalNote: '',
        },
      });

      console.log(`Created lesson: ${item.title}`);

      // Create checklist items if it is newly created
      for (let cIdx = 0; cIdx < item.checklist.length; cIdx++) {
        await prisma.checklistItem.create({
          data: {
            lessonId: l.id,
            content: item.checklist[cIdx],
            isChecked: false,
            order: cIdx + 1,
          }
        });
      }
    }
  }

  console.log('Safe seed completed. No user data was deleted.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
