/**
 * ResumeLint ATS Engine Type Definitions
 * Specification Version: 1.0.0
 * Conforms to docs/ats-contract.md
 */

export interface SectionScore {
  name: string;
  score: number;
  weight: number;
  details: string;
}

export interface KeywordMatch {
  keyword: string;
  matched: boolean;
  context?: string | null;
  variants?: string[] | null;
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface AtsRisk {
  risk: string;
  severity: SeverityLevel;
  detail: string;
}

export interface ImprovementSuggestion {
  category: string;
  priority: SeverityLevel;
  suggestion: string;
  location: string;
}

export interface AnalysisMetadata {
  engine: string;
  duration_ms: number;
  resume_length: number;
  job_description_length: number;
}

export interface AnalysisResponse {
  overall_score: number;
  section_scores: SectionScore[];
  matched_keywords: KeywordMatch[];
  missing_keywords: KeywordMatch[];
  ats_risks: AtsRisk[];
  suggestions: ImprovementSuggestion[];
  detected_sections: string[];
  missing_sections: string[];
  summary: string;
  engine_version: string;
  contract_version: string;
  metadata: AnalysisMetadata;
}

export interface AnalysisRequest {
  resume_text: string;
  job_description: string;
  options?: {
    max_keywords?: number;
    include_metadata?: boolean;
  };
}

export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'error';

export interface EngineInfo {
  engineVersion: string;
  contractVersion: string;
  status: EngineStatus;
  error?: string | null;
}
