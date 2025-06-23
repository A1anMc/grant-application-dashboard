import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

interface Grant {
  id: number
  name: string
  funder: string
  due_date: string
  status: string
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  grants: Grant[]
}

export default function GrantCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGrants()
  }, [])

  useEffect(() => {
    generateCalendarDays()
  }, [currentDate, grants])

  async function fetchGrants() {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select('id, name, funder, due_date, status')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })

      if (error) throw error

      setGrants(data || [])
    } catch (err) {
      console.error('Error fetching grants:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching grants')
    } finally {
      setLoading(false)
    }
  }

  function generateCalendarDays() {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    const startDate = new Date(firstDayOfMonth)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    const endDate = new Date(lastDayOfMonth)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayGrants = grants.filter(grant => {
        const grantDate = new Date(grant.due_date)
        return grantDate.getDate() === date.getDate() &&
               grantDate.getMonth() === date.getMonth() &&
               grantDate.getFullYear() === date.getFullYear()
      })
      
      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getDate() === today.getDate() &&
                 date.getMonth() === today.getMonth() &&
                 date.getFullYear() === today.getFullYear(),
        grants: dayGrants
      })
    }
    
    setCalendarDays(days)
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const statusColors = {
    potential: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    submitted: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={previousMonth}
              type="button"
              className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextMonth}
              type="button"
              className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700">
          <div className="bg-white py-2">Sun</div>
          <div className="bg-white py-2">Mon</div>
          <div className="bg-white py-2">Tue</div>
          <div className="bg-white py-2">Wed</div>
          <div className="bg-white py-2">Thu</div>
          <div className="bg-white py-2">Fri</div>
          <div className="bg-white py-2">Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, dayIdx) => (
            <div
              key={dayIdx}
              className={`min-h-32 bg-white px-3 py-2 ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${day.isToday ? 'font-semibold text-blue-600' : ''}`}
            >
              <time dateTime={day.date.toISOString()}>
                {day.date.getDate()}
              </time>
              <ol className="mt-2">
                {day.grants.map((grant) => (
                  <li key={grant.id} className="group flex">
                    <p className={`
                      flex-auto truncate rounded-md px-2 py-1 text-xs font-medium
                      ${statusColors[grant.status as keyof typeof statusColors]}
                    `}>
                      {grant.name}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 