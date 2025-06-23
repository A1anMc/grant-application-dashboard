interface GrantFiltersProps {
  onFilterChange: (filters: { status: string; search: string; sortBy: string }) => void
}

export default function GrantFilters({ onFilterChange }: GrantFiltersProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    onFilterChange({ 
      status: name === 'status' ? value : document.querySelector<HTMLSelectElement>('select[name="status"]')?.value || 'all',
      search: name === 'search' ? value : document.querySelector<HTMLInputElement>('input[name="search"]')?.value || '',
      sortBy: name === 'sortBy' ? value : document.querySelector<HTMLSelectElement>('select[name="sortBy"]')?.value || 'due_date'
    })
  }

  return (
    <div className="bg-white shadow sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search grants..."
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              id="status"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="potential">Potential</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              name="sortBy"
              id="sortBy"
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="due_date">Due Date</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="created_at">Date Added</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
} 