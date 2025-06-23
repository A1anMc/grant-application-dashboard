/** @jest-environment jsdom */
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskManager from '../TaskManager';
import { supabase } from '../../supabaseClient';

// Mock the Supabase client
jest.mock('../../supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis()
    }))
  }
}));

// Mock test data
const mockTasks = [
  {
    id: 1,
    title: 'Complete application form',
    description: 'Fill out all required fields',
    status: 'pending',
    priority: 'high',
    due_date: '2024-12-31',
    assigned_to: 'test@example.com',
    grant_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    assignee_details: { email: 'test@example.com' }
  }
];

const mockUsers = [
  { id: '1', email: 'test@example.com' },
  { id: '2', email: 'admin@example.com' }
];

describe('TaskManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful mock responses
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      if (table === 'auth.users') {
        return {
          select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis()
      };
    });
  });

  test('renders loading state initially', () => {
    render(<TaskManager grantId={1} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders task list after loading', async () => {
    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    // Check task list content
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Complete application form')).toBeInTheDocument();
    expect(screen.getByText('Fill out all required fields')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();

    // Check API calls
    expect(supabase.from).toHaveBeenCalledWith('tasks');
  });

  test('shows error message when task fetch fails', async () => {
    const errorMessage = 'Failed to fetch tasks';
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockRejectedValue(new Error(errorMessage))
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays empty state when no tasks exist', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    await waitFor(() => {
      expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
    });
  });

  test('displays tasks when they exist', async () => {
    render(<TaskManager grantId={1} />);

    await waitFor(() => {
      expect(screen.getByText('Complete application form')).toBeInTheDocument();
      expect(screen.getByText('Fill out all required fields')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });
  });

  test('creates new task successfully', async () => {
    const user = userEvent.setup();
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
    
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: mockInsert,
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Open new task form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Add Task/i }));
    });
    
    // Fill out form
    await act(async () => {
      await user.type(screen.getByLabelText(/Title/i), 'New Task');
      await user.type(screen.getByLabelText(/Description/i), 'New task description');
      await user.selectOptions(screen.getByLabelText(/Priority/i), 'high');
      await user.type(screen.getByLabelText(/Due Date/i), '2024-12-31');
      await user.selectOptions(screen.getByLabelText(/Assign To/i), 'test@example.com');
    });
    
    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Create Task/i }));
    });
    
    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
        description: 'New task description',
        priority: 'high',
        due_date: '2024-12-31',
        assigned_to: 'test@example.com',
        grant_id: 1
      }));
    });
  });

  test('shows error when task creation fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to create task';
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: new Error(errorMessage) });
    
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: mockInsert,
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });
    
    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Add Task/i }));
    });
    await act(async () => {
      await user.type(screen.getByLabelText(/Title/i), 'New Task');
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Create Task/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('updates task status successfully', async () => {
    const user = userEvent.setup();
    const mockUpdate = jest.fn().mockResolvedValue({ data: null, error: null });
    
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          update: mockUpdate,
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Find the status select dropdown by aria-label
    const statusSelect = screen.getByLabelText(/Change status for Complete application form/i);
    
    await act(async () => {
      await user.selectOptions(statusSelect, 'completed');
    });
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'completed'
      }));
    });
  });

  test('deletes task successfully', async () => {
    const user = userEvent.setup();
    const mockDelete = jest.fn().mockResolvedValue({ data: null, error: null });
    
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnValue(mockDelete),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Find the delete button by aria-label
    const deleteButton = screen.getByLabelText(/Delete Complete application form/i);
    
    await act(async () => {
      await user.click(deleteButton);
    });
    
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  test('validates required fields in new task form', async () => {
    const user = userEvent.setup();
    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Add Task/i }));
    });
    
    // Try to submit empty form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Create Task/i }));
    });
    
    // Check for validation errors
    expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    
    // Fill out title field
    const titleInput = screen.getByLabelText(/Title/i);
    await act(async () => {
      await user.type(titleInput, 'New Task');
    });
    
    // Verify that the error is cleared
    expect(screen.queryByText(/Title is required/i)).not.toBeInTheDocument();
  });

  test('shows loading state during task creation', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    const mockInsert = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
    );
    
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          insert: mockInsert,
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    // Wait for initial loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Add Task/i }));
    });
    
    // Fill out form
    await act(async () => {
      await user.type(screen.getByLabelText(/Title/i), 'New Task');
      await user.type(screen.getByLabelText(/Description/i), 'New task description');
      await user.selectOptions(screen.getByLabelText(/Priority/i), 'high');
      await user.type(screen.getByLabelText(/Due Date/i), '2024-12-31');
      await user.selectOptions(screen.getByLabelText(/Assign To/i), 'test@example.com');
    });
    
    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Create Task/i }));
    });
    
    // Check for loading state
    expect(screen.getByText(/Creating.../i)).toBeInTheDocument();
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.queryByText(/Creating.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('updates local state without refetching after status change', async () => {
    const user = userEvent.setup();
    const mockUpdate = jest.fn().mockResolvedValue({ data: null, error: null });
    
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          update: mockUpdate,
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    const statusSelect = screen.getByLabelText(/Change status for Complete application form/i);
    
    await act(async () => {
      await user.selectOptions(statusSelect, 'completed');
    });
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'completed'
      }));
    });
    
    // Verify the task status was updated in the UI
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  test('clears error state when starting a new action', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to update task';
    
    // First mock an error
    const mockUpdate = jest.fn().mockResolvedValue({ data: null, error: new Error(errorMessage) });
    
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'tasks') {
        return {
          select: jest.fn().mockReturnThis(),
          update: mockUpdate,
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: mockTasks, error: null })
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: mockUsers, error: null })
      };
    });

    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Cause an error
    const statusSelect = screen.getByLabelText(/Change status for Complete application form/i);
    await act(async () => {
      await user.selectOptions(statusSelect, 'completed');
    });
    
    // Verify error is shown
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Start a new action
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Add Task/i }));
    });
    
    // Verify error is cleared
    expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
  });

  test('cancels new task form', async () => {
    const user = userEvent.setup();
    render(<TaskManager grantId={1} />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
    
    // Open form and fill some data
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Add Task/i }));
    });

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    });

    await act(async () => {
      await user.type(screen.getByLabelText(/Title/i), 'New Task');
    });
    
    // Cancel form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Cancel/i }));
    });
    
    // Verify form is closed and data is cleared
    expect(screen.queryByLabelText(/Title/i)).not.toBeInTheDocument();
    
    // Reopen form and verify it's empty
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /Add Task/i }));
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/Title/i)).toHaveValue('');
  });
}); 