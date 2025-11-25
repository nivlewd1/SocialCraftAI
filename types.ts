import React from 'react';
// FIX: Import the correct operation type from the SDK to ensure type compatibility.
import type { GenerateVideosOperation } from '@google/genai';

export enum Platform {
  Twitter = 'Twitter',
  LinkedIn = 'LinkedIn',
  Instagram = 'Instagram',
  TikTok = 'TikTok',
  Pinterest = 'Pinterest'
}

// New types for advanced format selection
export type PlatformFormat = 'Auto' | 'Text' | 'Carousel' | 'Poll' | 'Reel' | 'Standard Pin' | 'Video Pin' | 'Idea Pin';

export interface PlatformConfig {
  format: PlatformFormat;
}

export type PlatformSelections = Partial<Record<Platform, PlatformConfig>>;

export type Tone = 'Auto' | 'Funny' | 'Professional' | 'Crass' | 'Novel' | 'Educational' | 'Sentimental' | 'Inspirational' | 'Urgent' | 'Authoritative' | 'Conversational';

export type SearchIntent = 'Auto' | 'Informational' | 'Commercial' | 'Transactional';


export interface GeneratedContent {
  platform: Platform;
  primaryContent: string;
  engagementPotential: number;
  analysis: {
    emotionalTriggers: string[];
    viralPatterns: string[];
    audienceValue: string;
  };
  hashtags: string[];
  variations: string[];
  optimizationTips: string[];
  thread?: string[]; // Optional: For creating Twitter threads
  engagementStrategy?: string[]; // Optional: Suggested replies/comments for Twitter
  carouselSlides?: string[]; // Optional: For LinkedIn/Instagram carousels
  poll?: { // Optional: For LinkedIn polls
    question: string;
    options: string[];
  };
  firstComment?: string; // Optional: For LinkedIn's "link in comment" strategy
  reelScript?: { // Optional: For Instagram Reels
    hook: string;
    scenes: string[];
    cta: string;
    audioSuggestion: string;
  };
  tiktokScript?: { // Optional: For TikTok SEO-optimized videos
    hook: string;
    scenes: string[];
    cta: string;
    audioSuggestion: string;
    seoKeywords: string[];
    onScreenTextSuggestion: string;
    spokenKeywordsSuggestion: string;
  };
  pinterestPin?: { // Optional: For Pinterest SEO-optimized pins
    title: string;
    description: string;
    visualSuggestion: string;
    keywords: string[];
    boardName: string;
    outboundLinkSuggestion: string;
  };
}

export enum PlaybookCategory {
  ProductLaunch = 'Product Launch',
  ThoughtLeadership = 'Thought Leadership',
  CompanyNews = 'Company News',
  EventPromotion = 'Event Promotion',
  Engagement = 'Engagement',
}

export interface Playbook {
  title: string;
  description: string;
  platforms: Platform[];
  category: PlaybookCategory;
  content: string;
  icon?: React.ReactNode; // Made optional to match requested version
  successRate?: number; // Added property
}

// FIX: Replaced the incomplete custom interface with a type alias for the SDK's GenerateVideosOperation type.
// This resolves the type error by ensuring the full, correct object structure is used.
export type VideoOperation = GenerateVideosOperation;

export interface Draft {
  id: string;
  title: string;
  createdAt: string;
  sourceContent: string;
  authorsVoice?: string;
  platformSelections: PlatformSelections;
  tone: Tone;
  searchIntent: SearchIntent;
  results: GeneratedContent[];
}

export interface SavedMedia {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string;
  createdAt: string;
}

export interface Trend {
  trendTitle: string;
  description: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

// Result from findTrends() - quick research in GeneratorView
export interface TrendAnalysisResult {
  overallSummary: string;
  identifiedTrends: Trend[];
  relatedKeywords: string[];
  sources: GroundingSource[];
}

export interface ScheduledPost {
  id: string;
  scheduledAt: string; // ISO string
  status: 'scheduled' | 'posted';
  content: GeneratedContent;
}

export interface UploadedImage {
  data: string; // base64 encoded string
  mimeType: string;
  name: string;
}

// Source type for unified trend research
export type TrendSourceType = 'quick' | 'deep';

// Unified TrendReport type - works with both quick and deep research
export interface TrendReport {
  id: string;
  date: string;
  niche: string;
  content: string | null;                    // Full markdown content (deep) or null (quick)
  sources: { title: string; url: string }[];
  sourceType: TrendSourceType;               // 'quick' = Generator, 'deep' = Trend Scout
  identifiedTrends?: Trend[];                // Structured trends (quick research only)
  relatedKeywords?: string[];                // Keywords (quick research only)
  overallSummary?: string;                   // Summary (quick research only)
}

// Helper type for creating TrendReport from TrendAnalysisResult
export interface QuickResearchInput {
  topic: string;
  analysisResult: TrendAnalysisResult;
}

export interface GeneratedPost {
  platform: Platform;
  content: string;
  hashtags: string[];
  imagePrompt?: string;
}

export interface BrandPersona {
  name: string;
  tone: string;
  audience: string;
}

// Navigation state types for passing data between views
export interface AmplifierNavigationState {
  report?: TrendReport;
  fromGenerator?: boolean;
}

export interface TrendScoutNavigationState {
  initialTopic?: string;
  quickResearch?: TrendAnalysisResult;
}

export interface GeneratorNavigationState {
  playbookContent?: string;
  draftToLoad?: Draft;
  trendToUse?: Trend;
}
