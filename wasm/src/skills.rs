use crate::result::KeywordMatch;

pub fn tech_skills() -> &'static [&'static str] {
    &[
        "python",
        "java",
        "javascript",
        "typescript",
        "go",
        "rust",
        "c++",
        "c#",
        "ruby",
        "php",
        "swift",
        "kotlin",
        "scala",
        "r",
        "matlab",
        "sql",
        "react",
        "angular",
        "vue",
        "svelte",
        "nextjs",
        "nuxt",
        "django",
        "flask",
        "fastapi",
        "spring",
        "express",
        "nodejs",
        "rails",
        "laravel",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "terraform",
        "ansible",
        "jenkins",
        "gitlab",
        "github",
        "ci/cd",
        "pytorch",
        "tensorflow",
        "keras",
        "scikit-learn",
        "pandas",
        "numpy",
        "spark",
        "hadoop",
        "kafka",
        "redis",
        "mongodb",
        "postgresql",
        "mysql",
        "elasticsearch",
        "graphql",
        "rest",
        "grpc",
        "html",
        "css",
        "sass",
        "tailwind",
        "bootstrap",
        "figma",
        "sketch",
        "adobe",
        "jira",
        "confluence",
        "agile",
        "scrum",
        "kanban",
        "linux",
        "bash",
        "powershell",
        "git",
        "svn",
        "webpack",
        "vite",
        "babel",
        "eslint",
        "prettier",
        "jest",
        "mocha",
        "cypress",
        "selenium",
        "playwright",
        "machine learning",
        "deep learning",
        "nlp",
        "computer vision",
        "data science",
        "data engineering",
        "data analysis",
        "statistics",
        "tableau",
        "powerbi",
        "looker",
        "airflow",
        "dbt",
        "snowflake",
        "bigquery",
        "redshift",
        "databricks",
        "mlflow",
        "kubeflow",
        "microservices",
        "serverless",
        "event-driven",
        "soa",
        "oauth",
        "jwt",
        "saml",
        "ldap",
        "ssl/tls",
    ]
}

pub fn soft_skills() -> &'static [&'static str] {
    &[
        "leadership",
        "communication",
        "teamwork",
        "problem-solving",
        "analytical",
        "critical thinking",
        "project management",
        "time management",
        "collaboration",
        "mentoring",
        "presentation",
        "negotiation",
        "conflict resolution",
        "decision making",
        "creativity",
        "adaptability",
        "attention to detail",
        "organizational",
        "strategic planning",
        "stakeholder management",
    ]
}

pub fn all_skills() -> Vec<&'static str> {
    let mut skills: Vec<&'static str> = tech_skills().to_vec();
    skills.extend_from_slice(soft_skills());
    skills
}

pub fn extract_skills(text: &str) -> Vec<String> {
    let text_lower = text.to_lowercase();
    let mut found = std::collections::HashSet::new();

    for skill in all_skills() {
        let pattern = format!(r"\b{}\b", regex::escape(skill));
        if let Ok(re) = regex::Regex::new(&pattern) {
            if re.is_match(&text_lower) {
                found.insert(skill.to_string());
            }
        }
    }

    let mut result: Vec<String> = found.into_iter().collect();
    result.sort();
    result
}

pub fn match_skills(resume_text: &str, jd_text: &str) -> (Vec<KeywordMatch>, Vec<KeywordMatch>) {
    let resume_skills: std::collections::HashSet<String> =
        extract_skills(resume_text).into_iter().collect();
    let jd_skills = extract_skills(jd_text);

    let mut matched = Vec::new();
    let mut missing = Vec::new();

    let mut sorted_jd: Vec<String> = jd_skills.into_iter().collect();
    sorted_jd.sort();

    for skill in sorted_jd {
        if resume_skills.contains(&skill) {
            matched.push(KeywordMatch {
                keyword: skill,
                matched: true,
                context: None,
                variants: None,
            });
        } else {
            missing.push(KeywordMatch {
                keyword: skill,
                matched: false,
                context: None,
                variants: None,
            });
        }
    }

    (matched, missing)
}

pub fn get_skills_score(matched: &[KeywordMatch], missing: &[KeywordMatch]) -> i32 {
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
    fn test_extract_skills() {
        let skills = extract_skills("I know Python and Docker");
        assert!(skills.contains(&"python".to_string()));
        assert!(skills.contains(&"docker".to_string()));
    }

    #[test]
    fn test_match_skills() {
        let (matched, missing) = match_skills(
            "I know Python and Docker",
            "Python and Kubernetes are required",
        );
        let matched_names: Vec<&str> = matched.iter().map(|m| m.keyword.as_str()).collect();
        let missing_names: Vec<&str> = missing.iter().map(|m| m.keyword.as_str()).collect();
        assert!(matched_names.contains(&"python"));
        assert!(missing_names.contains(&"kubernetes"));
    }

    #[test]
    fn test_skills_score_perfect() {
        let m = vec![KeywordMatch {
            keyword: "a".into(),
            matched: true,
            context: None,
            variants: None,
        }];
        assert_eq!(get_skills_score(&m, &[]), 100);
    }

    #[test]
    fn test_skills_score_zero() {
        let m = vec![KeywordMatch {
            keyword: "a".into(),
            matched: false,
            context: None,
            variants: None,
        }];
        assert_eq!(get_skills_score(&[], &m), 0);
    }
}
