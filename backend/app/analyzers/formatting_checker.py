import re
from typing import List

from ..models.schemas import AtsRisk


class FormattingChecker:
    TABLE_LINE = re.compile(r"^\s*\|.+\|\s*$", re.MULTILINE)
    TABLE_BORDER = re.compile(r"^[\+\-=\s]+$", re.MULTILINE)
    MULTI_COLUMN_PATTERN = re.compile(
        r"(?:^.{60,}\s{5,}.{20,}\s*$)",
        re.MULTILINE,
    )
    UNUSUAL_HEADING_PATTERN = re.compile(
        r"^[^a-zA-Z0-9\s]{2,}\s*$",
        re.MULTILINE,
    )

    def check_ats_risks(self, resume_text: str) -> List[AtsRisk]:
        risks: List[AtsRisk] = []

        table_risk = self._check_tables(resume_text)
        if table_risk:
            risks.append(table_risk)

        multi_col_risk = self._check_multi_column(resume_text)
        if multi_col_risk:
            risks.append(multi_col_risk)

        unusual_heading_risk = self._check_unusual_headings(resume_text)
        if unusual_heading_risk:
            risks.append(unusual_heading_risk)

        image_risk = self._check_images(resume_text)
        if image_risk:
            risks.append(image_risk)

        icon_risk = self._check_icons(resume_text)
        if icon_risk:
            risks.append(icon_risk)

        text_box_risk = self._check_text_boxes(resume_text)
        if text_box_risk:
            risks.append(text_box_risk)

        return risks

    def _check_tables(self, text: str) -> AtsRisk | None:
        lines = text.split("\n")
        table_lines = sum(1 for l in lines if self.TABLE_LINE.match(l) or self.TABLE_BORDER.match(l))
        if table_lines >= 2:
            return AtsRisk(
                risk="Tables detected",
                severity="high",
                detail="Tables may not be parsed correctly by ATS. Convert table content into plain text sections.",
            )
        return None

    def _check_multi_column(self, text: str) -> AtsRisk | None:
        lines = text.split("\n")
        wide_lines = [l for l in lines if len(l.strip()) > 100]
        if len(wide_lines) > 5:
            return AtsRisk(
                risk="Possible multi-column layout",
                severity="medium",
                detail="Long lines detected. Multi-column layouts often confuse ATS parsers. Use a single-column format.",
            )
        return None

    def _check_unusual_headings(self, text: str) -> AtsRisk | None:
        lines = text.split("\n")
        unusual = [l for l in lines if self.UNUSUAL_HEADING_PATTERN.match(l.strip())]
        if unusual:
            return AtsRisk(
                risk="Unusual section headings",
                severity="medium",
                detail=f"Found {len(unusual)} heading(s) with non-standard formatting. Use standard section headers like 'Experience', 'Education', 'Skills'.",
            )
        return None

    def _check_images(self, text: str) -> AtsRisk | None:
        if "@@IMAGE@@" in text or "[[image:" in text.lower():
            return AtsRisk(
                risk="Images detected",
                severity="high",
                detail="Images are not readable by ATS. Remove images or replace with descriptive text.",
            )

        image_count = text.count("img") + text.count(".png") + text.count(".jpg") + text.count(".jpeg")
        if image_count > 0:
            text_ratio = image_count / max(len(text), 1)
            if text_ratio > 0.01:
                return AtsRisk(
                    risk="Possible embedded images",
                    severity="high",
                    detail="Images or icons may be embedded. ATS cannot read content inside images. Use text instead.",
                )
        return None

    def _check_icons(self, text: str) -> AtsRisk | None:
        icon_chars = sum(1 for c in text if ord(c) > 0x1F300 and ord(c) < 0x1F9FF)
        icon_chars += sum(1 for c in text if ord(c) in range(0x2600, 0x27BF))
        icon_chars += sum(1 for c in text if ord(c) in range(0x2300, 0x23FF))

        if icon_chars >= 5:
            return AtsRisk(
                risk="Icons or symbols detected",
                severity="medium",
                detail=f"Found roughly {icon_chars} icon/symbol characters. Icons may not render in ATS systems. Use plain text bullets instead.",
            )
        return None

    def _check_text_boxes(self, text: str) -> AtsRisk | None:
        lines = text.split("\n")
        short_indented = [l for l in lines if l.startswith("   ") and len(l.strip()) < 20 and len(l.strip()) > 0]
        if len(short_indented) > 3:
            return AtsRisk(
                risk="Possible text boxes or floating elements",
                severity="medium",
                detail="Short indented lines detected. Text boxes may not be read by ATS in correct order. Use standard linear text flow.",
            )
        return None

    def get_formatting_score(self, risks: List[AtsRisk]) -> int:
        score = 100
        for risk in risks:
            if risk.severity == "high":
                score -= 20
            elif risk.severity == "medium":
                score -= 10
            else:
                score -= 5
        return max(0, score)
