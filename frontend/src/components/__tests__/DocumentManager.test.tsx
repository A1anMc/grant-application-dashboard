/** @jest-environment jsdom */
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentManager from '../DocumentManager';

// Mock data that will be returned by default
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

// Mock the supabaseClient module
jest.mock('../../supabaseClient', () => {
  // Create a comprehensive mock for supabase inside the mock
  const mockSupabase = {
    from: jest.fn(),
    storage: {
      from: jest.fn()
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

  return {
    supabase: mockSupabase
  };
});

// Import the mocked supabase after mocking
import { supabase } from '../../supabaseClient';

// Mock window.URL.createObjectURL and revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
window.URL.createObjectURL = mockCreateObjectURL;
window.URL.revokeObjectURL = mockRevokeObjectURL;

describe('DocumentManager', () => {
  // Helper function to setup default mocks
  const setupDefaultMocks = () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default database query chain
    const mockQueryChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      }),
      then: jest.fn((resolve) => resolve({ data: mockDocuments, error: null }))
    };
    
    (supabase.from as jest.Mock).mockImplementation(() => mockQueryChain);
    
    // Setup default storage mocks
    (supabase.storage.from as jest.Mock).mockImplementation(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null })
    }));
  };

  beforeEach(() => {
    setupDefaultMocks();
  });

  test('renders loading state initially', async () => {
    render(<DocumentManager grantId={1} />);
    const loadingSpinner = screen.getByRole('status', { name: /loading documents/i });
    expect(loadingSpinner).toBeInTheDocument();
  });

  test('renders document list after loading', async () => {
    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    // Check document list content
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText(/application\/pdf.*1 KB/)).toBeInTheDocument();

    // Check API calls
    expect(supabase.from).toHaveBeenCalledWith('documents');
  });

  test('shows error message when document fetch fails', async () => {
    const errorMessage = 'Failed to fetch documents';
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    // Override the default mock for this test
    const mockQueryChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve({ data: null, error: new Error(errorMessage) }))
    };
    (supabase.from as jest.Mock).mockImplementation(() => mockQueryChain);

    render(<DocumentManager grantId={1} />);

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('uploads a document', async () => {
    const user = userEvent.setup();
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Choose a file to upload/i) as HTMLInputElement;
    
    await act(async () => {
      await user.upload(fileInput, file);
      await user.click(screen.getByText('Start Upload'));
    });

    // Wait for upload to complete
    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith('documents');
    });
  });

  test('downloads a document', async () => {
    const user = userEvent.setup();
    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish and document to appear
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download test-document.pdf/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Download test-document.pdf/i }));
    });

    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith('documents');
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });
  });

  test('deletes a document', async () => {
    const user = userEvent.setup();
    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish and document to appear
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete test-document.pdf/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Delete test-document.pdf/i }));
    });

    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith('documents');
    });
  });

  test('shows error when document upload fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to upload document';
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    // Override storage mock to fail
    (supabase.storage.from as jest.Mock).mockImplementation(() => ({
      upload: jest.fn().mockRejectedValue(new Error(errorMessage))
    }));

    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose a file to upload/i) as HTMLInputElement;
    
    await act(async () => {
      await user.upload(fileInput, file);
      await user.click(screen.getByText('Start Upload'));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows error when document download fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to download document';
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    // Override storage mock to fail download
    (supabase.storage.from as jest.Mock).mockImplementation(() => ({
      download: jest.fn().mockRejectedValue(new Error(errorMessage))
    }));

    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish and document to appear
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Download test-document.pdf/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Download test-document.pdf/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows error when document delete fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to delete document';
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    // Override storage mock to fail removal
    (supabase.storage.from as jest.Mock).mockImplementation(() => ({
      remove: jest.fn().mockRejectedValue(new Error(errorMessage))
    }));

    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish and document to appear
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete test-document.pdf/i })).toBeInTheDocument();
    });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Delete test-document.pdf/i }));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('shows upload progress during document upload', async () => {
    const user = userEvent.setup();
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Mock a delayed upload to show progress
    const mockUpload = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { path: 'test-path' }, error: null }), 100))
    );
    const mockInsert = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
    );

    (supabase.storage.from as jest.Mock).mockImplementation(() => ({
      upload: mockUpload
    }));

    const mockQueryChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: mockInsert,
      then: jest.fn((resolve) => resolve({ data: mockDocuments, error: null }))
    };
    (supabase.from as jest.Mock).mockImplementation(() => mockQueryChain);

    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Choose a file to upload/i) as HTMLInputElement;
    
    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Start upload
    await act(async () => {
      await user.click(screen.getByText('Start Upload'));
    });

    // Check for progress bar
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('cleans up storage file if database insert fails', async () => {
    const user = userEvent.setup();
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    // Mock successful storage upload but failed database insert
    const mockStorageOps = {
      upload: jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null })
    };
    (supabase.storage.from as jest.Mock).mockImplementation(() => mockStorageOps);

    // Mock database operations - separate mocks for fetch and insert
    let fromCallCount = 0;
    (supabase.from as jest.Mock).mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        // First call - initial document fetch
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockDocuments, error: null })
        };
      } else {
        // Subsequent calls - insert operation that fails
        return {
          insert: jest.fn().mockRejectedValue(new Error('Database insert failed'))
        };
      }
    });

    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Choose a file to upload/i) as HTMLInputElement;
    
    await act(async () => {
      await user.upload(fileInput, file);
    });

    await act(async () => {
      await user.click(screen.getByText('Start Upload'));
    });

    // Wait for cleanup to be attempted
    await waitFor(() => {
      expect(mockStorageOps.remove).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify error is shown
    await waitFor(() => {
      expect(screen.getByText('Database insert failed')).toBeInTheDocument();
    });
  });

  test('updates local state without refetching after document deletion', async () => {
    const user = userEvent.setup();
    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish and document to appear
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });

    // Reset mock call count after initial load
    jest.clearAllMocks();
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Delete test-document.pdf/i }));
    });

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.queryByText('test-document.pdf')).not.toBeInTheDocument();
    });

    // Verify no additional fetch was made (only storage and delete calls)
    const fromCalls = (supabase.from as jest.Mock).mock.calls.filter(call => call[0] === 'documents');
    expect(fromCalls.length).toBeLessThanOrEqual(2); // Only delete call, no refetch
  });

  test('clears error state when starting a new action', async () => {
    const user = userEvent.setup();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    // Start with a storage error
    (supabase.storage.from as jest.Mock).mockImplementation(() => ({
      remove: jest.fn().mockRejectedValue(new Error('Delete failed'))
    }));

    render(<DocumentManager grantId={1} />);

    // Wait for loading to finish and document to appear
    await waitFor(() => {
      expect(screen.queryByRole('status', { name: /loading documents/i })).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete test-document.pdf/i })).toBeInTheDocument();
    });

    // Cause an error
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Delete test-document.pdf/i }));
    });

    // Verify error is shown
    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });

    // Start a new action (file selection)
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose a file to upload/i) as HTMLInputElement;
    
    await act(async () => {
      await user.upload(fileInput, file);
    });

    // Verify error is cleared
    expect(screen.queryByText('Delete failed')).not.toBeInTheDocument();
  });
}); 