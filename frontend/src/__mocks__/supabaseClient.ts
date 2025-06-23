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

// Create a comprehensive mock that properly handles all Supabase query patterns
const createMockQueryBuilder = (table: string) => {
  const mockData = table === 'tasks' ? mockTasks : mockDocuments;
  
  // This will track if this is the final method call that should resolve
  let shouldResolve = false;
  let resolveData = mockData;
  let resolveError = null;

  const queryBuilder: any = {
    // Query methods that continue the chain
    select: jest.fn((): any => queryBuilder),
    from: jest.fn((): any => queryBuilder),
    eq: jest.fn((): any => queryBuilder),
    order: jest.fn((): any => {
      shouldResolve = true;
      return queryBuilder;
    }),
    
    // Methods that return different structures
    insert: jest.fn(() => {
      return Promise.resolve({ data: null, error: null });
    }),
    
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
    })),
    
    // Make the query builder thenable for async/await
    then: jest.fn((resolve, reject) => {
      if (shouldResolve) {
        return Promise.resolve({ data: resolveData, error: resolveError }).then(resolve, reject);
      }
      return Promise.resolve({ data: resolveData, error: resolveError }).then(resolve, reject);
    }),
    
    catch: jest.fn((reject) => {
      return Promise.resolve({ data: resolveData, error: resolveError }).catch(reject);
    })
  };

  return queryBuilder;
};

export const supabase = {
  from: jest.fn().mockImplementation((table) => createMockQueryBuilder(table)),
  storage: {
    from: jest.fn().mockImplementation(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null })
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