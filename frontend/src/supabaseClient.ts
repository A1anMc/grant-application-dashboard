import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);

let supabase: any;

// Always create a working client - demo mode will be handled at component level
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - creating comprehensive fallback client');
  
  // Mock data for demo
  const mockGrants = [
    { id: 1, name: 'First Nations Arts Program', status: 'draft', user_id: 'demo-user' },
    { id: 2, name: 'Documentary Producer Grant', status: 'submitted', user_id: 'demo-user' },
    { id: 3, name: 'Youth Arts Development', status: 'in_review', user_id: 'demo-user' }
  ];
  
  // Create query builder that supports chaining
  const createQueryBuilder = (data: any[]) => {
    let filteredData = [...data];
    
    const queryBuilder = {
      eq: (column: string, value: any) => {
        filteredData = filteredData.filter(item => (item as any)[column] === value);
        return { ...queryBuilder };
      },
      neq: (column: string, value: any) => {
        filteredData = filteredData.filter(item => (item as any)[column] !== value);
        return { ...queryBuilder };
      },
      order: (column: string, options?: any) => {
        const ascending = !options || options.ascending !== false;
        filteredData.sort((a: any, b: any) => {
          if (ascending) {
            return a[column] > b[column] ? 1 : -1;
          } else {
            return a[column] < b[column] ? 1 : -1;
          }
        });
        return Promise.resolve({ data: filteredData, error: null });
      },
      limit: (count: number) => {
        filteredData = filteredData.slice(0, count);
        return { ...queryBuilder };
      },
      single: () => {
        return Promise.resolve({ data: filteredData[0] || null, error: null });
      },
      then: (resolve: any) => {
        // This makes the query builder thenable, so it works with await
        return Promise.resolve({ data: filteredData, error: null }).then(resolve);
      }
    };
    
    return queryBuilder;
  };
  
  // Create comprehensive fallback client
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'No Supabase config' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'No Supabase config' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'No Supabase config' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: (table: string) => ({
      select: (columns?: string) => {
        // Return mock data based on table (columns parameter is for API compatibility)
        const tableData = table === 'grants' ? mockGrants : [];
        console.log(`Mock query: SELECT ${columns || '*'} FROM ${table}`);
        return createQueryBuilder(tableData);
      },
      insert: (data: any) => Promise.resolve({ data, error: null }),
      update: (data: any) => ({
        eq: () => Promise.resolve({ data, error: null })
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      })
    }),
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'No Supabase config' } }),
        download: () => Promise.resolve({ data: null, error: { message: 'No Supabase config' } })
      })
    }
  };
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