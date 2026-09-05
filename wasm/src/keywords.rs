use std::collections::HashMap;
use std::collections::HashSet;

use crate::result::KeywordMatch;
use crate::tokenize::tokenize;

pub fn extract_keywords(text: &str, max_keywords: usize) -> Vec<String> {
    let tokens = tokenize(text);

    // Score bigrams & unigrams with insertion index for stable tie-breaking
    let mut term_scores: HashMap<String, (usize, i32)> = HashMap::new();
    let mut insert_idx = 0;

    for window in tokens.windows(2) {
        let phrase = format!("{} {}", window[0], window[1]);
        term_scores
            .entry(phrase)
            .and_modify(|entry| entry.1 += 3)
            .or_insert_with(|| {
                let idx = insert_idx;
                insert_idx += 1;
                (idx, 3)
            });
    }

    // Score unigrams
    for token in &tokens {
        term_scores
            .entry(token.clone())
            .and_modify(|entry| entry.1 += 1)
            .or_insert_with(|| {
                let idx = insert_idx;
                insert_idx += 1;
                (idx, 1)
            });
    }

    // Sort by score desc, then string length desc, then insertion order asc
    let mut sorted: Vec<(String, (usize, i32))> = term_scores.into_iter().collect();
    sorted.sort_by(|a, b| {
        b.1 .1
            .cmp(&a.1 .1)
            .then_with(|| b.0.len().cmp(&a.0.len()))
            .then_with(|| a.1 .0.cmp(&b.1 .0))
    });

    sorted
        .into_iter()
        .take(max_keywords)
        .map(|(s, _)| s)
        .collect()
}

pub fn get_variants(word: &str) -> Vec<String> {
    let mut variants = Vec::new();

    if word.contains('-') {
        let space_version = word.replace('-', " ");
        if space_version != word {
            variants.push(space_version);
        }
        let no_sep = word.replace('-', "");
        if no_sep != word {
            variants.push(no_sep);
        }
    }

    if word.contains('/') {
        let parts: Vec<&str> = word.split('/').collect();
        for part in &parts {
            variants.push(part.to_string());
        }
        if parts.len() > 1 {
            variants.push(parts.join(" "));
        }
    }

    // Handle common suffixes
    let chars: Vec<char> = word.chars().collect();
    let len = chars.len();

    if len > 3 && chars[len - 1] == 's' && chars[len - 2] != 's' {
        let stem: String = chars[..len - 1].iter().collect();
        variants.push(stem);
    }

    if len > 5 && word.ends_with("ing") {
        let stem: String = chars[..len - 3].iter().collect();
        variants.push(stem.clone());
        let mut e_stem = stem;
        e_stem.push('e');
        variants.push(e_stem);
    }

    if len > 4 && word.ends_with("ed") {
        let stem: String = chars[..len - 2].iter().collect();
        variants.push(stem.clone());
        let mut e_stem = stem;
        e_stem.push('e');
        variants.push(e_stem);
    }

    if word.ends_with("tion") && len > 4 {
        let stem: String = chars[..len - 4].iter().collect();
        let mut te_stem = stem;
        te_stem.push_str("te");
        variants.push(te_stem);
    }

    if word.ends_with("ly") && len > 2 {
        let stem: String = chars[..len - 2].iter().collect();
        variants.push(stem);
    }

    // Remove the original word from variants
    variants.retain(|v| v != word);
    variants.sort();
    variants.dedup();
    variants
}

pub fn score_keywords(
    resume_keywords: &[String],
    jd_keywords: &[String],
) -> (Vec<KeywordMatch>, Vec<KeywordMatch>) {
    let resume_set: HashSet<&str> = resume_keywords.iter().map(|s| s.as_str()).collect();
    let mut resume_words: HashSet<String> = HashSet::new();
    for kw in resume_keywords {
        for w in kw.split_whitespace() {
            resume_words.insert(w.to_string());
        }
        for v in get_variants(kw) {
            resume_words.insert(v);
        }
    }

    let mut matched = Vec::new();
    let mut missing = Vec::new();

    for jd_kw in jd_keywords {
        let (found, matched_variants) = check_match(jd_kw, &resume_set, &resume_words);
        if found {
            matched.push(KeywordMatch {
                keyword: jd_kw.clone(),
                matched: true,
                context: None,
                variants: if matched_variants.is_empty() {
                    None
                } else {
                    Some(matched_variants)
                },
            });
        } else {
            missing.push(KeywordMatch {
                keyword: jd_kw.clone(),
                matched: false,
                context: None,
                variants: None,
            });
        }
    }

    (matched, missing)
}

fn check_match(
    jd_kw: &str,
    resume_set: &HashSet<&str>,
    resume_words: &HashSet<String>,
) -> (bool, Vec<String>) {
    let mut found = false;
    let mut matched_variants = Vec::new();

    // 1. Exact match
    if resume_set.contains(jd_kw) {
        found = true;
    }

    // 2. Partial match: any word of multi-word JD keyword found in resume word set
    let kw_words: Vec<&str> = jd_kw.split_whitespace().collect();
    if !found && kw_words.len() > 1 {
        for w in &kw_words {
            if resume_words.contains(*w) {
                found = true;
                break;
            }
        }
    }

    // 3. Variant match
    let variants = get_variants(jd_kw);
    for v in &variants {
        if resume_set.contains(v.as_str()) {
            found = true;
            matched_variants.push(v.clone());
        }
    }

    (found, matched_variants)
}

pub fn get_keyword_score(matched: &[KeywordMatch], missing: &[KeywordMatch]) -> i32 {
    let total = matched.len() + missing.len();
    if total == 0 {
        return 100;
    }
    ((matched.len() as f64 / total as f64) * 100.0) as i32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_keywords_basic() {
        let kws = extract_keywords("Python developer with AWS experience", 100);
        assert!(kws.contains(&"python".to_string()));
    }

    #[test]
    fn test_score_keywords_all_match() {
        let rk = vec!["python".to_string(), "react".to_string(), "aws".to_string()];
        let jk = vec!["python".to_string(), "react".to_string(), "aws".to_string()];
        let (matched, missing) = score_keywords(&rk, &jk);
        assert_eq!(matched.len(), 3);
        assert_eq!(missing.len(), 0);
    }

    #[test]
    fn test_score_keywords_some_missing() {
        let rk = vec!["python".to_string()];
        let jk = vec![
            "python".to_string(),
            "kubernetes".to_string(),
            "docker".to_string(),
        ];
        let (matched, missing) = score_keywords(&rk, &jk);
        assert_eq!(matched.len(), 1);
        assert_eq!(missing.len(), 2);
    }

    #[test]
    fn test_keyword_score_perfect() {
        let m = vec![KeywordMatch {
            keyword: "a".into(),
            matched: true,
            context: None,
            variants: None,
        }];
        assert_eq!(get_keyword_score(&m, &[]), 100);
    }

    #[test]
    fn test_keyword_score_zero() {
        let m = vec![
            KeywordMatch {
                keyword: "a".into(),
                matched: false,
                context: None,
                variants: None,
            },
            KeywordMatch {
                keyword: "b".into(),
                matched: false,
                context: None,
                variants: None,
            },
        ];
        assert_eq!(get_keyword_score(&[], &m), 0);
    }

    #[test]
    fn test_keyword_score_partial() {
        let m = vec![KeywordMatch {
            keyword: "a".into(),
            matched: true,
            context: None,
            variants: None,
        }];
        let mi = vec![
            KeywordMatch {
                keyword: "b".into(),
                matched: false,
                context: None,
                variants: None,
            },
            KeywordMatch {
                keyword: "c".into(),
                matched: false,
                context: None,
                variants: None,
            },
            KeywordMatch {
                keyword: "d".into(),
                matched: false,
                context: None,
                variants: None,
            },
        ];
        assert_eq!(get_keyword_score(&m, &mi), 25);
    }

    #[test]
    fn test_variants_hyphen() {
        let v = get_variants("ci-cd");
        assert!(v.contains(&"ci cd".to_string()));
        assert!(v.contains(&"cicd".to_string()));
    }

    #[test]
    fn test_variants_slash() {
        let v = get_variants("dev/ops");
        assert!(v.contains(&"dev".to_string()));
        assert!(v.contains(&"ops".to_string()));
        assert!(v.contains(&"dev ops".to_string()));
    }

    #[test]
    fn test_variants_suffixes() {
        let v = get_variants("tests");
        assert!(v.contains(&"test".to_string()));
    }
}
