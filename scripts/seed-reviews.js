const { Pool } = require('pg');

const connectionString = "postgres://postgres.ryfpohhakwpoimxcvvvi:KhanhLinh2026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const sampleReviews = [
  {
    id: "rev-101",
    displayName: "Anh Nguyễn Văn Nam (Giám đốc Nam Việt Tour)",
    rating: 5,
    content: "Đã hợp tác thuê dàn xe 29 chỗ và 45 chỗ của Khánh Linh Trans cho đoàn tour 200 khách đi Hạ Long vừa rồi. Xe rất mới, nội thất sạch sẽ thơm tho, tài xế đúng giờ và cẩn thận từng cung đường. Chắc chắn sẽ tiếp tục đồng hành dài lâu!",
    approved: true,
    createdAt: "2026-08-18T09:30:00.000Z"
  },
  {
    id: "rev-102",
    displayName: "Chị Trần Thị Thanh Hương (Hà Nội)",
    rating: 5,
    content: "Thuê chiếc Kia Carnival trắng phục vụ xe hoa và dâu rể ngày cưới. Xe đẹp long lanh, trang trí hoa tươi chỉn chu. Bác tài ăn mặc lịch sự, tính tình vui vẻ hòa nhã. Gia đình 2 bên ai cũng khen!",
    approved: true,
    createdAt: "2026-08-17T14:15:00.000Z"
  },
  {
    id: "rev-103",
    displayName: "Anh Phạm Quốc Hùng (Cầu Giấy, Hà Nội)",
    rating: 5,
    content: "Đặt xe Camry 4 chỗ đón đối tác nước ngoài từ sân bay Nội Bài về khách sạn JW Marriott. Tài xế đón rất đúng giờ, giơ biển đón chu đáo và lái xe êm ái. Đối tác nước ngoài của mình đánh giá rất cao dịch vụ.",
    approved: true,
    createdAt: "2026-08-16T11:45:00.000Z"
  },
  {
    id: "rev-104",
    displayName: "Chị Nguyễn Mai Phương (Tây Hồ, Hà Nội)",
    rating: 5,
    content: "Thuê xe Limousine 9 chỗ đưa cả gia đình đi chơi Sa Pa 3 ngày 2 đêm. Ghế massage đi đường dài không bị mệt mỏi chút nào, bác tài rành đường núi chèo đèo rất vững tay lái và tận tình hỗ trợ mang vác hành lý.",
    approved: true,
    createdAt: "2026-08-14T16:20:00.000Z"
  },
  {
    id: "rev-105",
    displayName: "Anh Hoàng Đình Vũ (Trưởng phòng HC FPT)",
    rating: 5,
    content: "Dịch vụ thuê xe theo tháng và đi công tác tỉnh cho các chuyên gia của bên mình hoạt động rất chuyên nghiệp. Hợp đồng rõ ràng, xuất hóa đơn VAT đầy đủ, xe luôn được bảo dưỡng định kỳ sạch sẽ.",
    approved: true,
    createdAt: "2026-08-12T08:10:00.000Z"
  },
  {
    id: "rev-106",
    displayName: "Anh Bùi Tiến Dũng (Hoàn Kiếm, Hà Nội)",
    rating: 4,
    content: "Dịch vụ tốt, xe 16 chỗ Solati rộng rãi thoáng mát. Bác tài nhiệt tình hướng dẫn chỗ ăn uống ngon ở Ninh Bình. Giá hợp lý, điểm 9/10, sẽ giới thiệu cho bạn bè.",
    approved: true,
    createdAt: "2026-08-10T19:05:00.000Z"
  },
  {
    id: "rev-107",
    displayName: "Chị Đỗ Thu Thảo (Đống Đa, Hà Nội)",
    rating: 5,
    content: "Đoàn mình 30 người đi Cát Bà thuê xe 35 chỗ Khánh Linh. Giá cả rất cạnh tranh so với mặt bằng chung, xe điều hòa mát rượi, chạy êm. Cảm ơn tư vấn viên nhiệt tình hỗ trợ 24/7!",
    approved: true,
    createdAt: "2026-08-08T13:50:00.000Z"
  },
  {
    id: "rev-108",
    displayName: "Anh Trịnh Kim Long (Thanh Xuân, Hà Nội)",
    rating: 5,
    content: "Tài xế đón khách đúng giờ, lái xe an toàn và điềm tĩnh. Xe đời mới thơm tho không bị mùi xăng xe. Sẽ tiếp tục ủng hộ Khánh Linh Trans trong các chuyến công tác tới.",
    approved: true,
    createdAt: "2026-08-05T10:30:00.000Z"
  },
  {
    id: "rev-109",
    displayName: "Chị Lê Hoàng Yến (Hà Đông, Hà Nội)",
    rating: 4,
    content: "Giá xe khá hợp lý, chất lượng xe tốt. Tài xế vui vẻ, biết chủ động dừng xe cho gia đình có người già nghỉ ngơi giải lao giữa chặng.",
    approved: true,
    createdAt: "2026-08-02T15:40:00.000Z"
  },
  {
    id: "rev-110",
    displayName: "Chị Vũ Thị Bích Ngọc (Nam Từ Liêm, Hà Nội)",
    rating: 5,
    content: "Các anh tư vấn cực kỳ chu đáo, xếp xe 29 chỗ đời mới sạch sẽ cho lớp mình đi chụp ảnh kỷ yếu Ba Vì. Bác tài kiên nhẫn chờ sinh viên chụp ảnh cả ngày. Rất tuyệt vời!",
    approved: true,
    createdAt: "2026-07-28T17:15:00.000Z"
  },
  {
    id: "rev-111",
    displayName: "Anh Ngô Kiến Huy (Bắc Từ Liêm, Hà Nội)",
    rating: 5,
    content: "Xe 7 chỗ Fortuner sạch đẹp, điều hòa mát rượi. Đặt xe gấp trong ngày nhưng bên công ty xử lý rất nhanh chóng và chuyên nghiệp.",
    approved: true,
    createdAt: "2026-07-25T12:00:00.000Z"
  },
  {
    id: "rev-112",
    displayName: "Anh Phạm Hoàng Minh (Chờ duyệt)",
    rating: 5,
    content: "Dịch vụ thuê xe du lịch của Khánh Linh Trans rất uy tín. Gia đình tôi rất hài lòng về chuyến đi Cửa Lò 3 ngày vừa rồi.",
    approved: false,
    createdAt: "2026-08-19T14:00:00.000Z"
  }
];

async function seedReviews() {
  const client = await pool.connect();
  try {
    await client.query(`
      INSERT INTO public.site_settings (key, value, updated_at)
      VALUES ('reviews', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
    `, [JSON.stringify(sampleReviews)]);
    
    console.log("-> Đã nạp 12 bài đánh giá thực tế (4-5 sao) thành công vào Supabase PostgreSQL!");
  } catch (err) {
    console.error("Lỗi khi nạp dữ liệu đánh giá:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedReviews();
