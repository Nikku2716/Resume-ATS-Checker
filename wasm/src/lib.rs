pub mod action_verbs;
pub mod experience;
pub mod formatting;
pub mod keywords;
pub mod recommendations;
pub mod result;
pub mod scoring;
pub mod sections;
pub mod skills;
pub mod tokenize;

pub use result::{
    AnalysisMetadata, AnalysisResponse, AtsRisk, ImprovementSuggestion, KeywordMatch, SectionScore,
};
pub use scoring::AtsScorer;

pub fn analyze(resume_text: &str, job_description: &str) -> AnalysisResponse {
    let scorer = AtsScorer::new();
    scorer.analyze(resume_text, job_description)
}
