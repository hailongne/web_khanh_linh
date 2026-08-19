const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ryfpohhakwpoimxcvvvi.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

function toSupabaseUrl(pathStr) {
  if (!pathStr || typeof pathStr !== 'string') return pathStr;
  if (pathStr.startsWith('http://') || pathStr.startsWith('https://') || pathStr.startsWith('data:')) {
    return pathStr;
  }
  const cleanPath = pathStr.replace(/^\/+/, '');
  if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('images/')) {
    return `${SUPABASE_URL}/storage/v1/object/public/media/${cleanPath}`;
  }
  return pathStr;
}

async function convertAllDatabaseUrls() {
  console.log("=== CHUYỂN ĐỔI TOÀN BỘ ĐƯỜNG DẪN ẢNH TRONG DATABASE SANG SUPABASE STORAGE CDN ===");

  // 1. Update vehicles table
  const { data: vehicles } = await supabase.from('vehicles').select('*');
  if (vehicles) {
    for (const v of vehicles) {
      const newImg = toSupabaseUrl(v.image);
      if (newImg !== v.image) {
        await supabase.from('vehicles').update({ image: newImg }).eq('id', v.id).eq('lang', v.lang);
      }
    }
    console.log(`-> Đã chuyển đổi URL ảnh cho ${vehicles.length} mẫu xe!`);
  }

  // 2. Update site_settings (sales)
  const { data: salesRow } = await supabase.from('site_settings').select('value').eq('key', 'sales').single();
  if (salesRow && Array.isArray(salesRow.value)) {
    const updatedSales = salesRow.value.map(s => ({
      ...s,
      avatar: toSupabaseUrl(s.avatar)
    }));
    await supabase.from('site_settings').update({ value: updatedSales }).eq('key', 'sales');
    console.log("-> Đã chuyển đổi URL avatar chuyên viên sale!");
  }

  // 3. Update accounts table
  const { data: accounts } = await supabase.from('accounts').select('*');
  if (accounts) {
    for (const acc of accounts) {
      const newAvt = toSupabaseUrl(acc.avatar);
      if (newAvt !== acc.avatar) {
        await supabase.from('accounts').update({ avatar: newAvt }).eq('id', acc.id);
      }
    }
    console.log("-> Đã chuyển đổi URL avatar tài khoản admin!");
  }

  // 4. Update posts table
  const { data: posts } = await supabase.from('posts').select('*');
  if (posts) {
    for (const p of posts) {
      const newThumb = toSupabaseUrl(p.thumbnail);
      let blocksStr = JSON.stringify(p.blocks || {});
      blocksStr = blocksStr.replace(/\/uploads\/blog\//g, `${SUPABASE_URL}/storage/v1/object/public/media/uploads/blog/`);
      blocksStr = blocksStr.replace(/\/images\/news\//g, `${SUPABASE_URL}/storage/v1/object/public/media/images/news/`);
      blocksStr = blocksStr.replace(/\/images\//g, `${SUPABASE_URL}/storage/v1/object/public/media/images/`);

      const newBlocks = JSON.parse(blocksStr);

      await supabase.from('posts').update({
        thumbnail: newThumb,
        blocks: newBlocks
      }).eq('id', p.id);
    }
    console.log(`-> Đã chuyển đổi URL ảnh thumbnail và khối nội dung cho ${posts.length} bài viết!`);
  }

  console.log("\n=== HOÀN TẤT CHUYỂN ĐỔI CDN URL TRONG DATABASE ===");
}

convertAllDatabaseUrls().catch(console.error);
