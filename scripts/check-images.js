const { createClient } = require('@supabase/supabase-js');

const url = "https://ryfpohhakwpoimxcvvvi.supabase.co";
const key = "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";

const supabase = createClient(url, key);

async function checkImageUrls() {
  console.log("=== KIỂM TRA ĐƯỜNG DẪN ẢNH TRONG SUPABASE DATABASE ===");

  const { data: vehicles } = await supabase.from('vehicles').select('name, image').limit(5);
  console.log("\n1. Đội xe (Table vehicles):");
  vehicles?.forEach(v => console.log(`- ${v.name}: ${v.image}`));

  const { data: settings } = await supabase.from('site_settings').select('value').eq('key', 'sales').single();
  console.log("\n2. Chuyên viên Sale (Table site_settings - sales):");
  settings?.value?.forEach(s => console.log(`- ${s.name}: ${s.avatar || '(chưa chọn avatar)'}`));

  const { data: posts } = await supabase.from('posts').select('title, thumbnail').limit(3);
  console.log("\n3. CMS Blog (Table posts):");
  posts?.forEach(p => console.log(`- ${p.title?.vi || p.title?.en}: ${p.thumbnail}`));

  console.log("\n4. Kiểm tra Supabase Storage Bucket 'media':");
  const { data: storageFiles } = await supabase.storage.from('media').list('uploads/blog');
  console.log(`Số file ảnh bài viết trong Supabase Storage bucket 'media/uploads/blog': ${storageFiles?.length || 0}`);
}

checkImageUrls();
