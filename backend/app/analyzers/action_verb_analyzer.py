import re
from typing import Dict, List

from ..models.schemas import ImprovementSuggestion


WEAK_PHRASES: Dict[str, str] = {
    "responsible for": "Led / Owned",
    "worked on": "Built / Delivered",
    "helped with": "Drove",
    "assisted in": "Drove",
    "duties included": "Delivered",
    "in charge of": "Owned",
    "participated in": "Contributed to (specify outcome)",
    "was involved in": "Spearheaded",
    "tasked with": "Owned",
}

STRONG_ACTION_VERBS = [
    "led", "built", "designed", "developed", "launched", "shipped",
    "optimized", "reduced", "increased", "automated", "architected",
    "implemented", "delivered", "improved", "scaled", "migrated",
]

BUZZWORDS = [
    "synergy", "synergies", "thought leader", "thought leadership",
    "guru", "ninja", "rockstar", "wizard", "go-getter",
    "think outside the box", "results-driven professional",
    "hard worker", "team player with", "detail-oriented individual",
]


class ActionVerbAnalyzer:
    """Detects weak passive phrasing and empty buzzwords, and measures the
    density of strong action verbs — all of which affect how recruiters and
    modern ATS keyword parsers read accomplishment bullet points."""

    def analyze(self, resume_text: str) -> Dict:
        text_lower = resume_text.lower()

        weak_found = []
        for phrase, replacement in WEAK_PHRASES.items():
            count = len(re.findall(r"\b" + re.escape(phrase) + r"\b", text_lower))
            if count:
                weak_found.append({"phrase": phrase, "count": count, "replacement": replacement})

        buzzwords_found = [
            bw for bw in BUZZWORDS if re.search(r"\b" + re.escape(bw), text_lower)
        ]

        verb_count = sum(
            len(re.findall(r"\b" + re.escape(v) + r"\b", text_lower))
            for v in STRONG_ACTION_VERBS
        )
        word_count = max(len(resume_text.split()), 1)
        # ~1 strong verb per 25 words is a healthy accomplishments-driven resume.
        verb_density = round(verb_count / word_count * 100, 2)

        score = self.get_action_verb_score(weak_found, buzzwords_found, verb_density)

        return {
            "score": score,
            "weak_phrases": weak_found,
            "buzzwords": buzzwords_found,
            "strong_verb_count": verb_count,
            "strong_verb_density": verb_density,
        }

    def get_action_verb_score(
        self,
        weak_phrases: List[Dict],
        buzzwords: List[str],
        verb_density: float,
    ) -> int:
        score = 100

        total_weak = sum(w["count"] for w in weak_phrases)
        score -= min(total_weak * 10, 40)
        score -= min(len(buzzwords) * 8, 24)

        if verb_density < 0.5:
            score -= 20
        elif verb_density < 1.0:
            score -= 10

        return max(0, min(100, score))

    def get_suggestions(self, analysis: Dict) -> List[ImprovementSuggestion]:
        suggestions: List[ImprovementSuggestion] = []

        for w in analysis["weak_phrases"][:3]:
            suggestions.append(
                ImprovementSuggestion(
                    category="Action Verbs",
                    priority="high" if w["count"] > 1 else "medium",
                    suggestion=(
                        f'Replace the passive phrase "{w["phrase"]}" ({w["count"]}x) '
                        f'with a strong verb like "{w["replacement"]}".'
                    ),
                    location="Experience section bullets",
                )
            )

        if analysis["buzzwords"]:
            suggestions.append(
                ImprovementSuggestion(
                    category="Buzzwords",
                    priority="medium",
                    suggestion=(
                        f'Remove filler buzzwords: {", ".join(analysis["buzzwords"][:4])}. '
                        "Replace them with concrete achievements and measurable results."
                    ),
                    location="Summary / Experience sections",
                )
            )

        if analysis["strong_verb_density"] < 0.5:
            suggestions.append(
                ImprovementSuggestion(
                    category="Action Verbs",
                    priority="high",
                    suggestion=(
                        "Resume reads passively. Start each experience bullet with a "
                        "strong action verb (led, built, shipped, optimized...) and "
                        "quantify the impact."
                    ),
                    location="Experience section",
                )
            )

        return suggestions
