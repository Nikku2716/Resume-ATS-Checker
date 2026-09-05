use resumelint_ats::analyze;
use serde::Deserialize;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct Fixture {
    id: String,
    name: String,
    description: String,
    input: FixtureInput,
    expected_output: ExpectedOutput,
}

#[derive(Debug, Deserialize)]
struct FixtureInput {
    resume: String,
    job_description: String,
}

#[derive(Debug, Deserialize)]
struct ExpectedOutput {
    overall_score: i32,
    section_scores: Vec<ExpectedSectionScore>,
    detected_sections: Vec<String>,
    missing_sections: Vec<String>,
}

#[derive(Debug, Deserialize)]
struct ExpectedSectionScore {
    name: String,
    score: i32,
}

#[test]
fn test_all_18_baseline_fixtures_parity() {
    let mut fixture_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    fixture_path.pop(); // Go up to repo root
    fixture_path.push("tests");
    fixture_path.push("fixtures");
    fixture_path.push("baseline_fixtures.json");

    let content = fs::read_to_string(&fixture_path)
        .unwrap_or_else(|e| panic!("Failed to read {}: {}", fixture_path.display(), e));

    let fixtures: Vec<Fixture> =
        serde_json::from_str(&content).expect("Failed to parse fixtures JSON");

    assert_eq!(fixtures.len(), 18, "Expected 18 baseline fixtures");

    for f in &fixtures {
        let actual = analyze(&f.input.resume, &f.input.job_description);

        assert_eq!(
            actual.overall_score, f.expected_output.overall_score,
            "Fixture '{}' overall_score mismatch: expected {}, got {}",
            f.id, f.expected_output.overall_score, actual.overall_score
        );

        assert_eq!(
            actual.section_scores.len(),
            f.expected_output.section_scores.len(),
            "Fixture '{}' section_scores count mismatch",
            f.id
        );

        for (act_sec, exp_sec) in actual
            .section_scores
            .iter()
            .zip(&f.expected_output.section_scores)
        {
            assert_eq!(
                act_sec.name, exp_sec.name,
                "Fixture '{}' section name mismatch",
                f.id
            );
            assert_eq!(
                act_sec.score, exp_sec.score,
                "Fixture '{}' section '{}' score mismatch: expected {}, got {}",
                f.id, act_sec.name, exp_sec.score, act_sec.score
            );
        }

        assert_eq!(
            actual.detected_sections, f.expected_output.detected_sections,
            "Fixture '{}' detected_sections mismatch: expected {:?}, got {:?}",
            f.id, f.expected_output.detected_sections, actual.detected_sections
        );

        assert_eq!(
            actual.missing_sections, f.expected_output.missing_sections,
            "Fixture '{}' missing_sections mismatch: expected {:?}, got {:?}",
            f.id, f.expected_output.missing_sections, actual.missing_sections
        );

        assert_eq!(
            actual.engine_version, "1.0.0",
            "Fixture '{}' engine_version mismatch",
            f.id
        );

        assert_eq!(
            actual.contract_version, "1.0.0",
            "Fixture '{}' contract_version mismatch",
            f.id
        );

        println!(
            "✓ Fixture '{}' passed parity check (score: {})",
            f.id, actual.overall_score
        );
    }
}
