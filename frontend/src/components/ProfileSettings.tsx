import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

interface User {
  id: string
  email: string
}

interface OrganizationProfile {
  organization_name: string
  abn: string
  website: string
  dgr_status: boolean
  charity_status: boolean
  organization_type: string
  primary_focus_areas: string[]
  organization_history: string
}

const ORGANIZATION_TYPES = [
  'Not-for-Profit',
  'Social Enterprise',
  'Individual Artist',
  'Charity',
  'Community Group',
  'Educational Institution',
  'Government Agency',
  'Other'
]

const FOCUS_AREAS = [
  'Youth Services',
  'Environmental Conservation',
  'Screen Production',
  'Medical Research',
  'Education',
  'Arts & Culture',
  'Community Development',
  'Health & Wellbeing',
  'Technology',
  'Social Justice',
  'Animal Welfare',
  'Disability Services',
  'Mental Health',
  'Indigenous Affairs',
  'Women\'s Services',
  'Aged Care',
  'Housing',
  'Food Security',
  'Climate Action',
  'Innovation'
]

export default function ProfileSettings() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<OrganizationProfile>({
    organization_name: '',
    abn: '',
    website: '',
    dgr_status: false,
    charity_status: false,
    organization_type: '',
    primary_focus_areas: [],
    organization_history: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile')

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const fetchUserAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      setUser({ id: user.id, email: user.email || '' })

      // Fetch organization profile
      const { data: profileData } = await supabase
        .from('organization_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileData) {
        setProfile({
          ...profileData,
          primary_focus_areas: JSON.parse(profileData.primary_focus_areas || '[]')
        })
      }
    } catch (err) {
      console.error('Error fetching user/profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof OrganizationProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleFocusAreaToggle = (area: string) => {
    setProfile(prev => ({
      ...prev,
      primary_focus_areas: prev.primary_focus_areas.includes(area)
        ? prev.primary_focus_areas.filter(a => a !== area)
        : [...prev.primary_focus_areas, area]
    }))
    setError(null)
    setSuccess(null)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user) throw new Error('No authenticated user')

      const profileData = {
        ...profile,
        user_id: user.id,
        primary_focus_areas: JSON.stringify(profile.primary_focus_areas)
      }

      const { error } = await supabase
        .from('organization_profiles')
        .upsert(profileData)

      if (error) throw error

      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email)
      if (error) throw error
      setSuccess('Password reset email sent!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send password reset email')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-gray-600">Manage your organization profile and account settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: 'profile', label: 'Organization Profile', icon: '🏢' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' },
              { id: 'security', label: 'Security', icon: '🔒' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          {/* Organization Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      id="organization_name"
                      value={profile.organization_name}
                      onChange={(e) => handleInputChange('organization_name', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your organization name"
                    />
                  </div>

                  <div>
                    <label htmlFor="abn" className="block text-sm font-medium text-gray-700">
                      ABN *
                    </label>
                    <input
                      type="text"
                      id="abn"
                      value={profile.abn}
                      onChange={(e) => handleInputChange('abn', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your ABN"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      value={profile.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="organization_type" className="block text-sm font-medium text-gray-700">
                      Organization Type *
                    </label>
                    <select
                      id="organization_type"
                      value={profile.organization_type}
                      onChange={(e) => handleInputChange('organization_type', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select organization type</option>
                      {ORGANIZATION_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.dgr_status}
                      onChange={(e) => handleInputChange('dgr_status', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">DGR Status</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.charity_status}
                      onChange={(e) => handleInputChange('charity_status', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Charity Status</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Focus Areas</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select your primary focus areas (choose as many as apply):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FOCUS_AREAS.map(area => (
                    <label key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.primary_focus_areas.includes(area)}
                        onChange={() => handleFocusAreaToggle(area)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Organization History</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Provide your standard organizational history or boilerplate text. This will be used to help match you with relevant grants.
                </p>
                <textarea
                  value={profile.organization_history}
                  onChange={(e) => handleInputChange('organization_history', e.target.value)}
                  rows={8}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tell us about your organization's history, mission, and key achievements..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email notifications for new grant opportunities</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email notifications for application deadlines</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Weekly digest of relevant grants</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Marketing emails and updates</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Display Preferences</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Default View Mode</label>
                    <select className="mt-1 block w-full md:w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>Kanban Board</option>
                      <option>List View</option>
                      <option>Calendar View</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Items per page</label>
                    <select className="mt-1 block w-full md:w-1/3 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Email Address</h4>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-600">Last updated: Never</p>
                    </div>
                    <button
                      onClick={handlePasswordReset}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Login Activity</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Current Session</h4>
                        <p className="text-sm text-gray-600">MacBook Pro • Sydney, NSW • Now</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Data & Privacy</h3>
                <div className="space-y-4">
                  <button className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors">
                    <h4 className="font-medium text-gray-900">Download Your Data</h4>
                    <p className="text-sm text-gray-600">Get a copy of all your data in JSON format</p>
                  </button>

                  <button className="w-full text-left bg-red-50 hover:bg-red-100 rounded-lg p-4 transition-colors">
                    <h4 className="font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 