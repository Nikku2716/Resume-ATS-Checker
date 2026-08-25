from typing import Dict, List

from ..models.schemas import (
    AnalysisResponse,
    SectionScore,
    KeywordMatch,
    AtsRisk,
    ImprovementSuggestion,
)
from .keyword_matcher import KeywordMatcher
from .skills_matcher import SkillsMatcher
from .section_detector import SectionDetector
from .formatting_checker import FormattingChecker
from .action_verb_analyzer import ActionVerbAnalyzer


class AtsScorer:
    def __init__(self):
        self.keyword_matcher = KeywordMatcher()
        self.skills_matcher = SkillsMatcher()
        self.section_detector = SectionDetector()
        self.formatting_checker = FormattingChecker()
        self.action_verb_analyzer = ActionVerbAnalyzer()

    def analyze(self, resume_text: str, job_description: str) -> AnalysisResponse:
        resume_keywords = self.keyword_matcher.extract_keywords(resume_text)
        jd_keywords = self.keyword_matcher.extract_keywords(job_description)

        matched_keywords, missing_keywords = self.keyword_matcher.score_keywords(
            resume_keywords, jd_keywords
        )

        matched_skills, missing_skills = self.skills_matcher.match_skills(
            resume_text, job_description
        )

        detected_sections = self.section_detector.detect_sections(resume_text)
        missing_sections = self.section_detector.get_missing_sections(resume_text)

        ats_risks = self.formatting_checker.check_ats_risks(resume_text)
        action_verb_analysis = self.action_verb_analyzer.analyze(resume_text)

        keyword_score = self.keyword_matcher.get_keyword_score(
            matched_keywords, missing_keywords
        )
        skills_score = self.skills_matcher.get_skills_score(
            matched_skills, missing_skills
        )
        experience_relevance_score = self._compute_experience_relevance(
            resume_text, job_description, jd_keywords
        )
        formatting_score = self.formatting_checker.get_formatting_score(ats_risks)
        section_score = self.section_detector.get_section_completeness_score(
            resume_text
        )

        section_scores = [
            SectionScore(
                name="Keyword Match",
                score=keyword_score,
                weight=0.30,
                details=f"{len(matched_keywords)} of {len(matched_keywords) + len(missing_keywords)} job keywords found in resume.",
            ),
            SectionScore(
                name="Skills Match",
                score=skills_score,
                weight=0.25,
                details=f"{len(matched_skills)} of {len(matched_skills) + len(missing_skills)} required skills found.",
            ),
            SectionScore(
                name="Experience Relevance",
                score=experience_relevance_score,
                weight=0.20,
                details="Alignment between resume experience and job requirements.",
            ),
            SectionScore(
                name="Formatting / ATS Readability",
                score=formatting_score,
                weight=0.15,
                details=f"{len(ats_risks)} formatting issue(s) detected that may affect ATS parsing.",
            ),
            SectionScore(
                name="Contact & Section Completeness",
                score=section_score,
                weight=0.10,
                details=f"Standard sections found: {', '.join(detected_sections) if detected_sections else 'none'}. Missing: {', '.join(missing_sections) if missing_sections else 'none'}.",
            ),
        ]

        overall_score = self._compute_overall(section_scores)

        suggestions = self._generate_suggestions(
            missing_keywords,
            missing_skills,
            missing_sections,
            ats_risks,
            section_scores,
            action_verb_analysis,
        )

        summary = self._generate_summary(overall_score, len(matched_keywords), len(missing_keywords))

        return AnalysisResponse(
            overall_score=overall_score,
            section_scores=section_scores,
            matched_keywords=matched_keywords[:30],
            missing_keywords=missing_keywords[:30],
            ats_risks=ats_risks,
            suggestions=suggestions,
            detected_sections=detected_sections,
            missing_sections=missing_sections,
            summary=summary,
        )

    def _compute_experience_relevance(
        self, resume_text: str, jd_text: str, jd_keywords: List[str]
    ) -> int:
        resume_lower = resume_text.lower()
        jd_lower = jd_text.lower()

        years_resume = self._extract_years_experience(resume_lower)
        years_jd = self._extract_years_experience(jd_lower)

        match_count = sum(1 for kw in jd_keywords if kw in resume_lower)
        total_jd_terms = max(len(jd_keywords), 1)
        term_score = (match_count / total_jd_terms) * 100

        if years_jd > 0 and years_resume > 0:
            year_ratio = min(years_resume / years_jd, 1.5)
            year_score = min(year_ratio * 100, 100)
        else:
            year_score = 100

        return int(term_score * 0.6 + year_score * 0.4)

    def _extract_years_experience(self, text: str) -> int:
        import re

        patterns = [
            r"(\d+)\+?\s*years?\s*(?:of\s+)?experience",
            r"(\d+)\+?\s*years?\s*(?:of\s+)?work",
            r"experience\s*(?:of|:)?\s*(\d+)\+?\s*years?",
        ]
        for pat in patterns:
            m = re.search(pat, text)
            if m:
                return int(m.group(1))

        years = re.findall(r"\b(20\d{2})\b", text)
        if len(years) >= 2:
            years_int = sorted(int(y) for y in years)
            span = years_int[-1] - years_int[0]
            return max(1, span)

        return 0

    def _compute_overall(self, section_scores: List[SectionScore]) -> int:
        weighted = sum(s.score * s.weight for s in section_scores)
        return min(100, max(0, int(weighted)))

    def _generate_suggestions(
        self,
        missing_keywords: List[KeywordMatch],
        missing_skills: List[KeywordMatch],
        missing_sections: List[str],
        ats_risks: List[AtsRisk],
        section_scores: List[SectionScore],
        action_verb_analysis: Dict,
    ) -> List[ImprovementSuggestion]:
        suggestions: List[ImprovementSuggestion] = []

        suggestions.extend(self.action_verb_analyzer.get_suggestions(action_verb_analysis))

        if missing_keywords:
            top_missing = [k.keyword for k in missing_keywords[:5]]
            suggestions.append(
                ImprovementSuggestion(
                    category="Keywords",
                    priority="critical",
                    suggestion=f"Add these missing keywords to your resume: {', '.join(top_missing)}.",
                    location="Skills / Experience sections",
                )
            )

        if missing_skills:
            top_skills = [s.keyword for s in missing_skills[:5]]
            suggestions.append(
                ImprovementSuggestion(
                    category="Skills",
                    priority="high",
                    suggestion=f"Add these missing skills to your Skills section: {', '.join(top_skills)}.",
                    location="Skills section",
                )
            )

        if "summary" in missing_sections:
            suggestions.append(
                ImprovementSuggestion(
                    category="Sections",
                    priority="high",
                    suggestion='Add a "Professional Summary" section at the top. This is one of the first sections ATS parsers look for.',
                    location="Top of resume",
                )
            )

        if "skills" in missing_sections:
            suggestions.append(
                ImprovementSuggestion(
                    category="Sections",
                    priority="high",
                    suggestion='Add a dedicated "Skills" section with relevant technical and soft skills listed clearly.',
                    location="After Summary section",
                )
            )

        if "experience" in missing_sections:
            suggestions.append(
                ImprovementSuggestion(
                    category="Sections",
                    priority="critical",
                    suggestion='Add a "Work Experience" section with your employment history, job titles, and dates.',
                    location="After Summary section",
                )
            )

        for risk in ats_risks:
            suggestions.append(
                ImprovementSuggestion(
                    category="Formatting",
                    priority="high" if risk.severity == "high" else "medium",
                    suggestion=risk.detail,
                    location="Throughout resume",
                )
            )

        for s in section_scores:
            if s.name == "Keyword Match" and s.score < 50:
                suggestions.append(
                    ImprovementSuggestion(
                        category="Keywords",
                        priority="high",
                        suggestion="Keyword match is low. Study the job description and incorporate its language naturally into your resume.",
                        location="Experience / Skills sections",
                    )
                )

        return suggestions

    def _generate_summary(self, score: int, matched_count: int, missing_count: int) -> str:
        if score >= 80:
            return f"Strong ATS compatibility (score: {score}/100). Your resume is well-optimized for ATS screening. Only {missing_count} missing keywords identified."
        elif score >= 60:
            return f"Moderate ATS compatibility (score: {score}/100). {matched_count} keywords matched but {missing_count} are missing. Address the suggestions below to improve."
        elif score >= 40:
            return f"Below average ATS compatibility (score: {score}/100). Significant keyword gaps ({missing_count} missing) and potential formatting issues. Prioritize the critical fixes."
        else:
            return f"Low ATS compatibility (score: {score}/100). Major improvements needed. Focus on adding standard sections and incorporating job-specific keywords."
