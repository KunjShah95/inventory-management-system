const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('active_products')
      .select('*')
      .order('product_name', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = req.body;
    const { data, error } = await supabase
      .from('active_products')
      .insert([product])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to create product' });
  }
});

app.patch('/api/products/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const updates = req.body;
    const { data, error } = await supabase
      .from('active_products')
      .update(updates)
      .eq('product_name', name)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to update product' });
  }
});

app.delete('/api/products/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const { error } = await supabase
      .from('active_products')
      .delete()
      .eq('product_name', name);
    if (error) throw error;
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to delete product' });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory backend listening on http://localhost:${PORT}`);
});
