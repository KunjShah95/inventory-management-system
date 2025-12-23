// Node 18+ (uses global fetch). Loads .env and posts to Supabase REST API to create product 'kri'.
// Run: node scripts/add_kri_product.js

require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment or .env');
  process.exit(1);
}

const payload = {
  product_id: Math.random().toString(36).substring(2, 11),
  product_name: 'kri',
  quantity: 0,
  cost: 0
};

(async () => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/active_products`, {
      method: 'POST',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('Failed to create product:', res.status, text);
      process.exit(1);
    }

    // response is JSON array
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    console.log('Product created:', data[0] || data);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
