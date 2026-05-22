import pytest
from app.parsers.text_extractor import extract_text, extract_text_from_txt
from app.parsers.file_handler import parse_uploaded_file


class TestTextExtractor:
    def test_extract_text_basic(self):
        assert extract_text("  Hello   World  ") == "Hello World"

    def test_extract_text_empty(self):
        assert extract_text("") == ""

    def test_extract_text_whitespace_only(self):
        assert extract_text("   \n\n  \t  ") == ""

    def test_extract_text_tab_and_newline(self):
        result = extract_text("Line1\t\nLine2")
        assert "Line1" in result
        assert "Line2" in result
        assert "\n" in result


class TestTxtParser:
    def test_txt_parse(self):
        text = "Hello\nWorld"
        result = extract_text_from_txt(text)
        assert result == "Hello\nWorld"
        assert "\n" in result

    def test_empty_txt(self):
        result = parse_uploaded_file(b"", "resume.txt")
        assert result == ""


class TestFileHandler:
    def test_unsupported_extension(self):
        with pytest.raises(ValueError, match="Unsupported file type"):
            parse_uploaded_file(b"test", "resume.xyz")

    def test_txt_upload(self):
        text = "Hello World"
        result = parse_uploaded_file(text.encode("utf-8"), "resume.txt")
        assert result == "Hello World"

    def test_empty_txt_upload(self):
        result = parse_uploaded_file(b"", "resume.txt")
        assert result == ""
