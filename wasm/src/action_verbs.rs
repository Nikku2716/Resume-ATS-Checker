use crate::result::ImprovementSuggestion;

pub struct WeakPhraseMatch {
    pub phrase: String,
    pub count: usize,
    pub replacement: String,
}

pub struct ActionVerbAnalysis {
    pub score: i32,
    pub weak_phrases: Vec<WeakPhraseMatch>,
    pub buzzwords: Vec<String>,
    pub strong_verb_count: usize,
    pub strong_verb_density: f64,
}

pub fn weak_phrases() -> &'static [(&'static str, &'static str)] {
    &[
        ("responsible for", "Led / Owned"),
        ("worked on", "Built / Delivered"),
        ("helped with", "Drove"),
        ("assisted in", "Drove"),
        ("duties included", "Delivered"),
        ("in charge of", "Owned"),
        ("participated in", "Contributed to (specify outcome)"),
        ("was involved in", "Spearheaded"),
        ("tasked with", "Owned"),
    ]
}

pub fn strong_action_verbs() -> &'static [&'static str] {
    &[
        "led",
        "built",
        "designed",
        "developed",
        "launched",
        "shipped",
        "optimized",
        "reduced",
        "increased",
        "automated",
        "architected",
        "implemented",
        "delivered",
        "improved",
        "scaled",
        "migrated",
    ]
}

pub fn buzzwords() -> &'static [&'static str] {
    &[
        "synergy",
        "synergies",
        "thought leader",
        "thought leadership",
        "guru",
        "ninja",
        "rockstar",
        "wizard",
        "go-getter",
        "think outside the box",
        "results-driven professional",
        "hard worker",
        "team player with",
        "detail-oriented individual",
    ]
}

pub fn analyze_action_verbs(resume_text: &str) -> ActionVerbAnalysis {
    let text_lower = resume_text.to_lowercase();

    let mut weak_found = Vec::new();
    for (phrase, replacement) in weak_phrases() {
        let pattern = format!(r"\b{}\b", regex::escape(phrase));
        if let Ok(re) = regex::Regex::new(&pattern) {
            let count = re.find_iter(&text_lower).count();
            if count > 0 {
                weak_found.push(WeakPhraseMatch {
                    phrase: phrase.to_string(),
                    count,
                    replacement: replacement.to_string(),
                });
            }
        }
    }

    let mut buzzwords_found = Vec::new();
    for bw in buzzwords() {
        let pattern = format!(r"\b{}\b", regex::escape(bw));
        if let Ok(re) = regex::Regex::new(&pattern) {
            if re.is_match(&text_lower) {
                buzzwords_found.push(bw.to_string());
            }
        }
    }

    let mut verb_count = 0;
    for v in strong_action_verbs() {
        let pattern = format!(r"\b{}\b", regex::escape(v));
        if let Ok(re) = regex::Regex::new(&pattern) {
            verb_count += re.find_iter(&text_lower).count();
        }
    }

    let word_count = resume_text.split_whitespace().count().max(1);
    let verb_density = ((verb_count as f64 / word_count as f64) * 10000.0).round() / 100.0;

    let score = get_action_verb_score(&weak_found, &buzzwords_found, verb_density);

    ActionVerbAnalysis {
        score,
        weak_phrases: weak_found,
        buzzwords: buzzwords_found,
        strong_verb_count: verb_count,
        strong_verb_density: verb_density,
    }
}

pub fn get_action_verb_score(
    weak_phrases: &[WeakPhraseMatch],
    buzzwords: &[String],
    verb_density: f64,
) -> i32 {
    let mut score = 100;

    let total_weak: usize = weak_phrases.iter().map(|w| w.count).sum();
    score -= (total_weak * 10).min(40) as i32;
    score -= (buzzwords.len() * 8).min(24) as i32;

    if verb_density < 0.5 {
        score -= 20;
    } else if verb_density < 1.0 {
        score -= 10;
    }

    score.clamp(0, 100)
}

pub fn get_action_verb_suggestions(analysis: &ActionVerbAnalysis) -> Vec<ImprovementSuggestion> {
    let mut suggestions = Vec::new();

    for w in analysis.weak_phrases.iter().take(3) {
        suggestions.push(ImprovementSuggestion {
            category: "Action Verbs".to_string(),
            priority: if w.count > 1 {
                "high".to_string()
            } else {
                "medium".to_string()
            },
            suggestion: format!(
                "Replace the passive phrase \"{}\" ({}x) with a strong verb like \"{}\".",
                w.phrase, w.count, w.replacement
            ),
            location: Some("Experience section bullets".to_string()),
        });
    }

    if !analysis.buzzwords.is_empty() {
        let bw_list: Vec<&str> = analysis
            .buzzwords
            .iter()
            .take(4)
            .map(|s| s.as_str())
            .collect();
        suggestions.push(ImprovementSuggestion {
            category: "Buzzwords".to_string(),
            priority: "medium".to_string(),
            suggestion: format!(
                "Remove filler buzzwords: {}. Replace them with concrete achievements and measurable results.",
                bw_list.join(", ")
            ),
            location: Some("Summary / Experience sections".to_string()),
        });
    }

    if analysis.strong_verb_density < 0.5 {
        suggestions.push(ImprovementSuggestion {
            category: "Action Verbs".to_string(),
            priority: "high".to_string(),
            suggestion: "Resume reads passively. Start each experience bullet with a strong action verb (led, built, shipped, optimized...) and quantify the impact.".to_string(),
            location: Some("Experience section".to_string()),
        });
    }

    suggestions
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_weak_phrases_detected() {
        let text = "Responsible for managing the team. Worked on backend services.";
        let res = analyze_action_verbs(text);
        let phrases: Vec<&str> = res.weak_phrases.iter().map(|w| w.phrase.as_str()).collect();
        assert!(phrases.contains(&"responsible for"));
        assert!(phrases.contains(&"worked on"));
    }

    #[test]
    fn test_buzzwords_detected() {
        let text = "I am a results-driven professional and a true team player.";
        let res = analyze_action_verbs(text);
        assert!(res
            .buzzwords
            .contains(&"results-driven professional".to_string()));
    }

    #[test]
    fn test_strong_verbs_counted() {
        let text = "Led a team of five. Shipped three features. Optimized the pipeline. Built the CI system.";
        let res = analyze_action_verbs(text);
        assert!(res.strong_verb_count >= 4);
    }
}
