const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function analyzeText(resumeText, jobDescription) {
  const res = await fetch(`${API_BASE}/analyze/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}

export async function analyzeFile(file, jobDescription) {
  const form = new FormData();
  form.append("file", file);
  form.append("job_description", jobDescription);
  const res = await fetch(`${API_BASE}/analyze/file`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Analysis failed");
  }
  return res.json();
}
