use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResponse {
    pub overall_score: i32,
    pub section_scores: Vec<SectionScore>,
    pub matched_keywords: Vec<KeywordMatch>,
    pub missing_keywords: Vec<KeywordMatch>,
    pub ats_risks: Vec<AtsRisk>,
    pub suggestions: Vec<ImprovementSuggestion>,
    pub detected_sections: Vec<String>,
    pub missing_sections: Vec<String>,
    pub summary: String,
    pub engine_version: String,
    pub contract_version: String,
    pub metadata: AnalysisMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SectionScore {
    pub name: String,
    pub score: i32,
    pub weight: f64,
    pub details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeywordMatch {
    pub keyword: String,
    pub matched: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub context: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variants: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AtsRisk {
    pub risk: String,
    pub severity: String,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImprovementSuggestion {
    pub category: String,
    pub priority: String,
    pub suggestion: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisMetadata {
    pub engine: String,
    pub duration_ms: i32,
    pub resume_length: usize,
    pub job_description_length: usize,
}
