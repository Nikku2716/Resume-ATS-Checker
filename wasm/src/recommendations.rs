use crate::action_verbs::{get_action_verb_suggestions, ActionVerbAnalysis};
use crate::result::{AtsRisk, ImprovementSuggestion, KeywordMatch, SectionScore};

pub fn generate_suggestions(
    missing_keywords: &[KeywordMatch],
    missing_skills: &[KeywordMatch],
    missing_sections: &[String],
    ats_risks: &[AtsRisk],
    section_scores: &[SectionScore],
    action_verb_analysis: &ActionVerbAnalysis,
) -> Vec<ImprovementSuggestion> {
    let mut suggestions: Vec<ImprovementSuggestion> = Vec::new();

    // 1. Action verb suggestions
    suggestions.extend(get_action_verb_suggestions(action_verb_analysis));

    // 2. Missing keywords
    if !missing_keywords.is_empty() {
        let top_missing: Vec<&str> = missing_keywords
            .iter()
            .take(5)
            .map(|k| k.keyword.as_str())
            .collect();
        suggestions.push(ImprovementSuggestion {
            category: "Keywords".to_string(),
            priority: "critical".to_string(),
            suggestion: format!(
                "Add these missing keywords to your resume: {}.",
                top_missing.join(", ")
            ),
            location: Some("Skills / Experience sections".to_string()),
        });
    }

    // 3. Missing skills
    if !missing_skills.is_empty() {
        let top_skills: Vec<&str> = missing_skills
            .iter()
            .take(5)
            .map(|s| s.keyword.as_str())
            .collect();
        suggestions.push(ImprovementSuggestion {
            category: "Skills".to_string(),
            priority: "high".to_string(),
            suggestion: format!(
                "Add these missing skills to your Skills section: {}.",
                top_skills.join(", ")
            ),
            location: Some("Skills section".to_string()),
        });
    }

    // 4. Missing sections
    if missing_sections.iter().any(|s| s == "summary") {
        suggestions.push(ImprovementSuggestion {
            category: "Sections".to_string(),
            priority: "high".to_string(),
            suggestion: "Add a \"Professional Summary\" section at the top. This is one of the first sections ATS parsers look for.".to_string(),
            location: Some("Top of resume".to_string()),
        });
    }

    if missing_sections.iter().any(|s| s == "skills") {
        suggestions.push(ImprovementSuggestion {
            category: "Sections".to_string(),
            priority: "high".to_string(),
            suggestion: "Add a dedicated \"Skills\" section with relevant technical and soft skills listed clearly.".to_string(),
            location: Some("After Summary section".to_string()),
        });
    }

    if missing_sections.iter().any(|s| s == "experience") {
        suggestions.push(ImprovementSuggestion {
            category: "Sections".to_string(),
            priority: "critical".to_string(),
            suggestion: "Add a \"Work Experience\" section with your employment history, job titles, and dates.".to_string(),
            location: Some("After Summary section".to_string()),
        });
    }

    // 5. Formatting risks
    for risk in ats_risks {
        suggestions.push(ImprovementSuggestion {
            category: "Formatting".to_string(),
            priority: if risk.severity == "high" {
                "high".to_string()
            } else {
                "medium".to_string()
            },
            suggestion: risk.detail.clone(),
            location: Some("Throughout resume".to_string()),
        });
    }

    // 6. Low keyword score
    for s in section_scores {
        if s.name == "Keyword Match" && s.score < 50 {
            suggestions.push(ImprovementSuggestion {
                category: "Keywords".to_string(),
                priority: "high".to_string(),
                suggestion: "Keyword match is low. Study the job description and incorporate its language naturally into your resume.".to_string(),
                location: Some("Experience / Skills sections".to_string()),
            });
        }
    }

    suggestions
}

pub fn generate_summary(score: i32, matched_count: usize, missing_count: usize) -> String {
    if score >= 80 {
        format!(
            "Strong ATS compatibility (score: {}/100). Your resume is well-optimized for ATS screening. Only {} missing keywords identified.",
            score, missing_count
        )
    } else if score >= 60 {
        format!(
            "Moderate ATS compatibility (score: {}/100). {} keywords matched but {} are missing. Address the suggestions below to improve.",
            score, matched_count, missing_count
        )
    } else if score >= 40 {
        format!(
            "Below average ATS compatibility (score: {}/100). Significant keyword gaps ({} missing) and potential formatting issues. Prioritize the critical fixes.",
            score, missing_count
        )
    } else {
        format!(
            "Low ATS compatibility (score: {}/100). Major improvements needed. Focus on adding standard sections and incorporating job-specific keywords.",
            score
        )
    }
}
