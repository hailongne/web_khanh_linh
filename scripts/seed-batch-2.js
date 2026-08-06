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

const newBatchArticles = [
  // 1. Featured Articles (4-5 bài nổi bật)
  {
    title: "Kinh nghiệm thuê xe 16 chỗ từ Hà Nội đi các tỉnh miền Bắc tiết kiệm nhất",
    category: "Thuê xe",
    tags: ["Thuê xe 16 chỗ", "Ford Transit", "Hyundai Solati", "Du lịch miền Bắc"],
    readingTime: "8 phút đọc",
    viewCount: 2480,
    featured: true,
    pinned: true,
    publishedAt: "2026-08-06T08:00:00.000Z",
    focusKeyword: "thuê xe 16 chỗ Hà Nội",
    metaTitle: "Kinh nghiệm thuê xe 16 chỗ Hà Nội đi tỉnh giá rẻ uy tín",
    metaDescription: "Bí quyết đặt xe 16 chỗ Ford Transit, Hyundai Solati chất lượng cao, tài xế kinh nghiệm đèo dốc và cách chốt hợp đồng thuê xe trọn gói.",
    excerpt: "Thuê xe 16 chỗ là giải pháp di chuyển phổ biến hàng đầu cho các đoàn gia đình, công ty. Khám phá ngay bảng giá và kinh nghiệm chốt xe chuẩn nhất.",
    type: "multi_image"
  },
  {
    title: "Top 7 cung đường phượt và du lịch đẹp nhất miền Bắc mùa thu đông",
    category: "Điểm đến",
    tags: ["Du lịch miền Bắc", "Cung đường đẹp", "Mộc Châu", "Hà Giang"],
    readingTime: "10 phút đọc",
    viewCount: 1950,
    featured: true,
    pinned: true,
    publishedAt: "2026-08-05T14:20:00.000Z",
    focusKeyword: "cung đường đẹp miền Bắc",
    metaTitle: "Top 7 cung đường du lịch miền Bắc đẹp ngỡ ngàng",
    metaDescription: "Tổng hợp các tuyến đường du lịch tuyệt đẹp từ Hà Nội đi Hà Giang, Mộc Châu, Sa Pa, Y Tý với cảnh sắc núi rừng hùng vĩ.",
    excerpt: "Miền Bắc sở hữu những cung đường đèo hùng vĩ cùng thảm thực vật thay đổi theo mùa. Cùng Khánh Linh Trans điểm qua 7 hành trình ấn tượng nhất.",
    type: "review"
  },
  {
    title: "Kinh nghiệm thuê xe xe cưới hỏi cao cấp: 5 Lưu ý vàng cho ngày trọng đại",
    category: "Thuê xe",
    tags: ["Thuê xe cưới", "Xe cô dâu", "Xe hoa Hà Nội"],
    readingTime: "6 phút đọc",
    viewCount: 1620,
    featured: true,
    pinned: true,
    publishedAt: "2026-08-04T09:15:00.000Z",
    focusKeyword: "thuê xe cưới hỏi Hà Nội",
    metaTitle: "Mẹo chọn và thuê xe cưới hỏi đẹp sang trọng tại Hà Nội",
    metaDescription: "Kinh nghiệm chọn màu xe hoa, loại xe đưa đón quan khách hai họ và thời gian đặt xe chuẩn để ngày cưới diễn ra suôn sẻ trọn vẹn.",
    excerpt: "Ngày cưới là sự kiện trọng đại cả đời. Lựa chọn đoàn xe đưa đón cô dâu chú rể và quan khách sang trọng, đúng giờ giúp lễ cưới hoàn hảo.",
    type: "text_only"
  },
  {
    title: "Review chi tiết tour du lịch Hạ Long 2 ngày 1 đêm bằng xe du lịch 29 chỗ",
    category: "Điểm đến",
    tags: ["Hạ Long", "Tour 2 ngày 1 đêm", "Thuê xe 29 chỗ"],
    readingTime: "9 phút đọc",
    viewCount: 2100,
    featured: true,
    pinned: true,
    publishedAt: "2026-08-03T11:00:00.000Z",
    focusKeyword: "tour Hạ Long 2 ngày 1 đêm",
    metaTitle: "Review lịch trình du lịch Hạ Long 2 ngày 1 đêm trọn gói",
    metaDescription: "Hướng dẫn di chuyển đường cao tốc Hà Nội - Hải Phòng - Hạ Long bằng xe 29 chỗ đời mới, thăm vịnh Hạ Long và thưởng thức hải sản tươi ngon.",
    excerpt: "Vịnh Hạ Long luôn là kỳ quan thu hút du khách trong và ngoài nước. Lịch trình 2 ngày 1 đêm bằng xe ô tô du lịch chất lượng cao dành cho đoàn.",
    type: "review"
  },
  {
    title: "Nên thuê xe tự lái hay thuê xe có tài xế riêng cho hành trình xa?",
    category: "Thuê xe",
    tags: ["Thuê xe có lái", "Thuê xe tự lái", "Tư vấn du lịch"],
    readingTime: "7 phút đọc",
    viewCount: 1450,
    featured: true,
    pinned: false,
    publishedAt: "2026-08-02T15:40:00.000Z",
    focusKeyword: "thuê xe tự lái hay có lái",
    metaTitle: "So sánh thuê xe tự lái và thuê xe có lái chuyên nghiệp",
    metaDescription: "Phân tích bài toán chi phí, độ an toàn và sự thoải mái giữa dịch vụ tự lái và thuê xe có tài xế riêng kinh nghiệm đưa đón.",
    excerpt: "Nhiều du khách băn khoăn giữa tự cầm lái hay giao vô-lăng cho bác tài chuyên nghiệp. Cùng phân tích chi tiết ưu nhược điểm của từng hình thức.",
    type: "text_only"
  },

  // Các bài viết tiêu chuẩn tiếp theo
  {
    title: "Kinh nghiệm du lịch Mộc Châu mùa hoa cải và mùa hái dâu tây",
    category: "Kinh nghiệm du lịch",
    tags: ["Du lịch Mộc Châu", "Mùa hoa cải", "Dâu tây Mộc Châu"],
    readingTime: "6 phút đọc",
    viewCount: 1180,
    featured: false,
    pinned: false,
    publishedAt: "2026-07-25T10:30:00.000Z",
    focusKeyword: "du lịch Mộc Châu mùa nào đẹp",
    metaTitle: "Cẩm nang du lịch Mộc Châu các mùa trong năm tự túc",
    metaDescription: "Thời điểm lý tưởng đi Mộc Châu ngắm hoa đồi chè, đồi hoa cải trắng và thưởng thức đặc sản sữa tươi, bê chao nổi tiếng.",
    excerpt: "Mộc Châu quanh năm mát mẻ với những đồi chè xanh ngút ngàn và thiên đường hoa cải trắng. Khám phá ngay lịch trình di chuyển thuận tiện nhất.",
    type: "multi_image"
  },
  {
    title: "Checklist 10 vật dụng luôn nên trang bị sẵn trên xe ô tô cá nhân",
    category: "Xe cộ",
    tags: ["Phụ kiện ô tô", "Checklist xe", "An toàn giao thông"],
    readingTime: "5 phút đọc",
    viewCount: 890,
    featured: false,
    pinned: false,
    publishedAt: "2026-07-20T08:15:00.000Z",
    focusKeyword: "vật dụng nên có trên ô tô",
    metaTitle: "10 Vật dụng an toàn bắt buộc nên trang bị trên xe ô tô",
    metaDescription: "Bộ kích bình acquy, bơm lốp điện tử, bộ cấp cứu y tế, búa phá kính... giúp bạn xử lý mọi sự cố bất ngờ trên đường xa.",
    excerpt: "Trang bị đầy đủ các vật dụng cứu hộ khẩn cấp trên ô tô giúp chủ xe chủ động xử lý các tình huống hỏng hóc hoặc sự cố thời tiết xấu.",
    type: "checklist"
  },
  {
    title: "Checklist chuẩn bị cho chuyến du lịch gia đình có người già và trẻ nhỏ",
    category: "Cẩm nang",
    tags: ["Du lịch gia đình", "Checklist du lịch", "Kinh nghiệm gia đình"],
    readingTime: "6 phút đọc",
    viewCount: 1320,
    featured: false,
    pinned: false,
    publishedAt: "2026-07-15T13:45:00.000Z",
    focusKeyword: "checklist du lịch gia đình",
    metaTitle: "Checklist du lịch gia đình có người già và trẻ em chu đáo",
    metaDescription: "Bí quyết chọn xe du lịch êm ái, xếp hành lý thông minh và chuẩn bị thực phẩm, thuốc men an toàn cho người thân.",
    excerpt: "Chuyến du lịch đa thế hệ đòi hỏi sự chuẩn bị kỹ lưỡng về chỗ ngồi trên xe, lộ trình nghỉ ngơi giữa chặng và đồ dùng cá nhân cho trẻ em.",
    type: "checklist"
  },
  {
    title: "Những sai lầm nghiêm trọng cần tránh khi đặt thuê xe du lịch mùa cao điểm",
    category: "Thuê xe",
    tags: ["Sai lầm thuê xe", "Thuê xe lễ tết", "Cảnh báo thuê xe"],
    readingTime: "5 phút đọc",
    viewCount: 970,
    featured: false,
    pinned: false,
    publishedAt: "2026-07-10T16:20:00.000Z",
    focusKeyword: "sai lầm khi thuê xe du lịch",
    metaTitle: "5 Sai lầm phổ biến khi thuê xe ô tô du lịch mùa cao điểm",
    metaDescription: "Cảnh báo chiêu trò ép giá, xe cũ kém chất lượng và bỏ qua điều khoản hủy đặt xe trong các dịp nghỉ lễ 30/4, 2/9 và Tết.",
    excerpt: "Đặt xe quá sát ngày đi hoặc ham giá rẻ bất thường là nguyên nhân hàng đầu khiến nhiều du khách gặp sự cố vỡ lịch trình nghỉ dưỡng.",
    type: "text_only"
  },
  {
    title: "Top 5 điểm check-in sống ảo cực hot quanh khu vực ngoại thành Hà Nội",
    category: "Điểm đến",
    tags: ["Check in Hà Nội", "Địa điểm hot", "Sống ảo ngoại thành"],
    readingTime: "7 phút đọc",
    viewCount: 1760,
    featured: false,
    pinned: false,
    publishedAt: "2026-07-01T09:00:00.000Z",
    focusKeyword: "điểm check in gần Hà Nội",
    metaTitle: "Top 5 điểm check-in ngoại thành Hà Nội đẹp siêu lòng",
    metaDescription: "Gợi ý làng cổ Đường Lâm, đồi cỏ Ba Vì, làng hoa Quảng Bá, thung lũng hoa Hồ Tây cho bạn trẻ thỏa sức chụp ảnh dã ngoại.",
    excerpt: "Không cần đi đâu xa, ngay vùng ven Hà Nội có vô vàn tọa độ thiên nhiên thoáng đãng tuyệt đẹp phục vụ nhu cầu dã ngoại và chụp ảnh cuối tuần.",
    type: "multi_image"
  }
];

function generateBlocks(article, thumbUrl, imgIdx) {
  const blocks = [];
  
  // Intro H2
  blocks.push({
    id: `h_${Math.random().toString(36).substring(2, 9)}`,
    type: "heading",
    level: 2,
    text: "1. Giới thiệu & Định hướng hành trình"
  });
  
  blocks.push({
    id: `p_${Math.random().toString(36).substring(2, 9)}`,
    type: "paragraph",
    text: `${article.excerpt} Đồng hành cùng Khánh Linh Trans, quý khách luôn được đảm bảo tiêu chuẩn xe chất lượng cao và phong cách phục vụ tận tâm.`
  });

  if (article.type === "text_only") {
    blocks.push({
      id: `h_${Math.random().toString(36).substring(2, 9)}`,
      type: "heading",
      level: 2,
      text: "2. Phân tích kinh nghiệm & Giải pháp tối ưu"
    });
    blocks.push({
      id: `p_${Math.random().toString(36).substring(2, 9)}`,
      type: "paragraph",
      text: "Để tối ưu chi phí và tránh các phát sinh không đáng có, khách hàng nên tìm hiểu kỹ hợp đồng, chính sách cầu đường và chuẩn bị lịch trình rõ ràng trước khi xuất phát."
    });
    blocks.push({
      id: `list_${Math.random().toString(36).substring(2, 9)}`,
      type: "bullet",
      items: [
        "Xác định chính xác số lượng thành viên tham gia để chọn xe 7, 16 hay 29 chỗ.",
        "Trao đổi kỹ với nhà xe về điểm đón trả, chi phí bến bãi và dịch vụ đi kèm.",
        "Ưu tiên nhà xe có đội ngũ tài xế thông thuộc đường xá miền Bắc.",
        "Ký hợp đồng thuê xe minh bạch có điều khoản bảo vệ quyền lợi du khách."
      ]
    });
    blocks.push({
      id: `q_${Math.random().toString(36).substring(2, 9)}`,
      type: "quote",
      text: "Sự an toàn và trải nghiệm thoải mái của du khách luôn là thước đo thành công hàng đầu của Khánh Linh Trans.",
      author: "Khánh Linh Trans Editorial"
    });
  } else if (article.type === "multi_image" || article.type === "review") {
    blocks.push({
      id: `h_${Math.random().toString(36).substring(2, 9)}`,
      type: "heading",
      level: 2,
      text: "2. Trải nghiệm không gian & Cảnh sắc thực tế"
    });
    blocks.push({
      id: `p_${Math.random().toString(36).substring(2, 9)}`,
      type: "paragraph",
      text: "Hành trình di chuyển trên xe ô tô du lịch đời mới mang đến cảm giác êm ái, giúp các thành viên trong đoàn giữ trọn năng lượng khám phá thiên nhiên."
    });
    // Add image 1
    const img1 = images[(imgIdx + 1) % images.length];
    blocks.push({
      id: `img_${Math.random().toString(36).substring(2, 9)}`,
      type: "image",
      src: img1,
      alt: article.title,
      caption: "Hình ảnh xe ô tô du lịch Khánh Linh Trans phục vụ đoàn khách",
      align: "center"
    });
    blocks.push({
      id: `p_${Math.random().toString(36).substring(2, 9)}`,
      type: "paragraph",
      text: "Nội thất xe rộng rãi, máy lạnh hiện đại cùng khoang chứa hành lý lớn đáp ứng trọn vẹn nhu cầu của những chuyến du lịch kéo dài nhiều ngày."
    });
    // Add image 2
    const img2 = images[(imgIdx + 2) % images.length];
    blocks.push({
      id: `img_${Math.random().toString(36).substring(2, 9)}`,
      type: "image",
      src: img2,
      alt: article.title,
      caption: "Đội xe đa dạng chủng loại đáp ứng mọi hành trình",
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
      text: "Dưới đây là các hạng mục quan trọng bạn nên rà soát cẩn thận trước khi lên đường:"
    });
    blocks.push({
      id: `list_${Math.random().toString(36).substring(2, 9)}`,
      type: "bullet",
      items: [
        "✓ Kiểm tra giấy tờ xe, bảo hiểm và căn cước công dân.",
        "✓ Kiểm tra lốp xe dự phòng, con đội và bộ dụng cụ tháo bánh.",
        "✓ Chuẩn bị túi y tế gồm thuốc say xe, băng gạc, thuốc cảm sốt.",
        "✓ Chuẩn bị sạc dự phòng, cáp sạc đa năng cho thiết bị thông minh.",
        "✓ Rà soát lại lộ trình di chuyển và các điểm dừng nghỉ dừng chân.",
        "✓ Đặt hẹn thời gian đón trả chính xác với nhà xe Khánh Linh Trans."
      ]
    });
  }

  // Section CTA
  blocks.push({
    id: `h_${Math.random().toString(36).substring(2, 9)}`,
    type: "heading",
    level: 2,
    text: "3. Đặt xe du lịch Khánh Linh Trans nhanh chóng"
  });
  blocks.push({
    id: `p_${Math.random().toString(36).substring(2, 9)}`,
    type: "paragraph",
    text: "Khánh Linh Trans cung cấp giải pháp cho thuê xe du lịch 4-45 chỗ, xe cưới hỏi, xe đưa đón chuyên gia chất lượng cao. Quý khách vui lòng liên hệ hotline để nhận báo giá ưu đãi nhất!"
  });

  return { vi: blocks, en: [] };
}

function runSeedBatch2() {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  
  newBatchArticles.forEach((art, idx) => {
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
      featured: art.featured,
      pinned: art.pinned,
      recommended: false,
      isTrending: art.featured,
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
  console.log(`Successfully added batch of ${newBatchArticles.length} articles! Total index items: ${index.length}`);
}

runSeedBatch2();
