import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'POST') {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Content is required' });
      }

      if (content.length > 300) {
        return res.status(400).json({ error: 'Content too long' });
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([{ content: content.trim() }])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }
      
      return res.status(200).json(data);
      
    } catch (err) {
      console.error('Server error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}