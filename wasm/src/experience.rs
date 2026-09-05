pub fn compute_experience_relevance(
    resume_text: &str,
    jd_text: &str,
    jd_keywords: &[String],
) -> i32 {
    let resume_lower = resume_text.to_lowercase();
    let jd_lower = jd_text.to_lowercase();

    let years_resume = extract_years_experience(&resume_lower);
    let years_jd = extract_years_experience(&jd_lower);

    let match_count = jd_keywords
        .iter()
        .filter(|kw| resume_lower.contains(kw.as_str()))
        .count();
    let total_jd_terms = jd_keywords.len().max(1);
    let term_score = (match_count as f64 / total_jd_terms as f64) * 100.0;

    let year_score = if years_jd > 0 && years_resume > 0 {
        let year_ratio = (years_resume as f64 / years_jd as f64).min(1.5);
        (year_ratio * 100.0).min(100.0)
    } else {
        100.0
    };

    (term_score * 0.6 + year_score * 0.4) as i32
}

pub fn extract_years_experience(text: &str) -> i32 {
    let patterns = [
        r"(\d+)\+?\s*years?\s*(?:of\s+)?experience",
        r"(\d+)\+?\s*years?\s*(?:of\s+)?work",
        r"experience\s*(?:of|:)?\s*(\d+)\+?\s*years?",
    ];

    for pat in patterns {
        if let Ok(re) = regex::Regex::new(pat) {
            if let Some(caps) = re.captures(text) {
                if let Some(m) = caps.get(1) {
                    if let Ok(val) = m.as_str().parse::<i32>() {
                        return val;
                    }
                }
            }
        }
    }

    if let Ok(re) = regex::Regex::new(r"\b(20\d{2})\b") {
        let mut years: Vec<i32> = re
            .captures_iter(text)
            .filter_map(|cap| cap.get(1).and_then(|m| m.as_str().parse::<i32>().ok()))
            .collect();

        if years.len() >= 2 {
            years.sort();
            let span = years.last().unwrap() - years.first().unwrap();
            return span.max(1);
        }
    }

    0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_years_pattern() {
        assert_eq!(extract_years_experience("5+ years of experience"), 5);
        assert_eq!(extract_years_experience("10 years experience"), 10);
    }

    #[test]
    fn test_extract_years_from_date_range() {
        assert_eq!(extract_years_experience("2018 - 2023"), 5);
    }
}
