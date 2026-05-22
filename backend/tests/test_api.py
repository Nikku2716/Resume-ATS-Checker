import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_text_success(client):
    response = client.post(
        "/analyze/text",
        json={
            "resume_text": "Professional summary\nSkills: Python, React\n",
            "job_description": "Looking for Python developer with React skills",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert "section_scores" in data
    assert "matched_keywords" in data
    assert "missing_keywords" in data


def test_analyze_text_empty_resume(client):
    response = client.post(
        "/analyze/text",
        json={"resume_text": "", "job_description": "test"},
    )
    assert response.status_code == 400


def test_analyze_text_empty_jd(client):
    response = client.post(
        "/analyze/text",
        json={"resume_text": "test", "job_description": ""},
    )
    assert response.status_code == 400


def test_analyze_file_unsupported(client):
    response = client.post(
        "/analyze/file",
        data={"job_description": "test"},
        files={"file": ("resume.xyz", b"test", "application/octet-stream")},
    )
    assert response.status_code == 400
