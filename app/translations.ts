export const translations: Record<string, any> = {
  vi: {
    header: {
      brand: "Khánh Linh Trans",
      links: [
        { label: "Trang chủ", href: "#top", active: true },
        { label: "Đội xe", href: "#fleet" },
        { label: "Bảng giá", href: "#pricing" },
        { label: "Liên hệ", href: "#sales" },
        { label: "Vé máy bay", href: "https://klfly.com" }
      ],
      cta: "Đặt xe ngay",
      menuOpenLabel: "Mở menu điều hướng",
      menuCloseLabel: "Đóng menu điều hướng"
    },

    hero: {
      title: "Dịch Vụ Cho Thuê Xe Du Lịch & Tự Lái Uy Tín Hàng Đầu",
      description:
        "Trải nghiệm hành trình trọn vẹn với dàn xe đời mới, tài xế chuyên nghiệp và quy trình điều phối chỉn chu cho khách doanh nghiệp, gia đình và khách đoàn.",
      imageAlt: "Đội xe Khánh Linh Trans",
      primaryCta: "Khám Phá Đội Xe",
      secondaryCta: "Nhận Báo Giá Nhanh"
    },

    consultCard: {
      title: "Tư Vấn Miễn Phí",
      role: "Mr. Dũng - Giám đốc điều hành",
      hotlineLabel: "Hotline:",
      chatZalo: "Chat Zalo Ngay",
      note: "Hỗ trợ 24/7. Phản hồi trong vòng 5 phút."
    },

    fleet: {
      heading: "DÒNG XE ĐA DẠNG",
      intro: "Đáp ứng linh hoạt cho mọi nhu cầu di chuyển",
      loading: "Đang tải...",
      empty: "Không có xe phù hợp",
      priceFromLabel: "Giá từ",
      bookCta: "Đặt Ngay",
      categories: [
        { id: "all", label: "Tất cả" },
        { id: "4-7", label: "4-7 chỗ" },
        { id: "16", label: "16 chỗ" },
        { id: "29", label: "29 chỗ" },
        { id: "45", label: "45 chỗ" }
      ],
      filtersAriaLabel: "Danh mục xe",
      items: []
    },

    reasons: {
      heading: "Tại Sao Nên Chọn Khánh Linh Trans?",
      lead:
        "Chúng tôi cam kết mang đến trải nghiệm di chuyển an toàn, thoải mái và chuyên nghiệp cho từng chuyến công tác, du lịch hay đưa đón sân bay.",
      items: [
        {
          title: "100% Xe Đời Mới",
          description:
            "Đội xe liên tục được nâng cấp và bảo dưỡng định kỳ, đảm bảo khoang nội thất sạch sẽ, tiện nghi và ổn định trên mọi cung đường.",
          icon: "fleet"
        },
        {
          title: "Tài Xế Chuyên Nghiệp",
          description:
            "Đội ngũ lái xe giàu kinh nghiệm, tác phong chỉn chu, phục vụ lịch sự và luôn chủ động hỗ trợ khách trong suốt hành trình.",
          icon: "driver"
        },
        {
          title: "Giá Minh Bạch",
          description:
            "Báo giá chi tiết theo lịch trình và loại xe, cam kết không phát sinh chi phí mập mờ sau khi đã chốt dịch vụ.",
          icon: "pricing"
        },
        {
          title: "Hỗ Trợ 24/7",
          description:
            "Bộ phận điều phối và chăm sóc khách hàng luôn sẵn sàng tiếp nhận yêu cầu, điều chỉnh lịch và phản hồi nhanh khi cần.",
          icon: "support"
        }
      ]
    },

    booking: {
      heading: "Quy Trình Đặt Xe",
      lead: "Đơn giản, nhanh chóng và chuyên nghiệp chỉ với 4 bước rõ ràng.",
      steps: [
        { title: "1. Chọn Xe", description: "Lựa chọn dòng xe phù hợp với nhu cầu di chuyển và số lượng hành khách.", icon: "choose" },
        { title: "2. Nhận Báo Giá", description: "Nhân viên tư vấn liên hệ xác nhận lộ trình và gửi báo giá chi tiết.", icon: "quote" },
        { title: "3. Ký Hợp Đồng", description: "Thống nhất điều khoản, lịch trình và hoàn tất đặt cọc để giữ xe.", icon: "contract" },
        { title: "4. Khởi Hành", description: "Tài xế đón đúng giờ, hỗ trợ tận nơi và bắt đầu hành trình an toàn.", icon: "departure" }
      ]
    },

    pricing: {
      heading: "Bảng Giá Tham Khảo Nhanh",
      lead: "Giá cước có thể thay đổi tùy theo thời điểm và yêu cầu cụ thể. Vui lòng liên hệ để có báo giá chính xác nhất.",
      table: {
        cols: ["Loại xe", "City Tour (1 ngày)", "Đi tỉnh (từ 100km)", "Sân bay (1 chiều)"]
      },
      note: "* Bảng giá chỉ mang tính chất tham khảo. Đã bao gồm lương lái xe, chi phí cầu đường, xăng xe.",
      rows: [
        { vehicle: "Xe 4 Chỗ", cityTour: "Từ 1.500.000đ", provinceTrip: "Liên hệ", airport: "250.000đ" },
        { vehicle: "Xe 7 Chỗ", cityTour: "Từ 2.500.000đ", provinceTrip: "Liên hệ", airport: "350.000đ" },
        { vehicle: "Xe 16 Chỗ", cityTour: "Từ 3.500.000đ", provinceTrip: "Liên hệ", airport: "500.000đ" },
        { vehicle: "Xe 29 Chỗ", cityTour: "Từ 4.500.000đ", provinceTrip: "Liên hệ", airport: "800.000đ" },
        { vehicle: "Xe 45 Chỗ", cityTour: "Từ 6.000.000đ", provinceTrip: "Liên hệ", airport: "1.500.000đ" }
      ]
    },

    sales: {
      heading: "Đội Ngũ Chuyên Viên Hỗ Trợ",
      lead: "Đội ngũ nhân sự tận tâm luôn túc trực 24/7 để hỗ trợ đặt xe nhanh chóng, báo giá chính xác và đáp ứng mọi yêu cầu đặc biệt.",
      hotlineLabel: "Hotline",
      hotlineTitle: "Liên hệ",
      zaloLabel: "Chat Zalo",
      zaloTitle: "Liên hệ Zalo nhanh",
      zaloAction: "Liên hệ qua Zalo"
    },

    testimonials: {
      heading: "Khách Hàng Nói Gì",
      lead: "Những phản hồi thực tế sau các chuyến công tác, du lịch gia đình và hợp đồng đưa đón dài hạn.",
      scoreLabel: "Trải nghiệm được đánh giá xuất sắc",
      items: [
        {
          quote:
            "Dịch vụ rất chuyên nghiệp, xe mới và sạch sẽ. Bác tài vui tính, hỗ trợ đoàn trong suốt chuyến đi Sapa. Lịch trình thay đổi vẫn được điều phối rất nhanh.",
          name: "Anh Tuấn",
          role: "Giám đốc Công ty TNHH ABC",
          badge: "Chuyến Sapa 3N2Đ",
          tag: "Doanh nghiệp",
          initials: "T"
        },
        {
          quote:
            "Nhà mình đặt xe 16 chỗ đi sân bay và Hạ Long. Tài xế đến đúng giờ, xe thơm sạch, hỗ trợ người lớn tuổi rất chu đáo nên cả nhà yên tâm.",
          name: "Chị Minh Hà",
          role: "Khách gia đình",
          badge: "Đưa đón gia đình",
          tag: "16 chỗ",
          initials: "H"
        },
        {
          quote:
            "Khâu báo giá rõ ràng, hợp đồng nhanh gọn và đội điều phối phản hồi gần như ngay lập tức. Đây là bên hiếm hoi giữ chất lượng ổn định qua nhiều lần đặt.",
          name: "Anh Hoàng Nam",
          role: "Điều hành tour nội địa",
          badge: "Đối tác tour",
          tag: "29 chỗ",
          initials: "N"
        }
      ],
      stats: [
        { value: "4.9/5", label: "điểm hài lòng trung bình từ khách đoàn và khách lẻ" },
        { value: "200+", label: "hợp đồng doanh nghiệp đã phục vụ trong năm" },
        { value: "24/7", label: "điều phối hỗ trợ thay đổi lịch trình khẩn" }
      ]
    },

    faq: {
      heading: "Câu Hỏi Thường Gặp",
      lead: "Giải đáp những thắc mắc phổ biến của khách hàng khi thuê xe.",
      items: [
        {
          question: "Giá thuê xe đã bao gồm các chi phí nào?",
          answer:
            "Chi phí cơ bản thường đã bao gồm xe, tài xế, xăng dầu và phí cầu đường theo lịch trình đã chốt. Các khoản phát sinh như lưu đêm, bến bãi hoặc thay đổi tuyến sẽ được báo lại rõ trước khi xác nhận."
        },
        {
          question: "Chính sách hủy xe và hoàn tiền như thế nào?",
          answer:
            "Lịch hủy và mức hoàn tiền phụ thuộc vào thời điểm thông báo và loại xe đã giữ chỗ. Đội ngũ tư vấn sẽ ghi rõ điều khoản trong báo giá hoặc hợp đồng để khách hàng chủ động trước khi đặt cọc."
        },
        {
          question: "Công ty có xuất hóa đơn VAT không?",
          answer:
            "Có. Khánh Linh Trans hỗ trợ xuất hóa đơn VAT cho khách doanh nghiệp và khách đoàn. Bạn chỉ cần gửi thông tin xuất hóa đơn khi xác nhận booking để bộ phận kế toán xử lý cùng hồ sơ thanh toán."
        }
      ]
    },

    contactCta: {
      heading: "Bạn Cần Thuê Xe Cho Chuyến Đi Sắp Tới?",
      lead: "Hãy liên hệ ngay với chúng tôi để nhận được tư vấn tận tình và báo giá tốt nhất.",
      call: "Gọi Hotline",
      chat: "Chat Zalo"
    },

    footer: {
      brandDescription:
        "Chúng tôi cung cấp dịch vụ vận tải trên toàn quốc, với nhiều sản phẩm dịch vụ cao cấp như Limousine, xe 47 chỗ, xe 30 chỗ.... Mang đến giải pháp di chuyển an toàn, tiện lợi và đẳng cấp.",
      servicesHeading: "DỊCH VỤ",
      supportHeading: "HỖ TRỢ",
      contactHeading: "LIÊN HỆ",
      services: [
        { label: "Cho thuê xe", href: "#fleet" },
        { label: "Đưa đón sân bay", href: "#pricing" },
        { label: "Du lịch doanh nghiệp", href: "#contact-cta-heading" }
      ],
      supportLinks: [
        { label: "Hướng dẫn đặt xe", href: "#faq-heading" },
        { label: "Chính sách bảo mật", href: "#faq-heading" },
        { label: "Điều khoản dịch vụ", href: "#faq-heading" }
      ],
      social: [
        { label: "Tripadvisor", href: "https://www.tripadvisor.com", icon: "tripadvisor" },
        { label: "YouTube", href: "https://www.youtube.com", icon: "youtube" }
      ],
      copyright: "© 2024 Khánh Linh Trans. Premium Tourist Transportation Services."
    }
  },

  en: {
    header: {
      brand: "Khánh Linh Trans",
      links: [
        { label: "Home", href: "#top", active: true },
        { label: "Fleet", href: "#fleet" },
        { label: "Pricing", href: "#pricing" },
        { label: "Contact", href: "#sales" },
        { label: "Flight Tickets", href: "https://klfly.com" }
      ],
      cta: "Book Now",
      menuOpenLabel: "Open navigation menu",
      menuCloseLabel: "Close navigation menu"
    },

    hero: {
      title: "Trusted Vehicle Rental & Self-Drive Services",
      description:
        "Enjoy a complete journey with a modern fleet, professional drivers and a reliable coordination process for corporate, family and group trips.",
      imageAlt: "Khánh Linh Trans fleet",
      primaryCta: "Explore Fleet",
      secondaryCta: "Get Quick Quote"
    },

    consultCard: {
      title: "Free Consultation",
      role: "Mr. Dung - Chief Operating Officer",
      hotlineLabel: "Hotline:",
      chatZalo: "Chat Zalo",
      note: "Support 24/7. Typical response within 5 minutes."
    },

    fleet: {
      heading: "Featured Vehicles",
      intro: "Explore a variety of vehicle lines that adapt to every travel need.",
      loading: "Loading...",
      empty: "No suitable vehicles",
      priceFromLabel: "Price from",
      bookCta: "Book Now",
      categories: [
        { id: "all", label: "All" },
        { id: "4-7", label: "4-7 seats" },
        { id: "16", label: "16 seats" },
        { id: "29", label: "29 seats" },
        { id: "45", label: "45 seats" }
      ],
      filtersAriaLabel: "Fleet categories",
      items: [], // Vehicle data has been moved to db.json — load via GET /api/vehicles?lang=en
    },

    reasons: {
      heading: "Why Choose Khánh Linh Trans?",
      lead:
        "We are committed to providing safe, comfortable and professional travel experiences for business trips, tours and airport transfers.",
      items: [
        {
          title: "100% Modern Fleet",
          description:
            "Our fleet is regularly upgraded and maintained to ensure a clean, comfortable cabin and reliable performance on every route.",
          icon: "fleet"
        },
        {
          title: "Professional Drivers",
          description:
            "Experienced drivers with polite service who proactively assist customers throughout the trip.",
          icon: "driver"
        },
        {
          title: "Transparent Pricing",
          description:
            "We provide detailed quotes by route and vehicle type and commit to no hidden fees after confirmation.",
          icon: "pricing"
        },
        {
          title: "24/7 Support",
          description:
            "Our operations and customer care teams are available to accept requests, adjust schedules and respond quickly when needed.",
          icon: "support"
        }
      ]
    },

    booking: {
      heading: "Booking Process",
      lead: "Simple, fast and professional in 4 clear steps.",
      steps: [
        { title: "1. Choose Vehicle", description: "Select the vehicle type that fits passenger count and trip needs.", icon: "choose" },
        { title: "2. Receive Quote", description: "Our agent will confirm the route and send a detailed quote.", icon: "quote" },
        { title: "3. Sign Contract", description: "Finalize terms, schedule and complete deposit to secure the vehicle.", icon: "contract" },
        { title: "4. Departure", description: "Driver arrives on time, assists locally and starts the journey safely.", icon: "departure" }
      ]
    },

    pricing: {
      heading: "Indicative Price List",
      lead: "Prices may vary depending on timing and requirements. Please contact us for an accurate quote.",
      table: {
        cols: ["Vehicle", "City Tour (1 day)", "Out-of-town (from 100km)", "Airport (one-way)"]
      },
      note: "* Prices are indicative. Includes driver salary, tolls and fuel.",
      rows: [
        { vehicle: "4-Seater", cityTour: "From 1.500.000 VND", provinceTrip: "Contact us", airport: "250.000 VND" },
        { vehicle: "7-Seater", cityTour: "From 2.500.000 VND", provinceTrip: "Contact us", airport: "350.000 VND" },
        { vehicle: "16-Seater", cityTour: "From 3.500.000 VND", provinceTrip: "Contact us", airport: "500.000 VND" },
        { vehicle: "29-Seater", cityTour: "From 4.500.000 VND", provinceTrip: "Contact us", airport: "800.000 VND" },
        { vehicle: "45-Seater", cityTour: "From 6.000.000 VND", provinceTrip: "Contact us", airport: "1.500.000 VND" }
      ]
    },

    sales: {
      heading: "Contact Sales",
      lead: "Our sales team is ready to assist bookings, quotes and tailor services via hotline and Zalo.",
      hotlineLabel: "Hotline",
      hotlineTitle: "Contact us",
      zaloLabel: "Zalo Chat",
      zaloTitle: "Quick Zalo contact",
      zaloAction: "Contact via Zalo"
    },

    testimonials: {
      heading: "What Customers Say",
      lead: "Real feedback from business trips, family tours and long-term transfer contracts.",
      scoreLabel: "Experience rated excellent",
      items: [
        {
          quote:
            "Very professional service, new and clean vehicles. The driver was friendly and supported the group throughout the Sapa trip. Schedule changes were coordinated very quickly.",
          name: "Mr. Tuan",
          role: "CEO, ABC Co., Ltd.",
          badge: "Sapa Trip 3D2N",
          tag: "Corporate",
          initials: "T"
        },
        {
          quote:
            "We booked a 16-seater for airport transfer and Ha Long. The driver arrived on time, the vehicle was clean and assisted elderly passengers very carefully, so the whole family felt at ease.",
          name: "Ms. Minh Ha",
          role: "Family customer",
          badge: "Family transfer",
          tag: "16-seater",
          initials: "H"
        },
        {
          quote:
            "Clear quoting process, quick contracts and the operations team responded almost immediately. This is one of the few providers that consistently maintains quality over multiple bookings.",
          name: "Mr. Hoang Nam",
          role: "Domestic tour operator",
          badge: "Tour partner",
          tag: "29-seater",
          initials: "N"
        }
      ],
      stats: [
        { value: "4.9/5", label: "average satisfaction score from group and individual customers" },
        { value: "200+", label: "corporate contracts served this year" },
        { value: "24/7", label: "operations support for urgent itinerary changes" }
      ]
    },

    faq: {
      heading: "Frequently Asked Questions",
      lead: "Answers to common questions when renting a vehicle.",
      items: [
        {
          question: "What costs are included in the rental price?",
          answer:
            "Basic costs usually include the vehicle, driver, fuel and toll fees per the agreed itinerary. Additional charges such as overnight stays, parking fees or route changes will be communicated clearly before confirmation."
        },
        {
          question: "What is the cancellation and refund policy?",
          answer:
            "Cancellation timing and refund amounts depend on notice and vehicle type. Our advisors will specify terms in the quote or contract so customers can decide before placing a deposit."
        },
        {
          question: "Do you issue VAT invoices?",
          answer:
            "Yes. Khánh Linh Trans issues VAT invoices for corporate and group customers. Provide invoice details when confirming a booking so accounting can process the payment documents."
        }
      ]
    },

    contactCta: {
      heading: "Need a Vehicle for Your Upcoming Trip?",
      lead: "Contact us now for attentive consultation and the best quote.",
      call: "Call Hotline",
      chat: "Chat Zalo"
    },

    footer: {
      brandDescription: "Premium Tourist Transportation Services. We provide safe, convenient and premium travel solutions.",
      servicesHeading: "SERVICES",
      supportHeading: "SUPPORT",
      contactHeading: "CONTACT",
      services: [
        { label: "Vehicle Rental", href: "#fleet" },
        { label: "Airport Transfer", href: "#pricing" },
        { label: "Corporate Travel", href: "#contact-cta-heading" }
      ],
      supportLinks: [
        { label: "Booking Guide", href: "#faq-heading" },
        { label: "Privacy Policy", href: "#faq-heading" },
        { label: "Terms of Service", href: "#faq-heading" }
      ],
      social: [
        { label: "Tripadvisor", href: "https://www.tripadvisor.com", icon: "tripadvisor" },
        { label: "YouTube", href: "https://www.youtube.com", icon: "youtube" }
      ],
      copyright: "© 2024 Khánh Linh Trans. Premium Tourist Transportation Services."
    }
  }
};

export type LangCode = keyof typeof translations;
