use std::collections::HashSet;

pub fn standard_sections() -> &'static [(&'static str, &'static [&'static str])] {
    &[
        (
            "summary",
            &[
                "summary",
                "professional summary",
                "profile",
                "about me",
                "objective",
                "career objective",
            ],
        ),
        (
            "experience",
            &[
                "experience",
                "work experience",
                "professional experience",
                "employment",
                "work history",
                "career history",
            ],
        ),
        (
            "education",
            &[
                "education",
                "academic background",
                "academic",
                "qualifications",
                "degrees",
            ],
        ),
        (
            "skills",
            &[
                "skills",
                "technical skills",
                "core competencies",
                "expertise",
                "competencies",
                "key skills",
            ],
        ),
        (
            "projects",
            &["projects", "project experience", "personal projects"],
        ),
        (
            "certifications",
            &[
                "certifications",
                "certificates",
                "licenses",
                "accreditations",
            ],
        ),
        ("languages", &["languages", "language proficiency"]),
        ("publications", &["publications", "papers", "research"]),
        (
            "volunteering",
            &["volunteer", "volunteering", "community service"],
        ),
        ("references", &["references", "referees"]),
    ]
}

pub fn detect_sections(text: &str) -> Vec<String> {
    let text_lower = text.to_lowercase();
    let lines: Vec<&str> = text_lower.lines().collect();
    let mut found_sections = HashSet::new();

    for (section_name, patterns) in standard_sections() {
        for pattern in *patterns {
            if section_exists(&lines, pattern) {
                found_sections.insert(section_name.to_string());
                break;
            }
        }
    }

    let mut result: Vec<String> = found_sections.into_iter().collect();
    result.sort();
    result
}

fn section_exists(lines: &[&str], pattern: &str) -> bool {
    let md_pattern = format!(r"^#{{1,3}}\s*{}\s*$", regex::escape(pattern));
    let md_re = regex::Regex::new(&md_pattern).ok();

    for line in lines {
        let stripped = line.trim();

        if (stripped.starts_with(pattern) || stripped == pattern)
            && stripped.len() < pattern.len() + 20
        {
            return true;
        }

        if stripped.trim_end_matches(':').trim() == pattern {
            return true;
        }

        if let Some(ref re) = md_re {
            if re.is_match(stripped) {
                return true;
            }
        }
    }

    false
}

pub fn get_missing_sections(text: &str) -> Vec<String> {
    let found: HashSet<String> = detect_sections(text).into_iter().collect();
    let required = ["summary", "experience", "education", "skills"];
    let mut missing = Vec::new();

    for req in required {
        if !found.contains(req) {
            missing.push(req.to_string());
        }
    }

    missing.sort();
    missing
}

pub fn get_section_completeness_score(text: &str) -> i32 {
    let required: HashSet<&str> = ["summary", "experience", "education", "skills"]
        .into_iter()
        .collect();
    let found: HashSet<String> = detect_sections(text).into_iter().collect();

    let present_count = required.iter().filter(|r| found.contains(**r)).count();
    ((present_count as f64 / required.len() as f64) * 100.0) as i32
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r#"
Professional Summary
Experienced engineer.

Skills
Python, Docker

Experience
Senior Developer at Tech

Education
BS Computer Science
"#;

    #[test]
    fn test_detect_sections() {
        let detected = detect_sections(SAMPLE);
        assert!(detected.contains(&"summary".to_string()));
        assert!(detected.contains(&"experience".to_string()));
        assert!(detected.contains(&"education".to_string()));
        assert!(detected.contains(&"skills".to_string()));
    }

    #[test]
    fn test_missing_sections() {
        let missing = get_missing_sections("No sections here");
        assert!(missing.contains(&"summary".to_string()));
        assert!(missing.contains(&"experience".to_string()));
        assert!(missing.contains(&"education".to_string()));
        assert!(missing.contains(&"skills".to_string()));
    }

    #[test]
    fn test_completeness_score_full() {
        assert_eq!(get_section_completeness_score(SAMPLE), 100);
    }

    #[test]
    fn test_completeness_score_empty() {
        assert_eq!(get_section_completeness_score("no sections"), 0);
    }
}
