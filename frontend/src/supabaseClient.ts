import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

// Check if we're in demo mode
const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

let supabase: any;

if (isDemoMode) {
  console.log('Demo mode detected - creating mock Supabase client');
  
  // Mock data for demo - grants from June 23, 2025 onwards
  const mockGrants = [
    {
      id: 1,
      name: "First Nations Arts and Culture Program",
      funder: "Creative Australia",
      description: "Supporting Indigenous artists and cultural practitioners to create, develop and present new work",
      amount_string: "$10,000 - $150,000",
      due_date: "2025-07-15",
      status: "open",
      source_url: "https://creative.gov.au/funding/first-nations-arts",
      created_at: "2025-06-01",
      updated_at: "2025-06-20"
    },
    {
      id: 2,
      name: "Documentary Producer Program",
      funder: "Screen Australia",
      description: "Development funding for documentary projects with strong social impact themes",
      amount_string: "$20,000 - $500,000",
      due_date: "2025-08-30",
      status: "open",
      source_url: "https://screenaustralia.gov.au/funding/documentary",
      created_at: "2025-06-05",
      updated_at: "2025-06-22"
    },
    {
      id: 3,
      name: "Online and Games Fund",
      funder: "Screen Australia",
      description: "Supporting innovative digital storytelling and interactive media projects",
      amount_string: "$30,000 - $200,000",
      due_date: "2025-09-20",
      status: "open",
      source_url: "https://screenaustralia.gov.au/funding/online-games",
      created_at: "2025-06-10",
      updated_at: "2025-06-23"
    },
    {
      id: 4,
      name: "Youth Arts Development Program",
      funder: "Australia Council for the Arts",
      description: "Empowering young artists aged 18-30 to develop their creative practice",
      amount_string: "$8,000 - $40,000",
      due_date: "2025-07-31",
      status: "open",
      source_url: "https://australiacouncil.gov.au/funding/youth-arts",
      created_at: "2025-06-15",
      updated_at: "2025-06-23"
    },
    {
      id: 5,
      name: "Environmental Storytelling Initiative",
      funder: "Department of Climate Change",
      description: "Media projects focused on climate resilience and environmental awareness",
      amount_string: "$25,000 - $100,000",
      due_date: "2025-10-15",
      status: "open",
      source_url: "https://dcceew.gov.au/funding/environmental-media",
      created_at: "2025-06-18",
      updated_at: "2025-06-23"
    },
    {
      id: 6,
      name: "Community Broadcasting Foundation",
      funder: "CBF",
      description: "Supporting community media projects that amplify diverse voices",
      amount_string: "$5,000 - $35,000",
      due_date: "2025-08-15",
      status: "open",
      source_url: "https://cbf.com.au/funding",
      created_at: "2025-06-12",
      updated_at: "2025-06-22"
    },
    {
      id: 7,
      name: "Innovation in Creative Industries",
      funder: "Victorian Government",
      description: "Technology-driven creative projects with commercial potential",
      amount_string: "$15,000 - $75,000",
      due_date: "2025-09-30",
      status: "open",
      source_url: "https://creative.vic.gov.au/funding/innovation",
      created_at: "2025-06-08",
      updated_at: "2025-06-21"
    },
    {
      id: 8,
      name: "Social Impact Documentary Fund",
      funder: "Documentary Australia Foundation",
      description: "Documentaries addressing social justice and community issues",
      amount_string: "$12,000 - $60,000",
      due_date: "2025-11-01",
      status: "open",
      source_url: "https://documentaryaustralia.com.au/funding",
      created_at: "2025-06-14",
      updated_at: "2025-06-23"
    }
  ];

  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null })
    },
      from: (_table: string) => ({
    select: (_columns?: string) => ({
      order: (_column: string, _options?: any) => Promise.resolve({ data: mockGrants, error: null }),
      eq: (column: string, value: any) => Promise.resolve({ data: mockGrants.filter(item => (item as any)[column] === value), error: null }),
      neq: (column: string, value: any) => Promise.resolve({ data: mockGrants.filter(item => (item as any)[column] !== value), error: null }),
        limit: (count: number) => Promise.resolve({ data: mockGrants.slice(0, count), error: null }),
        single: () => Promise.resolve({ data: mockGrants[0] || null, error: null })
      }),
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => Promise.resolve({ data, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: (data: any) => Promise.resolve({ data, error: null })
    }),
    storage: {
      from: (_bucket: string) => ({
        upload: () => Promise.resolve({ data: { path: 'demo-file.pdf' }, error: null }),
        download: () => Promise.resolve({ data: new Blob(), error: null }),
        remove: () => Promise.resolve({ data: null, error: null })
      })
    }
  };
} else if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env file');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('Supabase client created successfully');
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
}

export { supabase }; 