import { supabase } from './supabaseClient';

export async function insertTestGrant() {
  const testGrant = {
    name: 'Test Community Development Grant',
    funder: 'Test Foundation',
    source_url: 'https://example.com/test-grant',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    amount_string: '$50,000 - $100,000',
    description: 'This is a test grant for community development projects.',
    status: 'potential'
  };

  try {
    const { data, error } = await supabase
      .from('grants')
      .insert([testGrant])
      .select();

    if (error) {
      console.error('Error inserting test grant:', error);
      return null;
    }

    console.log('Test grant inserted successfully:', data);
    return data[0];
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
} 