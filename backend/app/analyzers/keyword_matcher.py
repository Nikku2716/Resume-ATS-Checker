import re
from typing import List, Tuple
from collections import Counter

from ..models.schemas import KeywordMatch


class KeywordMatcher:
    COMMON_WORDS = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
        "been", "being", "have", "has", "had", "do", "does", "did", "will",
        "would", "could", "should", "may", "might", "shall", "can", "need",
        "dare", "ought", "used", "this", "that", "these", "those", "i", "we",
        "you", "they", "he", "she", "it", "my", "our", "your", "his", "her",
        "its", "their", "me", "us", "him", "them", "about", "into", "over",
        "after", "before", "between", "under", "above", "below", "out", "off",
        "up", "down", "just", "also", "very", "too", "really", "quite",
        "some", "any", "each", "every", "both", "few", "more", "most",
        "other", "such", "only", "own", "same", "than", "then", "now",
        "here", "there", "when", "where", "why", "how", "all", "who", "whom",
        "which", "what", "if", "while", "because", "although", "since",
        "until", "once", "so", "than", "whether", "no", "not", "nor",
        "none", "nothing", "neither", "nobody", "never",
    }

    def __init__(self):
        self._variant_cache: dict = {}

    def extract_keywords(self, text: str, max_keywords: int = 100) -> List[str]:
        text_lower = text.lower()
        text_lower = re.sub(r"[^a-z0-9\s\-/+#.]", " ", text_lower)
        tokens = [t for t in text_lower.split() if len(t) >= 2 and t not in self.COMMON_WORDS]

        bigrams = [" ".join(tokens[i:i+2]) for i in range(len(tokens) - 1)]

        term_scores: dict[str, int] = {}

        for phrase in bigrams:
            words = phrase.split()
            if any(w in self.COMMON_WORDS for w in words):
                continue
            term_scores[phrase] = term_scores.get(phrase, 0) + 3

        for word in tokens:
            term_scores[word] = term_scores.get(word, 0) + 1

        sorted_terms = sorted(term_scores.items(), key=lambda x: (-x[1], -len(x[0])))
        return [term for term, _ in sorted_terms[:max_keywords]]

    def score_keywords(self, resume_keywords: List[str], jd_keywords: List[str]) -> Tuple[List[KeywordMatch], List[KeywordMatch]]:
        resume_set = set(resume_keywords)
        resume_words = set()
        for kw in resume_keywords:
            resume_words.update(kw.split())
            resume_words.update(self._get_variants(kw))

        matched: List[KeywordMatch] = []
        missing: List[KeywordMatch] = []

        for kw in jd_keywords:
            found = kw in resume_set
            kw_words = kw.split()
            if not found and len(kw_words) > 1:
                found = any(w in resume_words for w in kw_words)

            variants = self._get_variants(kw)
            matched_variants = [v for v in variants if v in resume_set]
            if matched_variants:
                found = True

            if found:
                matched.append(KeywordMatch(
                    keyword=kw,
                    matched=True,
                    variants=matched_variants if matched_variants else None,
                ))
            else:
                missing.append(KeywordMatch(
                    keyword=kw,
                    matched=False,
                ))

        return matched, missing

    def _get_variants(self, word: str) -> List[str]:
        if word in self._variant_cache:
            return self._variant_cache[word]

        variants = {word}
        if "-" in word:
            variants.add(word.replace("-", " "))
            variants.add(word.replace("-", ""))
        if "/" in word:
            parts = word.split("/")
            variants.update(parts)
            variants.add(" ".join(parts))
        if word.endswith("s") and len(word) > 3:
            variants.add(word[:-1])
        if word.endswith("ing") and len(word) > 5:
            variants.add(word[:-3])
            variants.add(word[:-3] + "e")
        if word.endswith("ed") and len(word) > 4:
            variants.add(word[:-2])
            variants.add(word[:-2] + "e")
        if word.endswith("tion"):
            variants.add(word[:-4] + "te")
        if word.endswith("ly"):
            variants.add(word[:-2])

        result = list(variants - {word})
        self._variant_cache[word] = result
        return result

    def get_keyword_score(self, matched: List[KeywordMatch], missing: List[KeywordMatch]) -> int:
        total = len(matched) + len(missing)
        if total == 0:
            return 100
        return int((len(matched) / total) * 100)
