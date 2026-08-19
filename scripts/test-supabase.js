const { createClient } = require('@supabase/supabase-js');

const url = "https://ryfpohhakwpoimxcvvvi.supabase.co";
const key = "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";

const supabase = createClient(url, key);

async function testRead() {
  console.log("=== KIỂM TRA ĐỌC DỮ LIỆU TỪ SUPABASE SDK ===");

  const { data: accounts, error: err1 } = await supabase.from('accounts').select('*');
  console.log("Accounts count:", accounts ? accounts.length : 0, err1 ? err1.message : "");

  const { data: vehicles, error: err2 } = await supabase.from('vehicles').select('*');
  console.log("Vehicles count:", vehicles ? vehicles.length : 0, err2 ? err2.message : "");

  const { data: posts, error: err3 } = await supabase.from('posts').select('*');
  console.log("Posts count:", posts ? posts.length : 0, err3 ? err3.message : "");

  const { data: settings, error: err4 } = await supabase.from('site_settings').select('*');
  console.log("Site Settings count:", settings ? settings.length : 0, err4 ? err4.message : "");
}

testRead();
