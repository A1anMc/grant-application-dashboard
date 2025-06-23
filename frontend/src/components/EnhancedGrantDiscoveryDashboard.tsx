import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Target, Search, ExternalLink, Download, Star, Zap, ArrowRight } from 'lucide-react';

interface Grant {
  title: string;
  source: string;
  amount: string;
  due_date: string;
  summary: string;
  eligibility: string;
  tags: string[];
  url: string;
  pdf_url?: string;
  score: number;
  notes?: string;
  grant_type: string;
  urgency: string;
  estimated_eligibility: string;
  open_date?: string;
  recurrence?: string;
}

interface DiscoveryStats {
  totalGrants: number;
  highRelevanceGrants: number;
  urgentGrants: number;
  averageScore: number;
  topSources: { source: string; count: number }[];
  topTags: { tag: string; count: number }[];
}

const EnhancedGrantDiscoveryDashboard: React.FC = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([]);
  const [stats, setStats] = useState<DiscoveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('score');
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Demo data with comprehensive Australian grants from multiple sources
  const demoGrants: Grant[] = [
    // FEDERAL GRANTS
    {
      title: "First Nations Arts and Culture Program",
      source: "Creative Australia (Federal)",
      amount: "$10,000 - $150,000",
      due_date: "15 July 2025",
      summary: "Support for First Nations artists and cultural practitioners to create, present and distribute their work. Priority for projects that strengthen cultural protocols and community engagement.",
      eligibility: "First Nations artists, cultural practitioners, and organisations. Must demonstrate connection to community and cultural protocols.",
      tags: ["Documentary", "Short Film", "Digital Content", "Podcast", "Animation", "Community", "Education", "Social Impact", "Co-Design", "Storytelling for Change", "Australian Stories", "National", "Intergenerational", "Systemic Change"],
      url: "https://www.nsw.gov.au/grants-and-funding/arts-and-cultural-funding-program",
      pdf_url: "https://australiacouncil.gov.au/workspace/uploads/files/first-nations-guidelines.pdf",
      score: 95,
      grant_type: "Cultural Development",
      urgency: "Hot",
      estimated_eligibility: "ELIGIBLE via First Nations partnership",
      open_date: "1 December 2024",
      recurrence: "Annual"
    },
    {
      title: "Documentary Producer Program",
      source: "Screen Australia (Federal)",
      amount: "$20,000 - $500,000",
      due_date: "30 August 2025",
      summary: "Development and production funding for documentary projects that reflect Australian stories and perspectives. Priority for projects addressing social issues, environment, and diverse communities.",
      eligibility: "Independent production companies with demonstrated track record. Must have Australian content and creative control.",
      tags: ["Documentary", "Feature Film", "TV/Web Series", "Community", "Social Impact", "Environmental", "Justice", "Storytelling for Change", "Policy Influence", "Australian Stories", "National", "Systemic Change"],
      url: "https://www.screenaustralia.gov.au/funding-and-support/documentary/production/producer-program",
      pdf_url: "https://www.screenaustralia.gov.au/getmedia/documentary-guidelines.pdf",
      score: 92,
      grant_type: "Production Funding",
      urgency: "Normal",
      estimated_eligibility: "Perfect match – Lock it in",
      open_date: "1 February 2025",
      recurrence: "Ongoing"
    },
    {
      title: "Community Broadcasting Foundation",
      source: "Department of Infrastructure (Federal)",
      amount: "$5,000 - $35,000",
      due_date: "15 August 2025",
      summary: "Support for community radio and television stations to produce local content, including documentary series, cultural programming, and community storytelling projects.",
      eligibility: "Community broadcasting organisations, not-for-profit media groups, and local content creators working with community stations.",
      tags: ["Documentary", "TV/Web Series", "Podcast", "Community", "Regional & Remote", "Social Impact", "Storytelling for Change", "Australian Stories", "National", "Co-Design"],
      url: "https://www.infrastructure.gov.au/media-communications/television-radio/community-broadcasting-foundation",
      score: 82,
      grant_type: "Media Funding",
      urgency: "Hot",
      estimated_eligibility: "Strong match – Send it",
      open_date: "1 May 2025",
      recurrence: "Annual"
    },
    {
      title: "Australia Council Arts Projects",
      source: "Australia Council for the Arts (Federal)",
      amount: "$5,000 - $60,000",
      due_date: "31 July 2025",
      summary: "Support for individual artists and small organisations to create new work, develop skills, and engage audiences. Priority for innovative projects that reflect contemporary Australian culture.",
      eligibility: "Individual artists, small arts organisations, and creative collectives. Must demonstrate artistic merit and community engagement.",
      tags: ["Documentary", "Short Film", "Digital Content", "Interactive Media", "Animation", "Community", "Education", "Social Impact", "Storytelling for Change", "Australian Stories", "National"],
      url: "https://australiacouncil.gov.au/funding/funding-index/arts-projects/",
      score: 85,
      grant_type: "Arts Development",
      urgency: "Hot",
      estimated_eligibility: "DIRECTLY ELIGIBLE - Apply as lead",
      open_date: "1 April 2025",
      recurrence: "Quarterly"
    },

    // VICTORIA STATE GRANTS
    {
      title: "Creative Victoria Arts Grants",
      source: "Creative Victoria (State)",
      amount: "$15,000 - $100,000",
      due_date: "10 September 2025",
      summary: "Support for Victorian artists and organisations to create innovative work that engages communities. Priority for projects addressing social issues through creative practice.",
      eligibility: "Victorian-based artists, arts organisations, and creative practitioners. Must demonstrate Victorian community benefit.",
      tags: ["Documentary", "Short Film", "Feature Film", "Digital Content", "Interactive Media", "Community", "Social Impact", "Justice", "Storytelling for Change", "Melbourne-Based"],
      url: "https://creative.vic.gov.au/grants-and-support/grants/arts-grants",
      score: 88,
      grant_type: "State Arts Funding",
      urgency: "Normal",
      estimated_eligibility: "Strong match – Send it",
      open_date: "1 June 2025",
      recurrence: "Bi-annual"
    },
    {
      title: "VicScreen Documentary Development",
      source: "VicScreen (State)",
      amount: "$25,000 - $150,000",
      due_date: "5 October 2025",
      summary: "Development funding for documentary projects with Victorian connections. Focus on stories that reflect diverse Victorian communities and contemporary social issues.",
      eligibility: "Victorian production companies and filmmakers. Must have Victorian content, cast, crew, or post-production.",
      tags: ["Documentary", "Feature Film", "TV/Web Series", "Community", "Social Impact", "Environmental", "Justice", "Storytelling for Change", "Policy Influence", "Melbourne-Based"],
      url: "https://www.vicscreen.vic.gov.au/funding/documentary",
      score: 90,
      grant_type: "Film Development",
      urgency: "Normal",
      estimated_eligibility: "Perfect match – Lock it in",
      open_date: "15 July 2025",
      recurrence: "Ongoing"
    },
    {
      title: "Multicultural Arts Victoria",
      source: "Multicultural Arts Victoria (State)",
      amount: "$3,000 - $25,000",
      due_date: "25 September 2025",
      summary: "Support for culturally diverse artists and communities to create and present work that celebrates multicultural Victoria. Priority for cross-cultural collaboration projects.",
      eligibility: "Culturally diverse artists, multicultural organisations, and cross-cultural creative projects based in Victoria.",
      tags: ["Documentary", "Short Film", "Digital Content", "Community", "Co-Design", "Storytelling for Change", "Australian Stories", "Melbourne-Based", "Intergenerational"],
      url: "https://multiculturalarts.com.au/grants/",
      score: 78,
      grant_type: "Cultural Arts",
      urgency: "Normal",
      estimated_eligibility: "Good match – Consider it",
      open_date: "1 August 2025",
      recurrence: "Annual"
    },

    // LOCAL COUNCIL GRANTS
    {
      title: "Melbourne City Council Arts Grants",
      source: "City of Melbourne (Council)",
      amount: "$2,000 - $30,000",
      due_date: "20 August 2025",
      summary: "Support for arts projects that activate Melbourne's cultural precincts and engage local communities. Priority for projects in laneways, public spaces, and community venues.",
      eligibility: "Artists and organisations based in or creating work for Melbourne City. Must demonstrate community engagement and public benefit.",
      tags: ["Documentary", "Short Film", "Digital Content", "Interactive Media", "Community", "Social Impact", "Storytelling for Change", "Australian Stories", "Melbourne-Based"],
      url: "https://www.melbourne.vic.gov.au/arts-and-culture/funding-and-support/grants",
      score: 83,
      grant_type: "Local Arts",
      urgency: "Hot",
      estimated_eligibility: "Strong match – Send it",
      open_date: "15 June 2025",
      recurrence: "Annual"
    },
    {
      title: "Yarra City Council Cultural Grants",
      source: "City of Yarra (Council)",
      amount: "$1,000 - $15,000",
      due_date: "30 September 2025",
      summary: "Funding for cultural projects that strengthen community connections and celebrate Yarra's diverse creative communities. Support for festivals, exhibitions, and community arts projects.",
      eligibility: "Artists, cultural organisations, and community groups based in or serving the City of Yarra.",
      tags: ["Documentary", "Short Film", "Digital Content", "Community", "Education", "Social Impact", "Co-Design", "Storytelling for Change", "Melbourne-Based"],
      url: "https://www.yarracity.vic.gov.au/services/grants/cultural-grants",
      score: 75,
      grant_type: "Local Cultural",
      urgency: "Normal",
      estimated_eligibility: "Good match – Consider it",
      open_date: "1 July 2025",
      recurrence: "Annual"
    },
    {
      title: "Moreland City Council Arts Grants",
      source: "Moreland City Council (Council)",
      amount: "$500 - $10,000",
      due_date: "15 October 2025",
      summary: "Support for arts and cultural activities that build community capacity and celebrate local stories. Priority for projects involving young people and multicultural communities.",
      eligibility: "Individual artists, arts organisations, and community groups based in or serving Moreland City.",
      tags: ["Documentary", "Short Film", "Digital Content", "Community", "Education", "Social Impact", "Co-Design", "Australian Stories", "Melbourne-Based", "Intergenerational"],
      url: "https://www.moreland.vic.gov.au/living-in-moreland/grants/arts-grants",
      score: 72,
      grant_type: "Community Arts",
      urgency: "Normal",
      estimated_eligibility: "Worth exploring",
      open_date: "15 August 2025",
      recurrence: "Annual"
    },

    // SMARTYGRANTS PLATFORM GRANTS
    {
      title: "Lord Mayor's Charitable Foundation",
      source: "LMCF via SmartyGrants",
      amount: "$10,000 - $80,000",
      due_date: "12 September 2025",
      summary: "Support for innovative projects addressing social disadvantage through creative and cultural programs. Priority for projects serving vulnerable communities in Melbourne.",
      eligibility: "Not-for-profit organisations working with disadvantaged communities. Must demonstrate measurable social impact.",
      tags: ["Documentary", "Short Film", "Digital Content", "Community", "Social Impact", "Justice", "Co-Design", "Storytelling for Change", "Melbourne-Based"],
      url: "https://lmcf.smartygrants.com.au/",
      score: 86,
      grant_type: "Social Innovation",
      urgency: "Normal",
      estimated_eligibility: "Strong match – Send it",
      open_date: "1 July 2025",
      recurrence: "Ongoing"
    },
    {
      title: "Gandel Foundation Creative Communities",
      source: "Gandel Foundation via SmartyGrants",
      amount: "$5,000 - $50,000",
      due_date: "28 August 2025",
      summary: "Funding for creative projects that build stronger, more connected communities. Support for arts education, cultural programs, and community storytelling initiatives.",
      eligibility: "Arts organisations, educational institutions, and community groups. Must demonstrate community benefit and cultural impact.",
      tags: ["Documentary", "Short Film", "Digital Content", "Community", "Education", "Social Impact", "Co-Design", "Storytelling for Change", "Intergenerational"],
      url: "https://gandelfoundation.smartygrants.com.au/",
      score: 81,
      grant_type: "Community Development",
      urgency: "Hot",
      estimated_eligibility: "Strong match – Send it",
      open_date: "15 June 2025",
      recurrence: "Bi-annual"
    },
    {
      title: "Myer Foundation Arts & Culture",
      source: "Myer Foundation via SmartyGrants",
      amount: "$20,000 - $100,000",
      due_date: "18 October 2025",
      summary: "Support for arts and cultural projects that create positive social change. Priority for projects addressing inequality, mental health, and community wellbeing through creative practice.",
      eligibility: "Established arts organisations and social enterprises. Must demonstrate track record and measurable outcomes.",
      tags: ["Documentary", "Feature Film", "Digital Content", "Community", "Health & Wellbeing", "Social Impact", "Justice", "Storytelling for Change", "Policy Influence", "Australian Stories", "Systemic Change"],
      url: "https://myerfoundation.smartygrants.com.au/",
      score: 87,
      grant_type: "Social Arts",
      urgency: "Normal",
      estimated_eligibility: "Perfect match – Lock it in",
      open_date: "1 August 2025",
      recurrence: "Annual"
    },

    // ADDITIONAL FEDERAL & SPECIALIST GRANTS
    {
      title: "Australian Cultural Fund",
      source: "Creative Australia (Federal)",
      amount: "$2,000 - $20,000",
      due_date: "Ongoing",
      summary: "Crowdfunding platform for creative projects with matched funding from Creative Australia. Support for innovative arts, cultural, and creative projects across all artforms.",
      eligibility: "Australian artists, creative practitioners, and cultural organisations. Projects must demonstrate public benefit and artistic merit.",
      tags: ["Documentary", "Short Film", "Feature Film", "Digital Content", "Interactive Media", "Animation", "Community", "Education", "Social Impact", "Australian Stories", "National"],
      url: "https://www.australianculturalfund.org.au/",
      score: 79,
      grant_type: "Crowdfunding",
      urgency: "Normal",
      estimated_eligibility: "Good match – Consider it",
      open_date: "Ongoing",
      recurrence: "Ongoing"
    },
    {
      title: "Regional Arts Development Fund",
      source: "Regional Arts Australia (Federal)",
      amount: "$1,000 - $25,000",
      due_date: "22 September 2025",
      summary: "Support for arts and cultural projects in regional and remote areas. Priority for projects that build local capacity, engage youth, and preserve cultural heritage.",
      eligibility: "Regional arts organisations, community groups, and individual artists based outside major metropolitan areas.",
      tags: ["Documentary", "Short Film", "Digital Content", "Community", "Education", "Australian Stories", "Intergenerational", "Regional"],
      url: "https://regionalartsaustralia.org.au/funding/",
      score: 70,
      grant_type: "Regional Development",
      urgency: "Normal",
      estimated_eligibility: "Partner regionally - Consider location",
      open_date: "1 July 2025",
      recurrence: "Annual"
    }
  ];

  useEffect(() => {
    // Simulate loading with film grain effect
    setTimeout(() => {
      setGrants(demoGrants);
      setFilteredGrants(demoGrants);
      calculateStats(demoGrants);
      setLoading(false);
    }, 1200);
  }, []);

  const calculateStats = (grantsData: Grant[]) => {
    const totalGrants = grantsData.length;
    const highRelevanceGrants = grantsData.filter(g => g.score >= 80).length;
    const urgentGrants = grantsData.filter(g => g.urgency === 'Hot').length;
    const averageScore = Math.round(grantsData.reduce((sum, g) => sum + g.score, 0) / totalGrants);

    const sourceCounts: { [key: string]: number } = {};
    const tagCounts: { [key: string]: number } = {};

    grantsData.forEach(grant => {
      sourceCounts[grant.source] = (sourceCounts[grant.source] || 0) + 1;
      grant.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    setStats({
      totalGrants,
      highRelevanceGrants,
      urgentGrants,
      averageScore,
      topSources,
      topTags
    });
  };

  useEffect(() => {
    const filtered = grants.filter(grant => {
      const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          grant.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          grant.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSource = !selectedSource || grant.source === selectedSource;
      const matchesUrgency = !selectedUrgency || grant.urgency === selectedUrgency;
      const matchesScore = grant.score >= minScore;

      return matchesSearch && matchesSource && matchesUrgency && matchesScore;
    });

    // Sort grants
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'due_date':
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredGrants(filtered);
  }, [grants, searchTerm, selectedSource, selectedUrgency, minScore, sortBy]);

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'Hot': 
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-orange-500/20',
          text: 'text-red-400',
          border: 'border-red-500/30',
          glow: 'shadow-red-500/20'
        };
      default: 
        return {
          bg: 'bg-gradient-to-r from-teal-500/10 to-blue-500/10',
          text: 'text-teal-400',
          border: 'border-teal-500/30',
          glow: 'shadow-teal-500/20'
        };
    }
  };

  const getScoreStyles = (score: number) => {
    if (score >= 90) return {
      bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30'
    };
    if (score >= 80) return {
      bg: 'bg-gradient-to-r from-teal-500/20 to-green-500/20',
      text: 'text-teal-400',
      border: 'border-teal-500/30'
    };
    if (score >= 70) return {
      bg: 'bg-gradient-to-r from-blue-500/20 to-teal-500/20',
      text: 'text-blue-400',
      border: 'border-blue-500/30'
    };
    return {
      bg: 'bg-gradient-to-r from-gray-500/20 to-gray-600/20',
      text: 'text-gray-400',
      border: 'border-gray-500/30'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] relative overflow-hidden">
        {/* Film grain overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}></div>
        
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-2 border-orange-500/30 rounded-full animate-spin border-t-orange-500"></div>
              <div className="absolute inset-0 w-16 h-16 border border-orange-500/10 rounded-full animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-200 tracking-wide">SCANNING OPPORTUNITIES</h3>
              <p className="text-stone-400 text-sm uppercase tracking-wider">Australian Grant Intelligence</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] relative">
      {/* Film grain overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }}></div>
      
      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Target className="text-white" size={18} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-100 tracking-tight">
                  GRANT INTEL
                </h1>
                <p className="text-stone-400 text-sm uppercase tracking-wider font-medium">
                  Shadow Goose • Australian Funding Opportunities
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
              className="px-4 py-2 bg-stone-800/50 border border-stone-700/50 text-stone-300 rounded-lg hover:bg-stone-700/50 transition-all duration-200 backdrop-blur-sm"
            >
              {viewMode === 'cards' ? 'LIST VIEW' : 'CARD VIEW'}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-orange-500/25 font-medium">
              <Download size={16} />
              EXPORT DATA
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 backdrop-blur-sm border border-stone-700/30 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-xs uppercase tracking-wider font-medium mb-1">TOTAL INTEL</p>
                  <p className="text-3xl font-bold text-stone-100">{stats.totalGrants}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
                  <Target className="text-teal-400" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 backdrop-blur-sm border border-stone-700/30 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-xs uppercase tracking-wider font-medium mb-1">HIGH VALUE</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.highRelevanceGrants}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                  <Star className="text-yellow-400" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 backdrop-blur-sm border border-stone-700/30 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-xs uppercase tracking-wider font-medium mb-1">CLOSING SOON</p>
                  <p className="text-3xl font-bold text-red-400">{stats.urgentGrants}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="text-red-400" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-stone-800/40 to-stone-900/40 backdrop-blur-sm border border-stone-700/30 p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-xs uppercase tracking-wider font-medium mb-1">AVG MATCH</p>
                  <p className="text-3xl font-bold text-teal-400">{stats.averageScore}%</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-teal-400" size={20} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-to-br from-stone-800/30 to-stone-900/30 backdrop-blur-sm border border-stone-700/30 p-6 rounded-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400" size={16} />
                <input
                  type="text"
                  placeholder="Hunt for opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-stone-900/50 border border-stone-700/50 rounded-lg text-stone-200 placeholder-stone-500 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-4 py-3 bg-stone-900/50 border border-stone-700/50 rounded-lg text-stone-200 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
            >
              <option value="">ALL SOURCES</option>
              <option value="Creative Australia">Creative Australia</option>
              <option value="Screen Australia">Screen Australia</option>
              <option value="Australia Council for the Arts">Australia Council</option>
            </select>

            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-4 py-3 bg-stone-900/50 border border-stone-700/50 rounded-lg text-stone-200 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
            >
              <option value="">ALL URGENCY</option>
              <option value="Hot">🔥 HOT</option>
              <option value="Normal">STANDARD</option>
            </select>

            <div>
              <label className="block text-xs text-stone-400 uppercase tracking-wider font-medium mb-2">
                MIN SCORE: {minScore}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full h-2 bg-stone-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #ea580c 0%, #ea580c ${minScore}%, #44403c ${minScore}%, #44403c 100%)`
                }}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-stone-900/50 border border-stone-700/50 rounded-lg text-stone-200 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 backdrop-blur-sm"
            >
              <option value="score">SORT BY SCORE</option>
              <option value="due_date">SORT BY DEADLINE</option>
              <option value="title">SORT BY TITLE</option>
            </select>
          </div>
        </div>

        {/* Category Tags */}
        {stats && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-stone-200 mb-4 uppercase tracking-wide">ACTIVE CATEGORIES</h3>
            <div className="flex flex-wrap gap-3">
              {stats.topTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 text-teal-400 rounded-full text-sm font-medium hover:from-teal-500/30 hover:to-blue-500/30 transition-all duration-200 backdrop-blur-sm shadow-lg shadow-teal-500/10"
                >
                  {tag.toUpperCase()} ({count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grants Display */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-stone-200 uppercase tracking-wide">
              OPPORTUNITIES ({filteredGrants.length} of {grants.length})
            </h3>
          </div>

          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredGrants.map((grant, index) => {
                const urgencyStyles = getUrgencyStyles(grant.urgency);
                const scoreStyles = getScoreStyles(grant.score);
                
                return (
                  <div
                    key={index}
                    className={`group relative bg-gradient-to-br from-stone-800/40 to-stone-900/40 backdrop-blur-sm border ${urgencyStyles.border} rounded-xl p-6 hover:shadow-2xl hover:${urgencyStyles.glow} transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
                    onClick={() => setSelectedGrant(grant)}
                  >
                    {/* Urgency indicator */}
                    {grant.urgency === 'Hot' && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                        <Zap size={12} className="text-white" />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-stone-100 mb-2 group-hover:text-orange-400 transition-colors duration-200">
                          {grant.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-stone-400 mb-3">
                          <span className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {grant.amount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {grant.due_date}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 ${scoreStyles.bg} ${scoreStyles.border} border rounded-full`}>
                          <span className={`text-sm font-bold ${scoreStyles.text}`}>
                            {grant.score}%
                          </span>
                        </div>
                        <div className={`px-3 py-1 ${urgencyStyles.bg} ${urgencyStyles.border} border rounded-full`}>
                          <span className={`text-xs font-medium ${urgencyStyles.text} uppercase tracking-wide`}>
                            {grant.urgency === 'Hot' ? '🔥 HOT' : 'STANDARD'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-stone-300 mb-4 line-clamp-2 leading-relaxed">
                      {grant.summary}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {grant.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-stone-700/50 text-stone-300 rounded text-xs uppercase tracking-wide font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {grant.tags.length > 3 && (
                        <span className="px-2 py-1 bg-stone-700/50 text-stone-300 rounded text-xs uppercase tracking-wide font-medium">
                          +{grant.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-stone-700/30">
                      <div className="text-sm">
                        <p className="text-stone-400 uppercase tracking-wide font-medium mb-1">ELIGIBILITY</p>
                        <p className={`font-medium ${grant.estimated_eligibility.includes('Go!') ? 'text-green-400' : grant.estimated_eligibility.includes('Perfect') ? 'text-yellow-400' : 'text-teal-400'}`}>
                          {grant.estimated_eligibility}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="text-stone-400 group-hover:text-orange-400 transition-colors duration-200" size={16} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGrants.map((grant, index) => {
                const urgencyStyles = getUrgencyStyles(grant.urgency);
                const scoreStyles = getScoreStyles(grant.score);
                
                return (
                  <div
                    key={index}
                    className={`group bg-gradient-to-r from-stone-800/30 to-stone-900/30 backdrop-blur-sm border ${urgencyStyles.border} rounded-lg p-4 hover:shadow-lg hover:${urgencyStyles.glow} transition-all duration-200 cursor-pointer`}
                    onClick={() => setSelectedGrant(grant)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <h4 className="text-lg font-bold text-stone-100 group-hover:text-orange-400 transition-colors duration-200">
                            {grant.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 ${scoreStyles.bg} ${scoreStyles.border} border rounded`}>
                              <span className={`text-xs font-bold ${scoreStyles.text}`}>
                                {grant.score}%
                              </span>
                            </div>
                            {grant.urgency === 'Hot' && (
                              <div className="px-2 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded">
                                <span className="text-xs font-medium text-red-400 uppercase tracking-wide">
                                  🔥 HOT
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-stone-400 mt-1">
                          <span>{grant.amount}</span>
                          <span>Due: {grant.due_date}</span>
                          <span>{grant.source}</span>
                        </div>
                      </div>
                      <ArrowRight className="text-stone-400 group-hover:text-orange-400 transition-colors duration-200" size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredGrants.length === 0 && (
            <div className="text-center py-16">
              <div className="text-stone-500 mb-6">
                <Search size={64} className="mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-stone-300 mb-3 uppercase tracking-wide">NO INTEL FOUND</h3>
              <p className="text-stone-400">Adjust your hunt parameters and try again.</p>
            </div>
          )}
        </div>

        {/* Grant Detail Modal */}
        {selectedGrant && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-stone-800/90 to-stone-900/90 backdrop-blur-lg border border-stone-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-stone-100 mb-2">{selectedGrant.title}</h2>
                    <p className="text-stone-400 uppercase tracking-wider text-sm font-medium">{selectedGrant.source}</p>
                  </div>
                  <button
                    onClick={() => setSelectedGrant(null)}
                    className="text-stone-400 hover:text-stone-200 text-3xl font-light transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">GRANT INTEL</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-stone-400">Amount:</span>
                          <span className="text-stone-200 font-medium">{selectedGrant.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Deadline:</span>
                          <span className="text-stone-200 font-medium">{selectedGrant.due_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Type:</span>
                          <span className="text-stone-200 font-medium">{selectedGrant.grant_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-stone-400">Frequency:</span>
                          <span className="text-stone-200 font-medium">{selectedGrant.recurrence}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">MATCH ANALYSIS</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400">Score:</span>
                          <div className={`px-3 py-1 ${getScoreStyles(selectedGrant.score).bg} ${getScoreStyles(selectedGrant.score).border} border rounded-full`}>
                            <span className={`font-bold ${getScoreStyles(selectedGrant.score).text}`}>
                              {selectedGrant.score}%
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-400">Priority:</span>
                          <div className={`px-3 py-1 ${getUrgencyStyles(selectedGrant.urgency).bg} ${getUrgencyStyles(selectedGrant.urgency).border} border rounded-full`}>
                            <span className={`text-xs font-medium ${getUrgencyStyles(selectedGrant.urgency).text} uppercase tracking-wide`}>
                              {selectedGrant.urgency === 'Hot' ? '🔥 HOT' : 'STANDARD'}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <span className="text-stone-400 block mb-1">Eligibility:</span>
                          <span className={`font-medium ${selectedGrant.estimated_eligibility.includes('Go!') ? 'text-green-400' : selectedGrant.estimated_eligibility.includes('Perfect') ? 'text-yellow-400' : 'text-teal-400'}`}>
                            {selectedGrant.estimated_eligibility}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">OVERVIEW</h3>
                    <p className="text-stone-300 leading-relaxed">{selectedGrant.summary}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">ELIGIBILITY REQUIREMENTS</h3>
                    <p className="text-stone-300 leading-relaxed">{selectedGrant.eligibility}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">CATEGORIES</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedGrant.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 text-teal-400 rounded-full text-sm font-medium"
                        >
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-stone-700/30">
                  <a
                    href={selectedGrant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-orange-500/25 font-bold uppercase tracking-wide"
                  >
                    <ExternalLink size={16} />
                    LOCK IT IN
                  </a>
                  {selectedGrant.pdf_url && (
                    <a
                      href={selectedGrant.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 border border-stone-600 text-stone-300 rounded-lg hover:bg-stone-700/50 transition-all duration-200 font-medium uppercase tracking-wide"
                    >
                      <Download size={16} />
                      GET BRIEF
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedGrantDiscoveryDashboard; 