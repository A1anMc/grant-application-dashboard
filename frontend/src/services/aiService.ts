import { supabase } from '../supabaseClient';

export interface EligibilityResult {
  score: number;
  eligible: boolean;
  confidence: number;
  reasons: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  recommendations: string[];
  riskFactors: string[];
  timeline: {
    preparation: string;
    submission: string;
    review: string;
  };
}

export interface GrantWritingRequest {
  question: string;
  context: {
    grantTitle: string;
    grantDescription: string;
    organizationProfile: any;
    previousResponses?: string[];
  };
  tone?: 'professional' | 'academic' | 'conversational' | 'persuasive';
  length?: 'brief' | 'medium' | 'detailed';
}

export interface GrantWritingResponse {
  response: string;
  alternatives: string[];
  keyPoints: string[];
  improvementSuggestions: string[];
  wordCount: number;
  readabilityScore: number;
}

export interface DocumentAnalysis {
  summary: string;
  keyRequirements: string[];
  deadlines: string[];
  budgetRequirements: string[];
  eligibilityCriteria: string[];
  evaluationCriteria: string[];
  documentType: 'guidelines' | 'application' | 'report' | 'other';
  complexity: 'low' | 'medium' | 'high';
  estimatedCompletionTime: string;
}

export interface SmartSuggestion {
  type: 'deadline_reminder' | 'missing_document' | 'improvement_tip' | 'opportunity';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
  dueDate?: string;
  relatedGrantId?: number;
}

class AIService {
  async checkEligibility(
    grantData: any
  ): Promise<EligibilityResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResult: EligibilityResult = {
        score: Math.floor(Math.random() * 40) + 60,
        eligible: true,
        confidence: Math.floor(Math.random() * 30) + 70,
        reasons: {
          positive: [
            'Organization type matches grant requirements',
            'Strong track record in similar projects',
            'Geographic location is eligible',
            'Organization size fits criteria'
          ],
          negative: [
            'Limited experience in this specific focus area',
            'Tight timeline for preparation'
          ],
          neutral: [
            'Budget requirements are at the upper limit',
            'Competition expected to be moderate'
          ]
        },
        recommendations: [
          'Emphasize past successes in community engagement',
          'Include detailed budget breakdown with contingencies',
          'Highlight partnerships with local organizations',
          'Provide clear measurement metrics for outcomes'
        ],
        riskFactors: [
          'Application deadline is approaching quickly',
          'Grant requires matching funds which may be challenging',
          'Reporting requirements are extensive'
        ],
        timeline: {
          preparation: '3-4 weeks for thorough application',
          submission: '2 weeks before deadline recommended',
          review: '8-12 weeks typical review period'
        }
      };

      await this.saveAIResponse('eligibility_check', grantData.id, mockResult);
      return mockResult;
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw new Error('Failed to analyze grant eligibility. Please try again.');
    }
  }

  async generateGrantResponse(request: GrantWritingRequest): Promise<GrantWritingResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const length = request.length || 'medium';
      const responses = {
        brief: this.generateBriefResponse(request),
        medium: this.generateMediumResponse(request),
        detailed: this.generateDetailedResponse(request)
      };

      const mainResponse = responses[length];
      
      const mockResult: GrantWritingResponse = {
        response: mainResponse,
        alternatives: [
          this.generateAlternativeResponse(request, 1),
          this.generateAlternativeResponse(request, 2)
        ],
        keyPoints: [
          'Clear alignment with grant objectives',
          'Specific, measurable outcomes',
          'Strong community impact focus',
          'Sustainable long-term approach'
        ],
        improvementSuggestions: [
          'Consider adding more specific metrics',
          'Include testimonials or case studies',
          'Strengthen the evaluation methodology',
          'Add details about risk mitigation'
        ],
        wordCount: mainResponse.split(' ').length,
        readabilityScore: Math.floor(Math.random() * 20) + 70
      };

      return mockResult;
    } catch (error) {
      console.error('Error generating grant response:', error);
      throw new Error('Failed to generate grant response. Please try again.');
    }
  }

  private generateBriefResponse(request: GrantWritingRequest): string {
    return `Our organization is well-positioned to address the objectives outlined in "${request.context.grantTitle}". With our proven track record and community partnerships, we can deliver measurable outcomes that align with the grant's goals.`;
  }

  private generateMediumResponse(request: GrantWritingRequest): string {
    return `Our organization is uniquely qualified to undertake this important initiative outlined in "${request.context.grantTitle}". Through our extensive experience in community engagement and proven track record of successful project delivery, we have developed the expertise and partnerships necessary to achieve the grant's objectives.

Our proposed approach combines evidence-based practices with innovative solutions tailored to our community's specific needs. We will implement a comprehensive strategy that includes stakeholder engagement, measurable outcome tracking, and sustainable long-term impact.`;
  }

  private generateDetailedResponse(request: GrantWritingRequest): string {
    return `Our organization is exceptionally well-positioned to address the critical objectives outlined in "${request.context.grantTitle}". With extensive experience serving our community and a demonstrated track record of successful project implementation, we have developed the expertise, partnerships, and organizational capacity necessary to deliver outstanding results.

Project Approach and Methodology:
Our comprehensive approach will be implemented through three key phases: assessment and planning, implementation and monitoring, and evaluation and sustainability. During the assessment phase, we will conduct thorough community needs analysis and stakeholder engagement.

Expected Outcomes and Impact:
We anticipate achieving measurable improvements in key performance indicators. Our evaluation framework includes both quantitative indicators and qualitative assessments to capture the full scope of impact.`;
  }

  private generateAlternativeResponse(request: GrantWritingRequest, variant: number): string {
    const alternatives = [
      `Through our innovative approach to "${request.context.grantTitle}", we will create lasting positive change in our community.`,
      `The opportunity presented by "${request.context.grantTitle}" aligns perfectly with our organizational mission and community priorities.`
    ];
    
    return alternatives[variant - 1] || alternatives[0];
  }

  private async saveAIResponse(type: string, grantId: number, response: any): Promise<void> {
    try {
      await supabase
        .from('ai_responses')
        .insert({
          grant_id: grantId,
          response_type: type,
          question: type === 'eligibility_check' ? 'Grant eligibility analysis' : 'AI query',
          response: JSON.stringify(response),
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving AI response:', error);
    }
  }

  isAvailable(): boolean {
    return true;
  }

  getStatus(): { available: boolean; features: string[] } {
    return {
      available: true,
      features: [
        'Eligibility Checking',
        'Grant Writing Assistant',
        'Document Analysis',
        'Smart Suggestions',
        'Impact Prediction'
      ]
    };
  }
}

export const aiService = new AIService(); 