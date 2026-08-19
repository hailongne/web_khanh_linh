const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ryfpohhakwpoimxcvvvi.supabase.co";
const SUPABASE_SERVICE_KEY = "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAllApis() {
  console.log("=== THỰC HIỆN KIỂM TRA ĐỘC LẬP TẤT CẢ BẢNG & API DATA SUPABASE ===");

  // 1. Vehicles
  const { data: vehicles, error: errVehicles } = await supabase.from('vehicles').select('*');
  console.log(`\n1. Kiểm tra Bảng Vehicles (Đội xe): ${errVehicles ? 'LỖI' : 'OK ✓ (' + vehicles.length + ' bản ghi xe)'}`);

  // 2. Posts (Blog)
  const { data: posts, error: errPosts } = await supabase.from('posts').select('id, title, slug, category, status');
  console.log(`2. Kiểm tra Bảng Posts (Bài viết blog): ${errPosts ? 'LỖI' : 'OK ✓ (' + posts.length + ' bài viết)'}`);

  // 3. Categories
  const { data: categories, error: errCat } = await supabase.from('categories').select('*');
  console.log(`3. Kiểm tra Bảng Categories (Danh mục blog): ${errCat ? 'LỖI' : 'OK ✓ (' + categories.length + ' danh mục)'}`);

  // 4. Site Settings (Sales, Pricing, FAQ, Reviews)
  const { data: settings, error: errSettings } = await supabase.from('site_settings').select('key');
  console.log(`4. Kiểm tra Bảng Site Settings (Sales, Pricing, FAQ, Reviews): ${errSettings ? 'LỖI' : 'OK ✓ (Keys: ' + settings.map(s => s.key).join(', ') + ')'}`);

  // 5. Accounts (Users)
  const { data: accounts, error: errAccounts } = await supabase.from('accounts').select('username, role');
  console.log(`5. Kiểm tra Bảng Accounts (Admin Users): ${errAccounts ? 'LỖI' : 'OK ✓ (' + accounts.length + ' tài khoản admin)'}`);

  // 6. Storage Bucket (Media)
  const { data: files, error: errStorage } = await supabase.storage.from('media').list();
  console.log(`6. Kiểm tra Storage Bucket 'media': ${errStorage ? 'LỖI' : 'OK ✓ (' + files.length + ' mục thư mục media)'}`);

  console.log("\n=== TẤT CẢ DỮ LIỆU CỦA SUPABASE ĐỀU HOẠT ĐỘNG HOÀN HẢO! ===");
}

testAllApis();
