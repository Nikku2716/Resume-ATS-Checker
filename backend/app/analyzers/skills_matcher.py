import re
from typing import List, Tuple

from ..models.schemas import KeywordMatch


class SkillsMatcher:
    TECH_SKILLS = {
        "python", "java", "javascript", "typescript", "go", "rust", "c++", "c#",
        "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "sql",
        "react", "angular", "vue", "svelte", "nextjs", "nuxt", "django",
        "flask", "fastapi", "spring", "express", "nodejs", "rails", "laravel",
        "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible",
        "jenkins", "gitlab", "github", "ci/cd", "pytorch", "tensorflow",
        "keras", "scikit-learn", "pandas", "numpy", "spark", "hadoop",
        "kafka", "redis", "mongodb", "postgresql", "mysql", "elasticsearch",
        "graphql", "rest", "grpc", "html", "css", "sass", "tailwind",
        "bootstrap", "figma", "sketch", "adobe", "jira", "confluence",
        "agile", "scrum", "kanban", "linux", "bash", "powershell",
        "git", "svn", "webpack", "vite", "babel", "eslint", "prettier",
        "jest", "mocha", "cypress", "selenium", "playwright",
        "machine learning", "deep learning", "nlp", "computer vision",
        "data science", "data engineering", "data analysis", "statistics",
        "tableau", "powerbi", "looker", "airflow", "dbt", "snowflake",
        "bigquery", "redshift", "databricks", "mlflow", "kubeflow",
        "microservices", "serverless", "event-driven", "soa",
        "oauth", "jwt", "saml", "ldap", "ssl/tls",
    }

    SOFT_SKILLS = {
        "leadership", "communication", "teamwork", "problem-solving",
        "analytical", "critical thinking", "project management",
        "time management", "collaboration", "mentoring", "presentation",
        "negotiation", "conflict resolution", "decision making",
        "creativity", "adaptability", "attention to detail",
        "organizational", "strategic planning", "stakeholder management",
    }

    def __init__(self):
        self.all_skills = self.TECH_SKILLS | self.SOFT_SKILLS

    def extract_skills(self, text: str) -> List[str]:
        text_lower = text.lower()
        found = set()
        for skill in self.all_skills:
            if re.search(r"\b" + re.escape(skill) + r"\b", text_lower):
                found.add(skill)
        return sorted(found)

    def match_skills(self, resume_text: str, jd_text: str) -> Tuple[List[KeywordMatch], List[KeywordMatch]]:
        resume_skills = set(self.extract_skills(resume_text))
        jd_skills = set(self.extract_skills(jd_text))

        matched = []
        missing = []

        for skill in sorted(jd_skills):
            if skill in resume_skills:
                matched.append(KeywordMatch(keyword=skill, matched=True))
            else:
                missing.append(KeywordMatch(keyword=skill, matched=False))

        return matched, missing

    def get_skills_score(self, matched: List[KeywordMatch], missing: List[KeywordMatch]) -> int:
        total = len(matched) + len(missing)
        if total == 0:
            return 100
        return int((len(matched) / total) * 100)
