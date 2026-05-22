import pytest
from app.analyzers.keyword_matcher import KeywordMatcher
from app.analyzers.skills_matcher import SkillsMatcher
from app.analyzers.section_detector import SectionDetector
from app.analyzers.formatting_checker import FormattingChecker
from app.analyzers.scorer import AtsScorer


SAMPLE_RESUME = """
Professional Summary
Experienced software engineer with 5+ years building web applications.

Skills
Python, JavaScript, React, Node.js, Docker, PostgreSQL, AWS, Git

Experience
Senior Software Engineer | TechCorp | 2021 - Present
- Built REST APIs with FastAPI and PostgreSQL
- Deployed containerized apps on AWS ECS
- Led team of 4 developers using Agile methodology

Education
B.S. Computer Science | State University | 2016 - 2020
"""

SAMPLE_JD = """
We are looking for a Senior Software Engineer with 5+ years of experience.
Required skills: Python, JavaScript, React, Node.js, Docker, AWS, PostgreSQL, Kubernetes, CI/CD.

Responsibilities:
- Design and implement scalable REST APIs
- Deploy microservices on AWS with Docker and Kubernetes
- Collaborate using Agile/Scrum methodology
- Write automated tests with Jest and Cypress
"""


class TestKeywordMatcher:
    def setup_method(self):
        self.matcher = KeywordMatcher()

    def test_extract_keywords(self):
        kws = self.matcher.extract_keywords("Python developer with AWS experience")
        assert len(kws) > 0
        assert "python" in kws

    def test_score_keywords_all_match(self):
        rk = ["python", "react", "aws"]
        jk = ["python", "react", "aws"]
        matched, missing = self.matcher.score_keywords(rk, jk)
        assert len(matched) == 3
        assert len(missing) == 0

    def test_score_keywords_some_missing(self):
        rk = ["python"]
        jk = ["python", "kubernetes", "docker"]
        matched, missing = self.matcher.score_keywords(rk, jk)
        assert len(matched) == 1
        assert len(missing) == 2

    def test_keyword_score_perfect(self):
        score = self.matcher.get_keyword_score(["a"], [])
        assert score == 100

    def test_keyword_score_zero(self):
        score = self.matcher.get_keyword_score([], ["a", "b"])
        assert score == 0

    def test_keyword_score_partial(self):
        score = self.matcher.get_keyword_score(["a"], ["a", "b", "c"])
        assert score == 25  # 1/4 (matched=1, missing=3, total=4)


class TestSkillsMatcher:
    def setup_method(self):
        self.matcher = SkillsMatcher()

    def test_extract_skills(self):
        skills = self.matcher.extract_skills("I know Python and Docker")
        assert "python" in skills
        assert "docker" in skills

    def test_match_skills(self):
        matched, missing = self.matcher.match_skills(
            "I know Python and Docker",
            "Python and Kubernetes are required",
        )
        matched_names = [m.keyword for m in matched]
        missing_names = [m.keyword for m in missing]
        assert "python" in matched_names
        assert "kubernetes" in missing_names


class TestSectionDetector:
    def setup_method(self):
        self.detector = SectionDetector()

    def test_detect_sections(self):
        sections = self.detector.detect_sections(SAMPLE_RESUME)
        assert "summary" in sections
        assert "experience" in sections
        assert "education" in sections
        assert "skills" in sections

    def test_missing_sections(self):
        text = "Just some text without sections"
        missing = self.detector.get_missing_sections(text)
        assert "summary" in missing
        assert "experience" in missing
        assert "education" in missing
        assert "skills" in missing

    def test_completeness_score_full(self):
        score = self.detector.get_section_completeness_score(SAMPLE_RESUME)
        assert score == 100

    def test_completeness_score_empty(self):
        score = self.detector.get_section_completeness_score("no sections here")
        assert score == 0


class TestFormattingChecker:
    def setup_method(self):
        self.checker = FormattingChecker()

    def test_clean_resume_no_risks(self):
        risks = self.checker.check_ats_risks(SAMPLE_RESUME)
        high_risks = [r for r in risks if r.severity == "high"]
        assert len(high_risks) == 0

    def test_table_detected(self):
        text = "| Name | Role |\n|------|------|\n| John | Dev  |"
        risks = self.checker.check_ats_risks(text)
        table_risks = [r for r in risks if "Tables" in r.risk]
        assert len(table_risks) > 0

    def test_icons_detected(self):
        text = "Skills: ⚡ Python ⚡ Docker ⚡ React ⚡ Node ⚡ AWS"
        risks = self.checker.check_ats_risks(text)
        icon_risks = [r for r in risks if "Icons" in r.risk]
        assert len(icon_risks) > 0

    def test_formatting_score_clean(self):
        assert self.checker.get_formatting_score([]) == 100

    def test_formatting_score_penalties(self):
        from app.models.schemas import AtsRisk
        risks = [
            AtsRisk(risk="Table", severity="high", detail="test"),
            AtsRisk(risk="Icon", severity="medium", detail="test"),
        ]
        score = self.checker.get_formatting_score(risks)
        assert score == 70  # 100 - 20 - 10


class TestAtsScorer:
    def setup_method(self):
        self.scorer = AtsScorer()

    def test_analyze_full_flow(self):
        result = self.scorer.analyze(SAMPLE_RESUME, SAMPLE_JD)
        assert 0 <= result.overall_score <= 100
        assert len(result.section_scores) == 5
        assert len(result.matched_keywords) > 0
        assert len(result.detected_sections) > 0
        assert result.summary

    def test_analyze_empty_resume(self):
        result = self.scorer.analyze("", SAMPLE_JD)
        assert result.overall_score < 30

    def test_analyze_mismatch(self):
        bad_resume = "I like cooking and gardening."
        result = self.scorer.analyze(bad_resume, SAMPLE_JD)
        self_check = result.overall_score < 50
        assert self_check or len(result.missing_keywords) > len(result.matched_keywords)
