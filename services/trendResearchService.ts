import { supabase } from '../config/supabase';
import type { TrendReport, TrendAnalysisResult, Trend, TrendSourceType } from '../types';
import type { Database } from '../database.types';

type TrendReportRow = Database['public']['Tables']['trend_reports']['Row'];
type TrendReportInsert = Database['public']['Tables']['trend_reports']['Insert'];

/**
 * Trend Research Service
 * Unified API for managing trend research from both GeneratorView and TrendsAgent
 */
export const trendResearchService = {
  /**
   * Save quick research from GeneratorView (Research Topic button)
   * Converts TrendAnalysisResult to unified TrendReport format
   */
  async saveQuickResearch(
    topic: string,
    analysisResult: TrendAnalysisResult
  ): Promise<TrendReport> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Convert GroundingSource format (uri) to TrendReport format (url)
    const sources = analysisResult.sources.map(source => ({
      title: source.title,
      url: source.uri
    }));

    const insert: TrendReportInsert = {
      user_id: user.id,
      niche: topic,
      content: null, // Quick research doesn't have full markdown content
      sources: sources,
      source_type: 'quick',
      identified_trends: analysisResult.identifiedTrends,
      related_keywords: analysisResult.relatedKeywords,
      overall_summary: analysisResult.overallSummary
    };

    const { data, error } = await supabase
      .from('trend_reports')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error saving quick research:', error);
      throw error;
    }

    return this.dbToTrendReport(data);
  },

  /**
   * Save deep research from TrendsAgent (Trend Scout)
   * This is the existing flow, now using the unified format
   */
  async saveDeepResearch(
    niche: string,
    content: string,
    sources: { title: string; url: string }[]
  ): Promise<TrendReport> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const insert: TrendReportInsert = {
      user_id: user.id,
      niche: niche,
      content: content,
      sources: sources,
      source_type: 'deep',
      identified_trends: null,
      related_keywords: null,
      overall_summary: null
    };

    const { data, error } = await supabase
      .from('trend_reports')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error saving deep research:', error);
      throw error;
    }

    return this.dbToTrendReport(data);
  },

  /**
   * Get all research for the current user (both quick and deep)
   */
  async getAllResearch(limit: number = 20): Promise<TrendReport[]> {
    const { data, error } = await supabase
      .from('trend_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching research:', error);
      throw error;
    }

    return (data || []).map(row => this.dbToTrendReport(row));
  },

  /**
   * Get research filtered by source type
   */
  async getResearchByType(
    sourceType: TrendSourceType,
    limit: number = 20
  ): Promise<TrendReport[]> {
    const { data, error } = await supabase
      .from('trend_reports')
      .select('*')
      .eq('source_type', sourceType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching research by type:', error);
      throw error;
    }

    return (data || []).map(row => this.dbToTrendReport(row));
  },

  /**
   * Get a single research report by ID
   */
  async getResearchById(id: string): Promise<TrendReport | null> {
    const { data, error } = await supabase
      .from('trend_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching research:', error);
      throw error;
    }

    return this.dbToTrendReport(data);
  },

  /**
   * Delete a research report
   */
  async deleteResearch(id: string): Promise<void> {
    const { error } = await supabase
      .from('trend_reports')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting research:', error);
      throw error;
    }
  },

  /**
   * Convert quick research (TrendAnalysisResult) to TrendReport format
   * Useful for navigation without saving to database
   */
  convertQuickToReport(
    topic: string,
    analysisResult: TrendAnalysisResult
  ): TrendReport {
    return {
      id: `temp-${Date.now()}`, // Temporary ID for unsaved reports
      date: new Date().toLocaleDateString(),
      niche: topic,
      content: null,
      sources: analysisResult.sources.map(s => ({ title: s.title, url: s.uri })),
      sourceType: 'quick',
      identifiedTrends: analysisResult.identifiedTrends,
      relatedKeywords: analysisResult.relatedKeywords,
      overallSummary: analysisResult.overallSummary
    };
  },

  /**
   * Generate markdown content from quick research for display in Amplifier
   * This creates a pseudo-report from structured trend data
   */
  generateMarkdownFromQuickResearch(report: TrendReport): string {
    if (report.sourceType !== 'quick' || !report.identifiedTrends) {
      return report.content || '';
    }

    let markdown = `## Quick Research: ${report.niche}\n\n`;
    
    if (report.overallSummary) {
      markdown += `**Summary:** ${report.overallSummary}\n\n`;
    }

    markdown += `### Identified Trends\n\n`;
    report.identifiedTrends.forEach((trend, index) => {
      markdown += `**${index + 1}. ${trend.trendTitle}**\n`;
      markdown += `${trend.description}\n\n`;
    });

    if (report.relatedKeywords && report.relatedKeywords.length > 0) {
      markdown += `### Related Keywords\n\n`;
      markdown += report.relatedKeywords.join(', ') + '\n\n';
    }

    return markdown;
  },

  /**
   * Convert database row to TrendReport type
   */
  dbToTrendReport(row: TrendReportRow): TrendReport {
    // Parse sources from JSON
    const sources = (row.sources as { title: string; url: string }[]) || [];
    
    // Parse identified_trends from JSON if present
    const identifiedTrends = row.identified_trends 
      ? (row.identified_trends as Trend[])
      : undefined;
    
    // Parse related_keywords from JSON if present
    const relatedKeywords = row.related_keywords
      ? (row.related_keywords as string[])
      : undefined;

    return {
      id: row.id,
      date: new Date(row.created_at).toLocaleDateString(),
      niche: row.niche,
      content: row.content,
      sources: sources,
      sourceType: (row.source_type as TrendSourceType) || 'deep',
      identifiedTrends: identifiedTrends,
      relatedKeywords: relatedKeywords,
      overallSummary: row.overall_summary || undefined
    };
  },

  /**
   * Subscribe to research changes (real-time)
   */
  subscribeToResearch(callback: () => void) {
    const channel = supabase
      .channel('trend-research-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trend_reports',
        },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
