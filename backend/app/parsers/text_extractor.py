import re


def extract_text(content: str) -> str:
    text = content.strip()
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def extract_text_from_txt(raw: str) -> str:
    return extract_text(raw)
