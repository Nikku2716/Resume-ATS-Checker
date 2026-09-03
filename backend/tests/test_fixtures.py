import json
from pathlib import Path
import pytest
from app.analyzers.scorer import AtsScorer


@pytest.fixture
def scorer():
    return AtsScorer()


@pytest.fixture
def fixtures_data():
    fixtures_file = Path(__file__).parent.parent.parent / "tests" / "fixtures" / "baseline_fixtures.json"
    with open(fixtures_file, "r", encoding="utf-8") as f:
        return json.load(f)


def test_all_baseline_fixtures_parity(scorer, fixtures_data):
    for fixture in fixtures_data:
        fid = fixture["id"]
        resume = fixture["input"]["resume"]
        jd = fixture["input"]["job_description"]
        expected = fixture["expected_output"]

        result = scorer.analyze(resume, jd)
        result_dict = result.model_dump()

        assert result_dict["overall_score"] == expected["overall_score"], (
            f"Fixture {fid} overall_score mismatch: expected {expected['overall_score']}, got {result_dict['overall_score']}"
        )
        assert len(result_dict["section_scores"]) == len(expected["section_scores"]), (
            f"Fixture {fid} section_scores count mismatch"
        )
        for act_sec, exp_sec in zip(result_dict["section_scores"], expected["section_scores"]):
            assert act_sec["name"] == exp_sec["name"]
            assert act_sec["score"] == exp_sec["score"], (
                f"Fixture {fid} section {act_sec['name']} score mismatch: expected {exp_sec['score']}, got {act_sec['score']}"
            )
        assert result_dict["detected_sections"] == expected["detected_sections"], (
            f"Fixture {fid} detected_sections mismatch"
        )
        assert result_dict["missing_sections"] == expected["missing_sections"], (
            f"Fixture {fid} missing_sections mismatch"
        )
