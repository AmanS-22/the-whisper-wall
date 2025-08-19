import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method === 'GET') {
    try {
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(req.query.limit || 20);

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