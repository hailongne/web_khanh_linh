const { Pool } = require('pg');

const connectionString = "postgres://postgres.ryfpohhakwpoimxcvvvi:KhanhLinh2026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function secureDatabase() {
  console.log("=== TIẾN HÀNH BẢO MẬT HÓA 100% CHO SUPABASE POSTGRESQL DATABASE ===");
  const client = await pool.connect();

  try {
    // 1. Xóa tài khoản thử nghiệm an toàn nếu có
    await client.query(`DELETE FROM public.accounts WHERE id = 'hacker-test';`);
    console.log("-> Đã xóa các tài khoản thử nghiệm an toàn.");

    // 2. Bật Row Level Security (RLS) cho tất cả các bảng
    const tables = ['accounts', 'sessions', 'categories', 'posts', 'site_settings', 'vehicles'];
    for (const table of tables) {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      console.log(`-> Đã bật Row Level Security (RLS) cho bảng '${table}'.`);
    }

    // 3. Xóa tất cả các policy cũ để tránh trùng lặp
    for (const table of tables) {
      await client.query(`DROP POLICY IF EXISTS "Public Anon Access" ON public.${table};`);
      await client.query(`DROP POLICY IF EXISTS "Public Read Access" ON public.${table};`);
      await client.query(`DROP POLICY IF EXISTS "No Public Access" ON public.${table};`);
    }

    // 4. Cấu hình Policy nghiêm ngặt:
    // - Bảng accounts & sessions: CHẶN HOÀN TOÀN TRUY CẬP TỪ BÊN NGOÀI (Chỉ Service Role Backend mới đọc/ghi được)
    // - Bảng categories, posts, vehicles, site_settings: CHO PHÉP ĐỌC CÔNG KHAI (SELECT ONLY), CHẶN SỬA/XÓA TỪ BÊN NGOÀI

    await client.query(`
      -- Bảng accounts & sessions: Cấm hoàn toàn Anon truy cập
      CREATE POLICY "No Public Access Accounts" ON public.accounts FOR ALL TO anon USING (false);
      CREATE POLICY "No Public Access Sessions" ON public.sessions FOR ALL TO anon USING (false);

      -- Bảng công khai: Chỉ cho phép SELECT, cấm INSERT/UPDATE/DELETE từ Anon Key
      CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT TO anon USING (true);
      CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT TO anon USING (true);
      CREATE POLICY "Public Read Vehicles" ON public.vehicles FOR SELECT TO anon USING (true);
      CREATE POLICY "Public Read SiteSettings" ON public.site_settings FOR SELECT TO anon USING (true);
    `);
    console.log("-> Đã thiết lập các chính sách RLS bảo mật phân quyền nghiêm ngặt.");

    // 5. Reload PostgREST Schema Cache
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("-> Đã reload PostgREST Schema Cache thành công.");

    console.log("\n=== BẢO MẬT DATABASE TỐI ĐA THÀNH CÔNG 100%! ===");
  } catch (error) {
    console.error("Lỗi khi bảo mật database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

secureDatabase();
