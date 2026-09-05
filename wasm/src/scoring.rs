use crate::action_verbs::analyze_action_verbs;
use crate::experience::compute_experience_relevance;
use crate::formatting::{check_ats_risks, get_formatting_score};
use crate::keywords::{extract_keywords, get_keyword_score, score_keywords};
use crate::recommendations::{generate_suggestions, generate_summary};
use crate::result::{AnalysisMetadata, AnalysisResponse, SectionScore};
use crate::sections::{detect_sections, get_missing_sections, get_section_completeness_score};
use crate::skills::{get_skills_score, match_skills};

pub struct AtsScorer;

impl AtsScorer {
    pub fn new() -> Self {
        Self
    }

    pub fn analyze(&self, resume_text: &str, job_description: &str) -> AnalysisResponse {
        let resume_keywords = extract_keywords(resume_text, 100);
        let jd_keywords = extract_keywords(job_description, 100);

        let (matched_keywords, missing_keywords) = score_keywords(&resume_keywords, &jd_keywords);

        let (matched_skills, missing_skills) = match_skills(resume_text, job_description);

        let detected_sections = detect_sections(resume_text);
        let missing_sections = get_missing_sections(resume_text);

        let ats_risks = check_ats_risks(resume_text);
        let action_verb_analysis = analyze_action_verbs(resume_text);

        let keyword_score = get_keyword_score(&matched_keywords, &missing_keywords);
        let skills_score = get_skills_score(&matched_skills, &missing_skills);
        let experience_relevance_score =
            compute_experience_relevance(resume_text, job_description, &jd_keywords);
        let formatting_score = get_formatting_score(&ats_risks);
        let section_score = get_section_completeness_score(resume_text);

        let section_scores = vec![
            SectionScore {
                name: "Keyword Match".to_string(),
                score: keyword_score,
                weight: 0.30,
                details: format!(
                    "{} of {} job keywords found in resume.",
                    matched_keywords.len(),
                    matched_keywords.len() + missing_keywords.len()
                ),
            },
            SectionScore {
                name: "Skills Match".to_string(),
                score: skills_score,
                weight: 0.25,
                details: format!(
                    "{} of {} required skills found.",
                    matched_skills.len(),
                    matched_skills.len() + missing_skills.len()
                ),
            },
            SectionScore {
                name: "Experience Relevance".to_string(),
                score: experience_relevance_score,
                weight: 0.20,
                details: "Alignment between resume experience and job requirements.".to_string(),
            },
            SectionScore {
                name: "Formatting / ATS Readability".to_string(),
                score: formatting_score,
                weight: 0.15,
                details: format!(
                    "{} formatting issue(s) detected that may affect ATS parsing.",
                    ats_risks.len()
                ),
            },
            SectionScore {
                name: "Contact & Section Completeness".to_string(),
                score: section_score,
                weight: 0.10,
                details: format!(
                    "Standard sections found: {}. Missing: {}.",
                    if detected_sections.is_empty() {
                        "none".to_string()
                    } else {
                        detected_sections.join(", ")
                    },
                    if missing_sections.is_empty() {
                        "none".to_string()
                    } else {
                        missing_sections.join(", ")
                    }
                ),
            },
        ];

        let weighted: f64 = section_scores
            .iter()
            .map(|s| s.score as f64 * s.weight)
            .sum();
        let overall_score = (weighted as i32).clamp(0, 100);

        let suggestions = generate_suggestions(
            &missing_keywords,
            &missing_skills,
            &missing_sections,
            &ats_risks,
            &section_scores,
            &action_verb_analysis,
        );

        let summary = generate_summary(
            overall_score,
            matched_keywords.len(),
            missing_keywords.len(),
        );

        AnalysisResponse {
            overall_score,
            section_scores,
            matched_keywords: matched_keywords.into_iter().take(30).collect(),
            missing_keywords: missing_keywords.into_iter().take(30).collect(),
            ats_risks,
            suggestions,
            detected_sections,
            missing_sections,
            summary,
            engine_version: "1.0.0".to_string(),
            contract_version: "1.0.0".to_string(),
            metadata: AnalysisMetadata {
                engine: "rust-wasm".to_string(),
                duration_ms: 0,
                resume_length: resume_text.len(),
                job_description_length: job_description.len(),
            },
        }
    }
}

impl Default for AtsScorer {
    fn default() -> Self {
        Self::new()
    }
}
