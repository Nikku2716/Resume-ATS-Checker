import pytest

from app.analyzers.action_verb_analyzer import ActionVerbAnalyzer


@pytest.fixture
def analyzer():
    return ActionVerbAnalyzer()


class TestAnalyze:
    def test_weak_phrases_detected(self, analyzer):
        text = "Responsible for managing the team. Worked on backend services."
        result = analyzer.analyze(text)
        phrases = [w["phrase"] for w in result["weak_phrases"]]
        assert "responsible for" in phrases
        assert "worked on" in phrases

    def test_buzzwords_detected(self, analyzer):
        text = "I am a results-driven professional and a true team player."
        result = analyzer.analyze(text)
        assert "results-driven professional" in result["buzzwords"]

    def test_strong_verbs_counted(self, analyzer):
        text = "Led a team of five. Shipped three features. Optimized the pipeline. Built the CI system."
        result = analyzer.analyze(text)
        assert result["strong_verb_count"] >= 4
        assert result["strong_verb_density"] > 0

    def test_clean_resume_scores_high(self, analyzer):
        text = (
            "Led platform migration to Kubernetes. Reduced latency by 40%. "
            "Automated deployment pipelines with GitHub Actions. "
            "Designed event-driven microservices in Go."
        )
        result = analyzer.analyze(text)
        assert result["score"] >= 70
        assert not result["weak_phrases"]
        assert not result["buzzwords"]

    def test_passive_resume_scores_low(self, analyzer):
        text = (
            "Was involved in various projects. Helped with testing. Assisted in deployments. "
            "Duties included writing reports."
        )
        result = analyzer.analyze(text)
        assert result["score"] < 60


class TestSuggestions:
    def test_suggestions_generated_for_weak_resume(self, analyzer):
        text = (
            "Responsible for on-call rotations. Worked on internal tooling. "
            "A synergy-driven ninja who thinks outside the box."
        )
        analysis = analyzer.analyze(text)
        suggestions = analyzer.get_suggestions(analysis)
        categories = {s.category for s in suggestions}
        assert "Action Verbs" in categories or "Buzzwords" in categories

    def test_no_suggestions_for_strong_resume(self, analyzer):
        text = (
            "Led the migration. Shipped 12 features. Optimized queries, reducing load time by half. "
            "Built observability dashboards. Automated releases end to end."
        )
        analysis = analyzer.analyze(text)
        assert analyzer.get_suggestions(analysis) == []


class TestScorerIntegration:
    def test_scorer_emits_action_verb_suggestions(self):
        from app.analyzers.scorer import AtsScorer

        resume = (
            "John Doe\nSummary\nExperienced engineer responsible for many systems.\n"
            "Experience\nWorked on stuff at ACME Corp for 5 years.\nSkills\nPython\nEducation\nBS\n"
        )
        jd = "Looking for a Python engineer with 3+ years of experience building APIs."
        response = AtsScorer().analyze(resume, jd)
        categories = [s.category for s in response.suggestions]
        assert any(c == "Action Verbs" for c in categories) or any(
            c == "Buzzwords" for c in categories
        )
