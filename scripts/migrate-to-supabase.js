const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ryfpohhakwpoimxcvvvi.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";
const DB_CONNECTION_STRING = "postgres://postgres.ryfpohhakwpoimxcvvvi:KhanhLinh2026!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function runMigration() {
  console.log("=== BẮT ĐẦU CHUYỂN ĐỔI DỮ LIỆU SANG SUPABASE ===");

  const pgClient = new Client({
    connectionString: DB_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false }
  });

  await pgClient.connect();

  // Step 1: Run SQL Schema to create tables
  console.log("\n1. Khởi tạo Bảng dữ liệu PostgreSQL...");
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pgClient.query(schemaSql);
  console.log("-> Đã khởi tạo các bảng và policy thành công!");

  // Step 2: Migrate Accounts
  console.log("\n2. Đồng bộ Tài khoản Quản trị (accounts.json)...");
  const accountsPath = path.join(process.cwd(), 'data', 'accounts.json');
  if (fs.existsSync(accountsPath)) {
    const accounts = JSON.parse(fs.readFileSync(accountsPath, 'utf-8'));
    for (const acc of accounts) {
      await pgClient.query(`
        INSERT INTO public.accounts (id, username, password_hash, display_name, avatar, role, permissions, active, created_at, updated_at, last_login)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          password_hash = EXCLUDED.password_hash,
          display_name = EXCLUDED.display_name,
          avatar = EXCLUDED.avatar,
          role = EXCLUDED.role,
          permissions = EXCLUDED.permissions,
          active = EXCLUDED.active,
          updated_at = EXCLUDED.updated_at,
          last_login = EXCLUDED.last_login;
      `, [
        acc.id,
        acc.username,
        acc.passwordHash || acc.password_hash,
        acc.displayName || acc.display_name || "",
        acc.avatar || "",
        acc.role,
        JSON.stringify(acc.permissions || []),
        acc.active ?? true,
        acc.createdAt || new Date().toISOString(),
        acc.updatedAt || new Date().toISOString(),
        acc.lastLogin || null
      ]);
    }
    console.log(`-> Đã lưu ${accounts.length} tài khoản vào Supabase!`);
  }

  // Step 3: Migrate Sessions
  console.log("\n3. Đồng bộ Phiên đăng nhập (sessions.json)...");
  const sessionsPath = path.join(process.cwd(), 'data', 'sessions.json');
  if (fs.existsSync(sessionsPath)) {
    const sessionsMap = JSON.parse(fs.readFileSync(sessionsPath, 'utf-8'));
    let count = 0;
    for (const [id, s] of Object.entries(sessionsMap)) {
      await pgClient.query(`
        INSERT INTO public.sessions (id, account_id, expire)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET expire = EXCLUDED.expire;
      `, [id, s.accountId, s.expire]);
      count++;
    }
    console.log(`-> Đã lưu ${count} phiên làm việc vào Supabase!`);
  }

  // Step 4: Migrate Categories
  console.log("\n4. Đồng bộ Danh mục Tin tức (categories.json)...");
  const categoriesPath = path.join(process.cwd(), 'data', 'categories.json');
  if (fs.existsSync(categoriesPath)) {
    const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
    for (const cat of categories) {
      await pgClient.query(`
        INSERT INTO public.categories (id, name, slug, description, visible, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          visible = EXCLUDED.visible,
          updated_at = EXCLUDED.updated_at;
      `, [
        cat.id,
        cat.name,
        cat.slug,
        cat.description || "",
        cat.visible ?? true,
        cat.createdAt || new Date().toISOString(),
        cat.updatedAt || new Date().toISOString()
      ]);
    }
    console.log(`-> Đã lưu ${categories.length} danh mục vào Supabase!`);
  }

  // Step 5: Migrate db.json (vehicles & site_settings)
  console.log("\n5. Đồng bộ Dữ liệu Website (db.json)...");
  const dbPath = path.join(process.cwd(), 'db.json');
  if (fs.existsSync(dbPath)) {
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

    // Vehicles
    if (dbData.vehicles) {
      let vCount = 0;
      for (const lang of ['vi', 'en']) {
        const list = dbData.vehicles[lang] || [];
        for (const v of list) {
          await pgClient.query(`
            INSERT INTO public.vehicles (id, lang, name, badge, price, image, specs)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id, lang) DO UPDATE SET
              name = EXCLUDED.name,
              badge = EXCLUDED.badge,
              price = EXCLUDED.price,
              image = EXCLUDED.image,
              specs = EXCLUDED.specs;
          `, [
            String(v.id),
            lang,
            v.name,
            v.badge || "",
            v.price || "",
            v.image || "",
            JSON.stringify(v.specs || [])
          ]);
          vCount++;
        }
      }
      console.log(`-> Đã lưu ${vCount} mẫu xe vào Supabase!`);
    }

    // Site settings
    const settingsKeys = ['sales', 'contacts', 'pricing', 'testimonials', 'faq'];
    for (const key of settingsKeys) {
      if (dbData[key] !== undefined) {
        await pgClient.query(`
          INSERT INTO public.site_settings (key, value, updated_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
        `, [key, JSON.stringify(dbData[key])]);
        console.log(`-> Đã lưu mục '${key}' vào Supabase!`);
      }
    }
  }

  // Step 6: Migrate News Posts
  console.log("\n6. Đồng bộ Bài viết Tin tức (news-index.json & news/*.json)...");
  const newsIndexPath = path.join(process.cwd(), 'data', 'news-index.json');
  const newsDir = path.join(process.cwd(), 'data', 'news');
  if (fs.existsSync(newsIndexPath)) {
    const newsIndex = JSON.parse(fs.readFileSync(newsIndexPath, 'utf-8'));
    let count = 0;
    for (const item of newsIndex) {
      let blocks = { vi: [], en: [] };
      let seo = {};
      let authorId = item.authorId || null;

      const detailFile = path.join(newsDir, `${item.slug}.json`);
      if (fs.existsSync(detailFile)) {
        try {
          const detail = JSON.parse(fs.readFileSync(detailFile, 'utf-8'));
          blocks = detail.blocks || blocks;
          seo = detail.seo || seo;
          if (detail.authorId) authorId = detail.authorId;
        } catch (e) {}
      }

      await pgClient.query(`
        INSERT INTO public.posts (id, slug, title, excerpt, thumbnail, category, status, featured, view_count, author_id, blocks, seo, published_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          thumbnail = EXCLUDED.thumbnail,
          category = EXCLUDED.category,
          status = EXCLUDED.status,
          featured = EXCLUDED.featured,
          view_count = EXCLUDED.view_count,
          author_id = EXCLUDED.author_id,
          blocks = EXCLUDED.blocks,
          seo = EXCLUDED.seo,
          updated_at = EXCLUDED.updated_at;
      `, [
        item.id,
        item.slug,
        JSON.stringify(item.title),
        JSON.stringify(item.excerpt),
        item.thumbnail || "",
        item.category || "",
        item.status || "published",
        item.featured ?? false,
        item.viewCount || 0,
        authorId,
        JSON.stringify(blocks),
        JSON.stringify(seo),
        item.publishedAt || new Date().toISOString(),
        item.publishedAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString()
      ]);
      count++;
    }
    console.log(`-> Đã lưu ${count} bài viết tin tức đầy đủ vào Supabase!`);
  }

  // Reload PostgREST schema cache
  await pgClient.query("NOTIFY pgrst, 'reload schema';");
  await pgClient.end();

  // Step 7: Upload static images to Supabase Storage Bucket 'media'
  console.log("\n7. Upload hình ảnh vật lý lên Supabase Storage...");
  const foldersToUpload = [
    { dir: path.join(process.cwd(), 'public', 'uploads'), prefix: 'uploads' },
    { dir: path.join(process.cwd(), 'public', 'uploads', 'blog'), prefix: 'uploads/blog' },
    { dir: path.join(process.cwd(), 'public', 'images'), prefix: 'images' },
    { dir: path.join(process.cwd(), 'public', 'images', 'news'), prefix: 'images/news' }
  ];

  let uploadCount = 0;
  for (const { dir, prefix } of foldersToUpload) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) continue;
      
      const fileBuffer = fs.readFileSync(fullPath);
      const storagePath = `${prefix}/${file}`;
      
      const ext = path.extname(file).toLowerCase();
      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';

      const { error } = await supabase.storage.from('media').upload(storagePath, fileBuffer, {
        contentType,
        upsert: true
      });

      if (!error) uploadCount++;
    }
  }
  console.log(`-> Đã upload ${uploadCount} file ảnh lên Supabase Storage!`);

  console.log("\n=== HOÀN TẤT CHUYỂN ĐỔI DỮ LIỆU SANG SUPABASE ===");
}

runMigration().catch(console.error);
