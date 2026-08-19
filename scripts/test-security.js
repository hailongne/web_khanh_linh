const { createClient } = require('@supabase/supabase-js');

const url = "https://ryfpohhakwpoimxcvvvi.supabase.co";
const anonKey = "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";

// Client simulating a public hacker using the anon key
const client = createClient(url, anonKey);

async function testSecurity() {
  console.log("=== KIỂM TRA BẢO MẬT TRỰC TIẾP TRÊN SUPABASE CLOUD ===");

  // 1. Thử đọc tài khoản admin (table accounts) bằng Anon Key
  const { data: accounts, error: accError } = await client.from('accounts').select('*');
  console.log("\n1. Thử đọc bảng accounts bằng Anon Key công khai:");
  console.log("Kết quả:", accError ? `BỊ CHẶN/LỖI: ${accError.message}` : `ĐỌC ĐƯỢC ${accounts?.length} BẢN GHI (Nếu RLS chưa bật, ai cũng đọc được)`);

  // 2. Thử đọc phiên làm việc (table sessions) bằng Anon Key
  const { data: sessions, error: sessError } = await client.from('sessions').select('*');
  console.log("\n2. Thử đọc bảng sessions (Cookie session token):");
  console.log("Kết quả:", sessError ? `BỊ CHẶN/LỖI: ${sessError.message}` : `ĐỌC ĐƯỢC ${sessions?.length} BẢN GHI`);

  // 3. Thử chèn tài khoản giả (INSERT INTO accounts) bằng Anon Key
  const { error: insertError } = await client.from('accounts').insert({
    id: "hacker-test",
    username: "hacker",
    password_hash: "123456"
  });
  console.log("\n3. Thử chèn tài khoản admin mới bằng Anon Key:");
  console.log("Kết quả:", insertError ? `BỊ CHẶN/LỖI: ${insertError.message}` : `CHÈN THÀNH CÔNG (Cảnh báo: Cần bật RLS trên Supabase!)`);
}

testSecurity();
