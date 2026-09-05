use crate::result::AtsRisk;

pub fn check_ats_risks(resume_text: &str) -> Vec<AtsRisk> {
    let mut risks = Vec::new();

    if let Some(r) = check_tables(resume_text) {
        risks.push(r);
    }
    if let Some(r) = check_multi_column(resume_text) {
        risks.push(r);
    }
    if let Some(r) = check_unusual_headings(resume_text) {
        risks.push(r);
    }
    if let Some(r) = check_images(resume_text) {
        risks.push(r);
    }
    if let Some(r) = check_icons(resume_text) {
        risks.push(r);
    }
    if let Some(r) = check_text_boxes(resume_text) {
        risks.push(r);
    }

    risks
}

fn check_tables(text: &str) -> Option<AtsRisk> {
    let table_line_re = regex::Regex::new(r"^\s*\|.+\|\s*$").unwrap();
    let table_border_re = regex::Regex::new(r"^[\+\-=\s]+$").unwrap();

    let mut table_lines = 0;
    for line in text.lines() {
        if table_line_re.is_match(line) || table_border_re.is_match(line) {
            table_lines += 1;
        }
    }

    if table_lines >= 2 {
        Some(AtsRisk {
            risk: "Tables detected".to_string(),
            severity: "high".to_string(),
            detail: "Tables may not be parsed correctly by ATS. Convert table content into plain text sections.".to_string(),
        })
    } else {
        None
    }
}

fn check_multi_column(text: &str) -> Option<AtsRisk> {
    let wide_lines = text.lines().filter(|l| l.trim().len() > 100).count();
    if wide_lines > 5 {
        Some(AtsRisk {
            risk: "Possible multi-column layout".to_string(),
            severity: "medium".to_string(),
            detail: "Long lines detected. Multi-column layouts often confuse ATS parsers. Use a single-column format.".to_string(),
        })
    } else {
        None
    }
}

fn check_unusual_headings(text: &str) -> Option<AtsRisk> {
    let re = regex::Regex::new(r"^[^a-zA-Z0-9\s]{2,}\s*$").unwrap();
    let unusual_count = text.lines().filter(|l| re.is_match(l.trim())).count();

    if unusual_count > 0 {
        Some(AtsRisk {
            risk: "Unusual section headings".to_string(),
            severity: "medium".to_string(),
            detail: format!(
                "Found {} heading(s) with non-standard formatting. Use standard section headers like 'Experience', 'Education', 'Skills'.",
                unusual_count
            ),
        })
    } else {
        None
    }
}

fn check_images(text: &str) -> Option<AtsRisk> {
    let text_lower = text.to_lowercase();
    if text.contains("@@IMAGE@@") || text_lower.contains("[[image:") {
        return Some(AtsRisk {
            risk: "Images detected".to_string(),
            severity: "high".to_string(),
            detail:
                "Images are not readable by ATS. Remove images or replace with descriptive text."
                    .to_string(),
        });
    }

    let img_count = text.matches("img").count()
        + text.matches(".png").count()
        + text.matches(".jpg").count()
        + text.matches(".jpeg").count();

    if img_count > 0 {
        let text_ratio = img_count as f64 / (text.len().max(1) as f64);
        if text_ratio > 0.01 {
            return Some(AtsRisk {
                risk: "Possible embedded images".to_string(),
                severity: "high".to_string(),
                detail: "Images or icons may be embedded. ATS cannot read content inside images. Use text instead.".to_string(),
            });
        }
    }

    None
}

fn check_icons(text: &str) -> Option<AtsRisk> {
    let mut icon_chars = 0;
    for c in text.chars() {
        let u = c as u32;
        if (0x1F300..0x1F9FF).contains(&u)
            || (0x2600..=0x27BF).contains(&u)
            || (0x2300..=0x23FF).contains(&u)
        {
            icon_chars += 1;
        }
    }

    if icon_chars >= 5 {
        Some(AtsRisk {
            risk: "Icons or symbols detected".to_string(),
            severity: "medium".to_string(),
            detail: format!(
                "Found roughly {} icon/symbol characters. Icons may not render in ATS systems. Use plain text bullets instead.",
                icon_chars
            ),
        })
    } else {
        None
    }
}

fn check_text_boxes(text: &str) -> Option<AtsRisk> {
    let short_indented = text
        .lines()
        .filter(|l| l.starts_with("   ") && !l.trim().is_empty() && l.trim().len() < 20)
        .count();

    if short_indented > 3 {
        Some(AtsRisk {
            risk: "Possible text boxes or floating elements".to_string(),
            severity: "medium".to_string(),
            detail: "Short indented lines detected. Text boxes may not be read by ATS in correct order. Use standard linear text flow.".to_string(),
        })
    } else {
        None
    }
}

pub fn get_formatting_score(risks: &[AtsRisk]) -> i32 {
    let mut score = 100;
    for risk in risks {
        match risk.severity.as_str() {
            "high" => score -= 20,
            "medium" => score -= 10,
            _ => score -= 5,
        }
    }
    score.max(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_resume_no_risks() {
        let risks = check_ats_risks("Clean resume text without tables or images.");
        assert!(risks.is_empty());
        assert_eq!(get_formatting_score(&risks), 100);
    }

    #[test]
    fn test_table_detected() {
        let text = "| Name | Role |\n|------|------|\n| John | Dev  |";
        let risks = check_ats_risks(text);
        assert!(risks.iter().any(|r| r.risk == "Tables detected"));
    }

    #[test]
    fn test_icons_detected() {
        let text = "Skills: ⚡ Python ⚡ Docker ⚡ React ⚡ Node ⚡ AWS";
        let risks = check_ats_risks(text);
        assert!(risks.iter().any(|r| r.risk == "Icons or symbols detected"));
    }

    #[test]
    fn test_formatting_score_penalties() {
        let risks = vec![
            AtsRisk {
                risk: "Table".into(),
                severity: "high".into(),
                detail: "test".into(),
            },
            AtsRisk {
                risk: "Icon".into(),
                severity: "medium".into(),
                detail: "test".into(),
            },
        ];
        assert_eq!(get_formatting_score(&risks), 70);
    }
}
