import { useState } from 'react'
import TaskManager from './TaskManager'
import CommentSection from './CommentSection'
import DocumentManager from './DocumentManager'

interface Grant {
  id: number
  name: string
  funder: string
  description: string
  amount_string: string
  due_date: string
  status: string
  source_url: string
  created_at: string
  updated_at: string
}

interface GrantDetailPageProps {
  grant: Grant
  onBack: () => void
  onStatusChange?: (grantId: number, newStatus: string) => void
}

interface EligibilityReport {
  score: number
  keyAlignment: string[]
  potentialDisqualifiers: string[]
  missingInformation: string[]
}

export default function GrantDetailPage({ grant, onBack }: GrantDetailPageProps) {
  const [error, setError] = useState<string | null>(null)
  const [eligibilityReport, setEligibilityReport] = useState<EligibilityReport | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [currentStatus] = useState(grant.status)
  
  // AI Grant Writer states
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [generatingResponse, setGeneratingResponse] = useState(false)
  const [responseOptions, setResponseOptions] = useState<any[]>([])
  const [selectedTone, setSelectedTone] = useState<'professional' | 'academic' | 'conversational' | 'persuasive'>('professional')
  const [selectedLength, setSelectedLength] = useState<'brief' | 'medium' | 'detailed'>('medium')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [savedResponses, setSavedResponses] = useState<any[]>([])
  const [responseHistory, setResponseHistory] = useState<any[]>([])
  const [conversationHistory, setConversationHistory] = useState<any[]>([])
  const [showConversation, setShowConversation] = useState(false)

  // Active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'documents' | 'comments'>('overview')

  const handleCheckEligibility = async () => {
    setCheckingEligibility(true)
    setError(null)

    try {
      // Simulate AI eligibility check - in real implementation, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock eligibility report
      const mockReport: EligibilityReport = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100%
        keyAlignment: [
          'Organization type matches grant criteria',
          'Focus area aligns with funder priorities',
          'Previous experience in similar projects',
          'Strong community partnerships'
        ],
        potentialDisqualifiers: [
          'Annual revenue may exceed maximum threshold',
          'Geographic location restrictions may apply'
        ],
        missingInformation: [
          'Current financial statements required',
          'Board resolution for grant application',
          'Detailed project budget breakdown'
        ]
      }

      setEligibilityReport(mockReport)
    } catch (err) {
      setError('Failed to check eligibility. Please try again.')
    } finally {
      setCheckingEligibility(false)
    }
  }

  const handleGenerateAIResponse = async () => {
    if (!aiQuestion.trim()) return

    setGeneratingResponse(true)
    setError(null)

    try {
      // Simulate AI response generation with multiple options
      await new Promise(resolve => setTimeout(resolve, 3000))

      const generateResponseByToneAndLength = (tone: string, length: string) => {
        const baseResponses = {
          professional: {
            brief: "Our organization possesses the requisite expertise and proven track record to successfully deliver this project. With established community partnerships and demonstrated capacity in similar initiatives, we are well-positioned to achieve the outlined objectives.",
            medium: "Our organization brings extensive experience and proven capabilities to this important initiative. Through our established track record in community engagement and project delivery, we have developed the expertise necessary to achieve meaningful outcomes. Our approach combines evidence-based practices with innovative solutions tailored to meet specific community needs. We have successfully managed similar projects, demonstrating our ability to deliver results within budget and timeline constraints.",
            detailed: "Our organization is uniquely qualified to undertake this critical initiative, bringing together extensive experience, proven methodologies, and deep community connections. Over the past [X] years, we have successfully delivered [number] similar projects, consistently achieving measurable outcomes and positive community impact.\n\nOur comprehensive approach encompasses three key phases: strategic planning and stakeholder engagement, implementation with continuous monitoring, and evaluation with sustainability planning. During the planning phase, we conduct thorough needs assessments and establish clear success metrics. Our implementation methodology emphasizes community participation, evidence-based practices, and adaptive management to ensure optimal outcomes.\n\nThe expected impact includes [specific measurable outcomes], with benefits extending to [target population]. Our evaluation framework incorporates both quantitative indicators and qualitative assessments to capture the full scope of project impact and inform future improvements."
          },
          academic: {
            brief: "The proposed research methodology aligns with established theoretical frameworks and employs rigorous analytical approaches. Our institutional capacity and scholarly expertise position us to contribute meaningful insights to the field.",
            medium: "This research initiative builds upon existing theoretical foundations while introducing innovative methodological approaches. Our interdisciplinary team brings together expertise from [relevant fields], enabling comprehensive analysis of complex issues. The proposed methodology incorporates both quantitative and qualitative research methods, ensuring robust data collection and analysis. Our institutional resources and established research partnerships provide the necessary infrastructure to support this important scholarly work.",
            detailed: "This research proposal addresses a critical gap in the existing literature and employs a comprehensive methodological framework designed to generate significant scholarly contributions. Our interdisciplinary approach integrates theoretical perspectives from [field 1], [field 2], and [field 3], providing a holistic understanding of the research questions.\n\nThe methodology encompasses three phases: systematic literature review and theoretical framework development, empirical data collection using mixed-methods approaches, and comprehensive analysis with peer review validation. Our data collection strategy includes [specific methods], ensuring methodological rigor and reliability. The analytical framework employs [specific analytical approaches], with findings subject to rigorous peer review processes.\n\nExpected outcomes include peer-reviewed publications in high-impact journals, conference presentations, and practical applications for policy development. The research will contribute to theoretical understanding while providing evidence-based recommendations for practitioners and policymakers."
          },
          conversational: {
            brief: "We're excited about this opportunity and believe our team is perfect for this project. Our community connections and hands-on experience make us the right choice to create real, lasting change.",
            medium: "We're genuinely excited about this opportunity to make a difference in our community. Our team has been working in this space for years, and we've seen firsthand what works and what doesn't. We know the challenges, but more importantly, we know how to overcome them. Our approach is practical and community-focused – we listen, we learn, and we adapt. We've built strong relationships with local partners who share our vision, and together we can create something truly impactful.",
            detailed: "We're thrilled to have the opportunity to work on this important project. As a team, we've been passionate about this cause for years, and we've learned so much from our community along the way.\n\nOur story started when we realized that traditional approaches weren't working. So we decided to do things differently. We spent time listening to community members, understanding their real needs, and building genuine partnerships. This grassroots approach has been the foundation of everything we do.\n\nWhat makes us different? We're not just implementing a program – we're building a movement. Our team includes people who have lived these experiences, community leaders who understand the local context, and professionals who bring technical expertise. Together, we create solutions that are both innovative and practical.\n\nWe're committed to transparency, community ownership, and sustainable change. This isn't just about meeting grant requirements – it's about creating lasting impact that will benefit our community for years to come."
          },
          persuasive: {
            brief: "This grant represents a unique opportunity to achieve transformational change. Our organization's proven track record, innovative approach, and deep community commitment make us the ideal partner to maximize impact and deliver exceptional results.",
            medium: "This grant opportunity aligns perfectly with our organization's mission and proven capabilities. We don't just meet the requirements – we exceed them. Our track record speaks for itself: [X]% success rate, [number] lives impacted, and [specific achievements]. But numbers only tell part of the story. What sets us apart is our unwavering commitment to excellence and our innovative approach to complex challenges. We see opportunities where others see obstacles, and we have the expertise and passion to turn vision into reality.",
            detailed: "This grant represents more than funding – it's an investment in proven excellence and transformational change. Our organization stands uniquely positioned to deliver extraordinary results that will resonate far beyond the grant period.\n\nWhy choose us? The evidence is compelling:\n• Proven track record: [X]% success rate across [number] projects\n• Measurable impact: [specific outcomes] achieved consistently\n• Innovation leadership: Pioneering approaches that others now follow\n• Community trust: Deep relationships built over [X] years of service\n• Financial stewardship: Consistently under budget, always on time\n\nOur approach doesn't just meet grant objectives – it transforms communities. We combine cutting-edge methodologies with grassroots wisdom, creating solutions that are both innovative and sustainable. Our team includes recognized experts, community champions, and emerging leaders who bring fresh perspectives to complex challenges.\n\nThe opportunity before us is extraordinary. With your partnership, we will not only achieve the stated outcomes but create a model for others to follow. This grant will catalyze change that extends far beyond our immediate community, creating ripple effects that will benefit countless others."
          }
        };

        return (baseResponses as any)[tone]?.[length] || baseResponses.professional.medium;
      };

      // Generate multiple response options
      const options = [
        {
          id: 1,
          tone: selectedTone,
          length: selectedLength,
          response: generateResponseByToneAndLength(selectedTone, selectedLength),
          wordCount: generateResponseByToneAndLength(selectedTone, selectedLength).split(' ').length,
          readabilityScore: Math.floor(Math.random() * 20) + 70
        },
        {
          id: 2,
          tone: selectedTone === 'professional' ? 'persuasive' : 'professional',
          length: selectedLength,
          response: generateResponseByToneAndLength(selectedTone === 'professional' ? 'persuasive' : 'professional', selectedLength),
          wordCount: generateResponseByToneAndLength(selectedTone === 'professional' ? 'persuasive' : 'professional', selectedLength).split(' ').length,
          readabilityScore: Math.floor(Math.random() * 20) + 70
        },
        {
          id: 3,
          tone: 'conversational',
          length: selectedLength,
          response: generateResponseByToneAndLength('conversational', selectedLength),
          wordCount: generateResponseByToneAndLength('conversational', selectedLength).split(' ').length,
          readabilityScore: Math.floor(Math.random() * 20) + 70
        }
      ];

      setResponseOptions(options)
      setAiResponse(options[0].response)

      // Add to conversation history
      const conversationEntry = {
        id: Date.now(),
        question: aiQuestion,
        response: options[0].response,
        timestamp: new Date().toISOString(),
        options: options,
        tone: selectedTone,
        length: selectedLength
      };
      setConversationHistory(prev => [...prev, conversationEntry]);

      // Add to response history (for backwards compatibility)
      const historyEntry = {
        question: aiQuestion,
        timestamp: new Date().toISOString(),
        options: options
      };
      setResponseHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10

      // Clear the input for next question
      setAiQuestion('');

    } catch (err) {
      setError('Failed to generate response. Please try again.')
    } finally {
      setGeneratingResponse(false)
    }
  }

  const saveResponse = (response: any) => {
    const savedResponse = {
      id: Date.now(),
      question: aiQuestion,
      response: response.response,
      tone: response.tone,
      length: response.length,
      grantName: grant.name,
      savedAt: new Date().toISOString()
    };
    setSavedResponses(prev => [savedResponse, ...prev]);
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  const selectResponse = (response: any) => {
    setAiResponse(response.response);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'potential':
        return 'bg-gray-100 text-gray-800'
      case 'drafting':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'successful':
        return 'bg-green-100 text-green-800'
      case 'unsuccessful':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Grant Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{grant.name}</h1>
            <p className="text-lg text-gray-600 font-medium">{grant.funder}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentStatus)}`}>
              {currentStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Grant Amount</label>
            <p className="text-lg font-semibold text-green-600">{grant.amount_string || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <p className="text-lg font-semibold text-gray-600">
              {grant.due_date ? new Date(grant.due_date).toLocaleDateString() : 'No due date'}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{grant.description}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Co-Pilot Action Panel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Grant Co-Pilot</h2>
        
        {!eligibilityReport ? (
          <button
            onClick={handleCheckEligibility}
            disabled={checkingEligibility}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {checkingEligibility ? 'Checking Eligibility...' : 'Check Eligibility'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Eligibility Score: {eligibilityReport.score}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${eligibilityReport.score}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Key Alignment</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {eligibilityReport.keyAlignment.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Potential Disqualifiers</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {eligibilityReport.potentialDisqualifiers.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Missing Information</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {eligibilityReport.missingInformation.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-yellow-500 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Grant Writer */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">🤖 AI Grant Writer Assistant</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConversation(!showConversation)}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              {showConversation ? 'Hide Conversation' : `Show Conversation (${conversationHistory.length})`}
            </button>
            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {showAdvancedOptions ? 'Hide Options' : 'Show Advanced Options'}
            </button>
          </div>
        </div>

        {/* Conversation History */}
        {showConversation && conversationHistory.length > 0 && (
          <div className="mb-6 border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
            <h3 className="text-lg font-medium text-purple-900 mb-4">💬 Conversation History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((entry, index) => (
                <div key={entry.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900 text-sm">
                      Q{index + 1}: {entry.question}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{entry.tone}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{entry.length}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {entry.response}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setAiResponse(entry.response)}
                        className="text-xs text-blue-600 hover:text-blue-500"
                      >
                        Use This Response
                      </button>
                      <button
                        onClick={() => copyToClipboard(entry.response)}
                        className="text-xs text-gray-600 hover:text-gray-500"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => saveResponse(entry.options[0])}
                        className="text-xs text-green-600 hover:text-green-500"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Question Input */}
          <div>
            <label htmlFor="ai-question" className="block text-sm font-medium text-gray-700 mb-2">
              {conversationHistory.length === 0 ? 'Grant Application Question' : `Next Question (${conversationHistory.length + 1})`}
            </label>
            {conversationHistory.length === 0 && (
              <p className="text-sm text-gray-600 mb-2">
                💡 <strong>Pro tip:</strong> Ask multiple questions to build a comprehensive application! Start with one section, then ask follow-up questions to refine and expand your responses.
              </p>
            )}
            <textarea
              id="ai-question"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={conversationHistory.length === 0 
                ? "e.g., 'Describe your organization's capacity to deliver this project and demonstrate your track record of successful community engagement...'"
                : "Ask a follow-up question or explore a different section of the application..."
              }
            />
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="professional">Professional</option>
                  <option value="academic">Academic/Research</option>
                  <option value="conversational">Conversational</option>
                  <option value="persuasive">Persuasive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value as any)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="brief">Brief (50-100 words)</option>
                  <option value="medium">Medium (150-300 words)</option>
                  <option value="detailed">Detailed (400+ words)</option>
                </select>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerateAIResponse}
            disabled={!aiQuestion.trim() || generatingResponse}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {generatingResponse ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Draft Responses...
              </span>
            ) : (
              conversationHistory.length === 0 
                ? '✨ Generate Multiple Draft Responses' 
                : `💬 Continue Conversation (Question ${conversationHistory.length + 1})`
            )}
          </button>

          {/* Response Options */}
          {responseOptions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Generated Response Options</h3>
              
              <div className="grid gap-4">
                {responseOptions.map((option, index) => (
                  <div key={option.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600">Option {index + 1}</span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {option.tone}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {option.length}
                        </span>
                        <span className="text-xs text-gray-500">{option.wordCount} words</span>
                        <span className="text-xs text-gray-500">Readability: {option.readabilityScore}%</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => selectResponse(option)}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          Select
                        </button>
                        <button
                          onClick={() => copyToClipboard(option.response)}
                          className="text-sm text-gray-600 hover:text-gray-500"
                        >
                          Copy
                        </button>
                        <button
                          onClick={() => saveResponse(option)}
                          className="text-sm text-green-600 hover:text-green-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap">
                      {option.response}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Response */}
          {aiResponse && responseOptions.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Selected Response (Ready to Use)
                </label>
                <button
                  onClick={() => copyToClipboard(aiResponse)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
              </div>
            </div>
          )}

          {/* Response History */}
          {responseHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Questions</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {responseHistory.map((entry, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md text-sm">
                    <div className="font-medium text-gray-700 truncate">{entry.question}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(entry.timestamp).toLocaleDateString()} • {entry.options.length} responses generated
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Responses Library */}
          {savedResponses.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">💾 Saved Responses Library</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedResponses.map((saved) => (
                  <div key={saved.id} className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                        {saved.question}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setAiResponse(saved.response)}
                          className="text-xs text-blue-600 hover:text-blue-500"
                        >
                          Use
                        </button>
                        <button
                          onClick={() => copyToClipboard(saved.response)}
                          className="text-xs text-gray-600 hover:text-gray-500"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {saved.grantName} • {saved.tone} • {new Date(saved.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'tasks', label: 'Tasks', icon: '✅' },
              { id: 'documents', label: 'Documents', icon: '📁' },
              { id: 'comments', label: 'Comments', icon: '💬' }
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
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Grant Overview</h3>
              <div className="prose max-w-none">
                <p>This is the main overview section where you can add additional grant details, notes, and planning information.</p>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskManager grantId={grant.id} />
          )}

          {activeTab === 'documents' && (
            <DocumentManager grantId={grant.id} />
          )}

          {activeTab === 'comments' && (
            <CommentSection grantId={grant.id} />
          )}
        </div>
      </div>
    </div>
  )
}
