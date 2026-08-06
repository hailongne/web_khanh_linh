import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const INDEX_PATH = path.join(DATA_DIR, "news-index.json");
const NEWS_DIR = path.join(DATA_DIR, "news");

const images = [
  "/uploads/blog/1_1785313522909.jpg",
  "/uploads/blog/2_1785313527390.jpg",
  "/uploads/blog/1_1786003882256.jpg",
  "/uploads/blog/2_1786003882217.jpg",
  "/uploads/blog/3_1786003882179.jpg",
  "/uploads/blog/g_u_kh_nh_linh_1785294925737.jpg"
];

function slugify(str) {
  let slug = str.toLowerCase().trim();
  slug = slug
    .replace(/[àáảãạâầấẩẫậăằắẳẵặ]/g, "a")
    .replace(/[èéẻẽẹêềếểễệ]/g, "e")
    .replace(/[ìíỉĩị]/g, "i")
    .replace(/[òóỏõọôồốổỗộơờớởỡợ]/g, "o")
    .replace(/[ùúủũụưừứửữự]/g, "u")
    .replace(/[ỳýỷỹỵ]/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "bai-viet";
}

const sampleArticles = [
  // 1. Chỉ dùng chữ (Không ảnh trong nội dung)
  {
    title: "Kinh nghiệm thuê xe du lịch Hà Nội chi tiết cho người mới đi lần đầu",
    category: "Thuê xe",
    tags: ["Kinh nghiệm", "Thuê xe Hà Nội", "Du lịch"],
    readingTime: "5 phút đọc",
    viewCount: 842,
    publishedAt: "2026-08-05T09:00:00.000Z",
    focusKeyword: "thuê xe du lịch Hà Nội",
    metaTitle: "Kinh nghiệm thuê xe du lịch Hà Nội chi tiết từ A đến Z",
    metaDescription: "Chia sẻ kinh nghiệm thuê xe du lịch Hà Nội uy tín, hợp đồng rõ ràng, chọn dòng xe phù hợp và các lưu ý giá cả tránh phát sinh chi phí.",
    excerpt: "Thuê xe du lịch tại Hà Nội cho gia đình hoặc doanh nghiệp đòi hỏi sự chuẩn bị kỹ lưỡng về hợp đồng, dòng xe và chi phí. Dưới đây là những lưu ý quan trọng giúp bạn an tâm chuyến đi.",
    type: "text_only"
  },
  {
    title: "Nên thuê xe 16 chỗ hay 29 chỗ cho đoàn khách đông người?",
    category: "Cẩm nang",
    tags: ["Tư vấn chọn xe", "Thuê xe 16 chỗ", "Thuê xe 29 chỗ"],
    readingTime: "3 phút đọc",
    viewCount: 615,
    publishedAt: "2026-08-04T14:30:00.000Z",
    focusKeyword: "thuê xe 16 chỗ hay 29 chỗ",
    metaTitle: "So sánh chọn thuê xe 16 chỗ hay 29 chỗ tối ưu chi phí",
    metaDescription: "Phân tích ưu nhược điểm của xe 16 chỗ Ford Transit, Hyundai Solati và xe 29 chỗ Hyundai County để quý khách dễ dàng lựa chọn.",
    excerpt: "Lựa chọn dòng xe phù hợp với số lượng thành viên trong đoàn vừa giúp đảm bảo không gian di chuyển thoải mái, vừa tối ưu chi phí cho hành trình.",
    type: "text_only"
  },
  {
    title: "Bí quyết chống say xe hiệu quả cho các chuyến du lịch đường dài",
    category: "Cẩm nang",
    tags: ["Sức khỏe du lịch", "Chống say xe", "Mẹo du lịch"],
    readingTime: "3 phút đọc",
    viewCount: 428,
    publishedAt: "2026-08-03T10:15:00.000Z",
    focusKeyword: "mẹo chống say xe du lịch",
    metaTitle: "10 Mẹo chống say xe du lịch đường dài hiệu quả nhất",
    metaDescription: "Tổng hợp các phương pháp tự nhiên và kinh nghiệm thực tế giúp bạn không lo say xe khi di chuyển bằng ô tô hay xe khách du lịch.",
    excerpt: "Cảm giác say xe có thể làm giảm trải nghiệm chuyến du lịch. Áp dụng ngay những mẹo đơn giản dưới đây để giữ sức khỏe tốt trong suốt chặng đường.",
    type: "text_only"
  },

  // 2. Nhiều ảnh (3-5 ảnh xen kẽ nội dung)
  {
    title: "10 địa điểm gần Hà Nội cực đẹp thích hợp đi du lịch cuối tuần",
    category: "Điểm đến",
    tags: ["Địa điểm Hà Nội", "Du lịch cuối tuần", "Phượt miền Bắc"],
    readingTime: "7 phút đọc",
    viewCount: 1250,
    publishedAt: "2026-08-02T16:00:00.000Z",
    focusKeyword: "địa điểm du lịch gần Hà Nội",
    metaTitle: "Top 10 địa điểm du lịch gần Hà Nội đẹp mê ly đi cuối tuần",
    metaDescription: "Gợi ý 10 tọa độ du lịch lý tưởng quanh Hà Nội như Tam Đảo, Ba Vì, Ninh Bình, Hồ Đại Lải... phù hợp cho chuyến đi 1-2 ngày nghỉ ngơi.",
    excerpt: "Những ngày cuối tuần là khoảng thời gian tuyệt vời để tạm gác lại công việc bận rộn và tận hưởng không khí trong lành tại các điểm du lịch quanh Hà Nội.",
    type: "multi_image"
  },
  {
    title: "Cẩm nang du lịch Tam Đảo tự túc trọn gói 2 ngày 1 đêm",
    category: "Kinh nghiệm du lịch",
    tags: ["Tam Đảo", "Cẩm nang du lịch", "Thuê xe Tam Đảo"],
    readingTime: "9 phút đọc",
    viewCount: 934,
    publishedAt: "2026-08-01T08:20:00.000Z",
    focusKeyword: "du lịch Tam Đảo tự túc",
    metaTitle: "Cẩm nang du lịch Tam Đảo tự túc 2 ngày 1 đêm chi tiết",
    metaDescription: "Kinh nghiệm đi Tam Đảo bằng xe ô tô du lịch: ở đâu, ăn gì, chơi gì và những lưu ý lái xe leo đèo an toàn.",
    excerpt: "Tam Đảo được mệnh danh là Đà Lạt thu nhỏ của miền Bắc với thời tiết 4 mùa trong 1 ngày. Khám phá ngay lịch trình ăn chơi tự túc thú vị nhất.",
    type: "multi_image"
  },
  {
    title: "Lịch trình du lịch Ninh Bình 1 ngày trọn vẹn khám phá danh thắng",
    category: "Điểm đến",
    tags: ["Du lịch Ninh Bình", "Tràng An", "Lịch trình 1 ngày"],
    readingTime: "7 phút đọc",
    viewCount: 1105,
    publishedAt: "2026-07-31T11:45:00.000Z",
    focusKeyword: "du lịch Ninh Bình 1 ngày",
    metaTitle: "Lịch trình du lịch Ninh Bình 1 ngày tự túc ngắm cảnh cực chill",
    metaDescription: "Hướng dẫn du lịch Ninh Bình 1 ngày ghé thăm Tràng An, Hang Múa, Chùa Bái Đính và thưởng thức đặc sản thịt dê cơm cháy.",
    excerpt: "Ninh Bình chỉ cách Hà Nội khoảng 90km, là lựa chọn hàng đầu cho các chuyến tham quan 1 ngày với quần thể di sản thiên nhiên thế giới độc đáo.",
    type: "multi_image"
  },
  {
    title: "Quy trình kiểm tra và bảo dưỡng ô tô chuyên nghiệp trước chuyến đi xa",
    category: "Xe cộ",
    tags: ["Bảo dưỡng ô tô", "Kỹ thuật xe", "An toàn giao thông"],
    readingTime: "5 phút đọc",
    viewCount: 780,
    publishedAt: "2026-07-30T15:10:00.000Z",
    focusKeyword: "bảo dưỡng xe trước chuyến đi",
    metaTitle: "Hướng dẫn bảo dưỡng xe ô tô an toàn trước chuyến đi xa",
    metaDescription: "Các bước kiểm tra phanh, lốp xe, dầu động cơ và hệ thống chiếu sáng giúp ô tô hoạt động bền bỉ, an toàn trên mọi nẻo đường.",
    excerpt: "Để có chuyến đi an toàn tuyệt đối, việc kiểm tra kỹ thuật xe ô tô định kỳ và trước mỗi chặng đường xa là nguyên tắc bắt buộc của các bác tài.",
    type: "multi_image"
  },

  // 3. Dạng Checklist (nhiều bullet checklist ✓)
  {
    title: "Checklist 15 vật dụng không thể thiếu cho chuyến du lịch dài ngày",
    category: "Cẩm nang",
    tags: ["Checklist đồ du lịch", "Chuẩn bị hành lý", "Mẹo du lịch"],
    readingTime: "5 phút đọc",
    viewCount: 520,
    publishedAt: "2026-07-28T09:30:00.000Z",
    focusKeyword: "checklist vật dụng du lịch",
    metaTitle: "Checklist 15 món đồ cần chuẩn bị trước chuyến đi xa",
    metaDescription: "Danh sách đầy đủ các vật dụng thiết yếu như giấy tờ, đồ y tế, phụ kiện điện tử giúp chuyến đi của bạn luôn chu đáo và trọn vẹn.",
    excerpt: "Quên đồ dùng quan trọng có thể ảnh hưởng lớn tới tâm lý chuyến đi. Tham khảo ngay checklist khoa học dưới đây để xếp hành lý nhanh chóng.",
    type: "checklist"
  },
  {
    title: "Những lỗi phổ biến cần tránh khi làm hợp đồng thuê xe ô tô",
    category: "Thuê xe",
    tags: ["Hợp đồng thuê xe", "Lưu ý hợp đồng", "Kinh nghiệm thuê xe"],
    readingTime: "5 phút đọc",
    viewCount: 690,
    publishedAt: "2026-07-27T13:20:00.000Z",
    focusKeyword: "lỗi hợp đồng thuê xe",
    metaTitle: "5 Lỗi cần tránh khi làm hợp đồng thuê xe ô tô du lịch",
    metaDescription: "Giải đáp các điều khoản phát sinh chi phí, bảo hiểm, thời gian trả xe và trách nhiệm nhà xe giúp bạn ký hợp đồng thuê xe an toàn.",
    excerpt: "Ký hợp đồng thuê xe là bước quan trọng bảo vệ quyền lợi hai bên. Đọc kỹ các lưu ý pháp lý và kỹ thuật này để không vướng tranh chấp.",
    type: "checklist"
  },
  {
    title: "Checklist an toàn dành riêng cho tài xế trước khi khởi hành tour",
    category: "Xe cộ",
    tags: ["An toàn lái xe", "Kinh nghiệm tài xế", "Vận tải hành khách"],
    readingTime: "5 phút đọc",
    viewCount: 885,
    publishedAt: "2026-07-26T07:45:00.000Z",
    focusKeyword: "checklist an toàn lái xe tour",
    metaTitle: "Checklist an toàn 10 bước dành cho tài xế xe tour đường dài",
    metaDescription: "Quy trình kiểm tra xe, hành lý và tâm lý lái xe chuyên nghiệp giúp chuyến vận tải khách an toàn 100%.",
    excerpt: "Sự an toàn của toàn bộ hành khách phụ thuộc vào tinh thần trách nhiệm và quy trình chuẩn bị chu đáo của bác tài trước giờ xuất phát.",
    type: "checklist"
  }
];

function generateBlocks(article, thumbUrl, imgIdx) {
  const blocks = [];
  
  // Intro H2
  blocks.push({
    id: `h_${Math.random().toString(36).substring(2, 9)}`,
    type: "heading",
    level: 2,
    text: "1. Tổng quan & Tầm quan trọng"
  });
  
  blocks.push({
    id: `p_${Math.random().toString(36).substring(2, 9)}`,
    type: "paragraph",
    text: `${article.excerpt} Lựa chọn đơn vị đồng hành uy tín như Khánh Linh Trans giúp bạn an tâm tuyệt đối trên từng cung đường.`
  });

  if (article.type === "text_only") {
    blocks.push({
      id: `h_${Math.random().toString(36).substring(2, 9)}`,
      type: "heading",
      level: 2,
      text: "2. Chi tiết các kinh nghiệm cốt lõi"
    });
    blocks.push({
      id: `p_${Math.random().toString(36).substring(2, 9)}`,
      type: "paragraph",
      text: "Việc nắm rõ các nguyên tắc an toàn, thời gian di chuyển và chọn dòng xe phù hợp sẽ giúp giảm thiểu rủi ro và tăng tính thoải mái cho toàn bộ hành khách."
    });
    blocks.push({
      id: `list_${Math.random().toString(36).substring(2, 9)}`,
      type: "bullet",
      items: [
        "Lựa chọn thời điểm xuất phát tránh giờ cao điểm ô nhiễm.",
        "Liên hệ nhà xe đặt trước từ 3-5 ngày đối với dịp nghỉ lễ.",
        "Yêu cầu thống nhất hợp đồng minh bạch về phụ phí phát sinh.",
        "Đảm bảo tài xế có đầy đủ bằng lái và kinh nghiệm đường đèo dốc."
      ]
    });
    blocks.push({
      id: `q_${Math.random().toString(36).substring(2, 9)}`,
      type: "quote",
      text: "Một chuyến đi trọn vẹn bắt đầu từ sự chuẩn bị kỹ lưỡng và một đối tác vận chuyển tận tâm.",
      author: "Khánh Linh Trans Editorial"
    });
  } else if (article.type === "multi_image") {
    blocks.push({
      id: `h_${Math.random().toString(36).substring(2, 9)}`,
      type: "heading",
      level: 2,
      text: "2. Khám phá những trải nghiệm ấn tượng"
    });
    blocks.push({
      id: `p_${Math.random().toString(36).substring(2, 9)}`,
      type: "paragraph",
      text: "Cảnh quan thiên nhiên tươi đẹp cùng cơ sở hạ tầng giao thông thuận tiện tạo điều kiện lý tưởng cho các chuyến tham quan di chuyển bằng xe ô tô."
    });
    // Add image 1
    const img1 = images[(imgIdx + 1) % images.length];
    blocks.push({
      id: `img_${Math.random().toString(36).substring(2, 9)}`,
      type: "image",
      src: img1,
      alt: article.title,
      caption: "Hình ảnh thực tế trong chuyến hành trình du lịch cùng Khánh Linh Trans",
      align: "center"
    });
    blocks.push({
      id: `p_${Math.random().toString(36).substring(2, 9)}`,
      type: "paragraph",
      text: "Khách hàng luôn đánh giá cao sự êm ái của dòng xe đời mới và sự niềm nở, chu đáo của đội ngũ bác tài."
    });
    // Add image 2
    const img2 = images[(imgIdx + 2) % images.length];
    blocks.push({
      id: `img_${Math.random().toString(36).substring(2, 9)}`,
      type: "image",
      src: img2,
      alt: article.title,
      caption: "Đội xe hiện đại phục vụ di chuyển an toàn",
      align: "center"
    });
  } else if (article.type === "checklist") {
    blocks.push({
      id: `h_${Math.random().toString(36).substring(2, 9)}`,
      type: "heading",
      level: 2,
      text: "2. Danh sách kiểm tra chi tiết (Checklist)"
    });
    blocks.push({
      id: `p_${Math.random().toString(36).substring(2, 9)}`,
      type: "paragraph",
      text: "Hãy tích chọn từng mục dưới đây trước khi khởi hành để đảm bảo không bỏ sót bất kỳ yếu tố quan trọng nào:"
    });
    blocks.push({
      id: `list_${Math.random().toString(36).substring(2, 9)}`,
      type: "bullet",
      items: [
        "✓ Kiểm tra giấy tờ tùy thân (CCCD, Bằng lái xe, Đăng ký xe).",
        "✓ Chuẩn bị thuốc cá nhân và hộp y tế du lịch cơ bản.",
        "✓ Sạc đầy pin điện thoại, thiết bị dẫn đường & mang pin dự phòng.",
        "✓ Chuẩn bị nước uống đóng chai và đồ ăn nhẹ trên xe.",
        "✓ Kiểm tra áp suất lốp, dầu máy và nước làm mát ô tô.",
        "✓ Xác nhận lại thời gian và điểm đón với nhà xe Khánh Linh Trans."
      ]
    });
  }

  // Section CTA
  blocks.push({
    id: `h_${Math.random().toString(36).substring(2, 9)}`,
    type: "heading",
    level: 2,
    text: "3. Liên hệ đặt xe du lịch uy tín"
  });
  blocks.push({
    id: `p_${Math.random().toString(36).substring(2, 9)}`,
    type: "paragraph",
    text: "Khánh Linh Trans tự hào mang đến dịch vụ cho thuê xe du lịch từ 4 đến 45 chỗ chuyên nghiệp, uy tín hàng đầu. Quý khách có nhu cầu tư vấn báo giá vui lòng liên hệ hotline để nhận nhiều ưu đãi hấp dẫn!"
  });

  return { vi: blocks, en: [] };
}

function runSeed() {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  
  sampleArticles.forEach((art, idx) => {
    const slug = slugify(art.title);
    const id = `news_${Date.now() + idx}_${Math.floor(Math.random() * 1000)}`;
    const thumb = images[idx % images.length];

    const indexItem = {
      id,
      slug,
      title: { vi: art.title, en: "" },
      excerpt: { vi: art.excerpt, en: "" },
      thumbnail: thumb,
      category: art.category,
      subCategory: "",
      tags: art.tags,
      status: "published",
      scheduledAt: "",
      featured: idx === 0 || idx === 3,
      pinned: false,
      recommended: false,
      isTrending: false,
      viewCount: art.viewCount,
      readingTime: art.readingTime,
      author: {
        name: "Khánh Linh Trans Editorial",
        role: "Ban Biên Tập"
      },
      publishedAt: art.publishedAt,
      createdAt: art.publishedAt,
      updatedAt: art.publishedAt,
      lastUpdatedBy: "Admin",
      seo: {
        metaTitle: { vi: art.metaTitle, en: "" },
        metaDescription: { vi: art.metaDescription, en: "" },
        focusKeyword: art.focusKeyword,
        canonicalUrl: "",
        robots: "index, follow",
        ogImage: thumb,
        twitterCard: "summary_large_image",
        featuredImageAlt: art.title,
        imageCaption: "",
        faqSchema: false,
        breadcrumbSchema: true,
        jsonLdSchema: true
      },
      authorId: "acc_001"
    };

    index.push(indexItem);

    // Detail file
    const detailData = {
      slug,
      blocks: generateBlocks(art, thumb, idx),
      seo: indexItem.seo,
      createdAt: art.publishedAt,
      updatedAt: art.publishedAt
    };

    fs.writeFileSync(path.join(NEWS_DIR, `${slug}.json`), JSON.stringify(detailData, null, 2), "utf-8");
  });

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), "utf-8");
  console.log(`Successfully added ${sampleArticles.length} articles.`);
}

runSeed();
