import logging
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models.schemas import AnalysisRequest, AnalysisResponse
from .analyzers import AtsScorer
from .parsers import parse_uploaded_file, extract_text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Resume ATS Checker API",
    description="Analyze resumes against job descriptions for ATS compatibility",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scorer = AtsScorer()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze/text", response_model=AnalysisResponse)
async def analyze_text(payload: AnalysisRequest):
    try:
        resume_text = extract_text(payload.resume_text)
        jd_text = extract_text(payload.job_description)

        if not resume_text:
            raise HTTPException(status_code=400, detail="Resume text is empty")
        if not jd_text:
            raise HTTPException(status_code=400, detail="Job description is empty")

        result = scorer.analyze(resume_text, jd_text)
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze/file", response_model=AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt"}
    ext = Path(file.filename or "").suffix.lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Supported: PDF, DOCX, TXT",
        )

    try:
        content = await file.read()
        resume_text = parse_uploaded_file(content, file.filename or "resume.txt")
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"Parsing library missing: {e}")
    except Exception as e:
        logger.exception("File parsing failed")
        raise HTTPException(
            status_code=422,
            detail=f"Failed to parse file: {e}",
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract any text from the uploaded file. The file may contain only images or be corrupted.",
        )

    jd_text = extract_text(job_description)
    if not jd_text:
        raise HTTPException(status_code=400, detail="Job description is empty")

    try:
        result = scorer.analyze(resume_text, jd_text)
        return result
    except Exception as e:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=str(e))
