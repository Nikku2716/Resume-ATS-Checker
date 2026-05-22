import re
from typing import List, Tuple


class SectionDetector:
    STANDARD_SECTIONS = {
        "summary": ["summary", "professional summary", "profile", "about me", "objective", "career objective"],
        "experience": ["experience", "work experience", "professional experience", "employment", "work history", "career history"],
        "education": ["education", "academic background", "academic", "qualifications", "degrees"],
        "skills": ["skills", "technical skills", "core competencies", "expertise", "competencies", "key skills"],
        "projects": ["projects", "project experience", "personal projects"],
        "certifications": ["certifications", "certificates", "licenses", "accreditations"],
        "languages": ["languages", "language proficiency"],
        "publications": ["publications", "papers", "research"],
        "volunteering": ["volunteer", "volunteering", "community service"],
        "references": ["references", "referees"],
    }

    def detect_sections(self, text: str) -> List[str]:
        text_lower = text.lower()
        lines = text_lower.split("\n")
        found_sections = set()

        for section_name, patterns in self.STANDARD_SECTIONS.items():
            for pattern in patterns:
                if self._section_exists(lines, pattern):
                    found_sections.add(section_name)
                    break

        return sorted(found_sections)

    def _section_exists(self, lines: List[str], pattern: str) -> bool:
        for line in lines:
            stripped = line.strip()
            if stripped.startswith(pattern) or stripped == pattern:
                if len(stripped) < len(pattern) + 20:
                    return True

            if stripped.rstrip(":").strip() == pattern:
                return True

            if re.match(r"^#{1,3}\s*" + re.escape(pattern) + r"\s*$", stripped):
                return True

        return False

    def get_missing_sections(self, text: str) -> List[str]:
        found = set(self.detect_sections(text))
        required = {"summary", "experience", "education", "skills"}
        return sorted(required - found)

    def get_section_completeness_score(self, text: str) -> int:
        required = {"summary", "experience", "education", "skills"}
        found = set(self.detect_sections(text))
        present = required & found
        return int((len(present) / len(required)) * 100)
