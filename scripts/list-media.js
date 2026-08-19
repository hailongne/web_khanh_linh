import { createClient } from '@supabase/supabase-js';

const url = "https://ryfpohhakwpoimxcvvvi.supabase.co";
const key = "sb_publishable_WD0z_4S7EIDU7mGhFyy8XA_bIELh7w-";

const supabase = createClient(url, key);

async function listAllMedia() {
  console.log("=== DANH SÁCH BUCKET MEDIA ===");

  async function listRecursive(folderPath = '') {
    const { data: files, error } = await supabase.storage.from("media").list(folderPath, { limit: 100 });
    if (error) {
      console.log(`Error listing ${folderPath}:`, error.message);
      return;
    }

    for (const f of files) {
      const fullPath = folderPath ? `${folderPath}/${f.name}` : f.name;
      if (f.id === null) {
        // It's a directory
        console.log(`[DIR] ${fullPath}`);
        await listRecursive(fullPath);
      } else {
        console.log(`[FILE] ${fullPath} (${f.metadata?.size || 0} bytes)`);
      }
    }
  }

  await listRecursive('');
}

listAllMedia();
