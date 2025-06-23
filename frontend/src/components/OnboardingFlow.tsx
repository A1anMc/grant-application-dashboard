import { useState } from 'react'
import { supabase } from '../supabaseClient'

interface OnboardingFlowProps {
  onComplete: () => void
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

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: keyof OrganizationProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleFocusAreaToggle = (area: string) => {
    setProfile(prev => ({
      ...prev,
      primary_focus_areas: prev.primary_focus_areas.includes(area)
        ? prev.primary_focus_areas.filter(a => a !== area)
        : [...prev.primary_focus_areas, area]
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('organization_profiles')
        .insert({
          ...profile,
          user_id: user.id,
          primary_focus_areas: JSON.stringify(profile.primary_focus_areas)
        })

      if (error) throw error

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving your profile')
    } finally {
      setLoading(false)
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profile.organization_name.trim() !== '' && profile.abn.trim() !== ''
      case 2:
        return profile.organization_type !== ''
      case 3:
        return profile.primary_focus_areas.length > 0
      case 4:
        return true // Optional step
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">The Basics</h3>
              <div className="space-y-4">
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
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Status</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
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
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Focus</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select your primary focus areas (choose as many as apply):
              </p>
              <div className="grid grid-cols-2 gap-3">
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
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Story</h3>
              <p className="text-sm text-gray-600 mb-4">
                Paste your standard organizational history or boilerplate text. This will be used to help match you with relevant grants.
              </p>
              <textarea
                value={profile.organization_history}
                onChange={(e) => handleInputChange('organization_history', e.target.value)}
                rows={8}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Tell us about your organization's history, mission, and key achievements..."
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of 4
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / 4) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome! Let's set up your organization profile
              </h2>
              <p className="mt-2 text-gray-600">
                This will help us find the most relevant grants for your organization
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Step Content */}
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 