// Mock data
const mockDocuments = [
  {
    id: 1,
    name: 'test-document.pdf',
    file_path: 'test-document.pdf',
    file_type: 'application/pdf',
    size_bytes: 1024,
    version: 1,
    is_template: false,
    created_at: new Date().toISOString(),
    created_by: 'test-user-id'
  }
];

const mockTasks = [
  {
    id: 1,
    title: 'Complete application form',
    description: 'Fill out the grant application form',
    status: 'pending',
    priority: 'high',
    due_date: '2024-12-31',
    assigned_to: 'test-user-id',
    grant_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockGrants = [
  {
    id: 1,
    name: 'Screen Australia Documentary Program',
    funder: 'Screen Australia',
    description: 'Funding for documentary production',
    amount_string: '$50,000 - $200,000',
    due_date: '2025-08-30',
    status: 'researching',
    source_url: 'https://screenaustralia.gov.au',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Creative Victoria Arts Grant',
    funder: 'Creative Victoria',
    description: 'Support for Victorian artists and creative projects',
    amount_string: '$15,000 - $100,000',
    due_date: '2025-09-10',
    status: 'drafting',
    source_url: 'https://creative.vic.gov.au',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'First Nations Arts Program',
    funder: 'Creative Australia',
    description: 'Support for First Nations artists and cultural projects',
    amount_string: '$10,000 - $150,000',
    due_date: '2025-08-15',
    status: 'submitted',
    source_url: 'https://creativaustralia.gov.au',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Comprehensive mock query builder that handles all Supabase patterns
class MockQueryBuilder {
  private mockData: any[];
  private filters: any[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;

  constructor(tableName: string) {
    this.mockData = this.getMockData(tableName);
  }

  private getMockData(table: string) {
    switch (table) {
      case 'tasks': return [...mockTasks];
      case 'grants': return [...mockGrants];
      case 'documents': return [...mockDocuments];
      default: return [];
    }
  }

  // Query building methods that return this for chaining
  select(_columns: string = '*') {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  // Terminal methods that execute the query
  then(resolve: any, reject?: any) {
    try {
      let filteredData = [...this.mockData];

      // Apply filters
      this.filters.forEach(filter => {
        if (filter.type === 'eq') {
          filteredData = filteredData.filter(item => item[filter.column] === filter.value);
        } else if (filter.type === 'neq') {
          filteredData = filteredData.filter(item => item[filter.column] !== filter.value);
        }
      });

      // Apply ordering
      if (this.orderBy) {
        filteredData.sort((a, b) => {
          const aVal = a[this.orderBy!.column];
          const bVal = b[this.orderBy!.column];
          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return this.orderBy!.ascending ? comparison : -comparison;
        });
      }

      const result = { data: filteredData, error: null };
      return Promise.resolve(result).then(resolve, reject);
    } catch (error) {
      const result = { data: null, error };
      return Promise.resolve(result).then(resolve, reject);
    }
  }

  catch(reject: any) {
    return this.then((data: any) => data, reject);
  }

  // Insert method
  insert(_values: any) {
    return Promise.resolve({ data: null, error: null });
  }

  // Update method that returns a new builder for chaining
  update(_values: any) {
    const updateBuilder = {
      eq: (_column: string, _value: any) => {
        return Promise.resolve({ data: null, error: null });
      },
      neq: (_column: string, _value: any) => {
        return Promise.resolve({ data: null, error: null });
      }
    };
    return updateBuilder;
  }

  // Delete method that returns a new builder for chaining
  delete() {
    const deleteBuilder = {
      eq: (_column: string, _value: any) => {
        return Promise.resolve({ data: null, error: null });
      },
      neq: (_column: string, _value: any) => {
        return Promise.resolve({ data: null, error: null });
      }
    };
    return deleteBuilder;
  }
}

// Mock Supabase client
export const supabase = {
  from: jest.fn().mockImplementation((tableName) => {
    return new MockQueryBuilder(tableName);
  }),
  
  storage: {
    from: jest.fn().mockImplementation(() => ({
      upload: jest.fn().mockResolvedValue({ 
        data: { path: 'test-path' }, 
        error: null 
      }),
      download: jest.fn().mockResolvedValue({ 
        data: new Blob(), 
        error: null 
      }),
      remove: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      list: jest.fn().mockResolvedValue({ 
        data: [], 
        error: null 
      })
    }))
  },
  
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      },
      error: null
    })
  }
}; 