pub mod action_verbs;
pub mod experience;
pub mod formatting;
pub mod keywords;
pub mod recommendations;
pub mod result;
pub mod scoring;
pub mod sections;
pub mod skills;
pub mod tokenize;

pub use result::{
    AnalysisMetadata, AnalysisResponse, AtsRisk, ImprovementSuggestion, KeywordMatch, SectionScore,
};
pub use scoring::AtsScorer;

use wasm_bindgen::prelude::*;

/// Internal Rust API for direct evaluation.
pub fn analyze(resume_text: &str, job_description: &str) -> AnalysisResponse {
    let scorer = AtsScorer::new();
    scorer.analyze(resume_text, job_description)
}

/// Initialize panic hook for browser debugging.
#[wasm_bindgen]
pub fn init_engine() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

/// Returns the engine version.
#[wasm_bindgen]
pub fn get_engine_version() -> String {
    "1.0.0".to_string()
}

/// Returns the ATS contract version.
#[wasm_bindgen]
pub fn get_contract_version() -> String {
    "1.0.0".to_string()
}

/// Main WebAssembly entry point that analyzes resume and job description,
/// returning the AnalysisResponse as a native JavaScript object.
#[wasm_bindgen]
pub fn analyze_resume(resume_text: &str, job_description: &str) -> Result<JsValue, JsValue> {
    let response = analyze(resume_text, job_description);
    serde_wasm_bindgen::to_value(&response)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// WebAssembly entry point returning the AnalysisResponse as a raw JSON string.
#[wasm_bindgen]
pub fn analyze_resume_json(resume_text: &str, job_description: &str) -> Result<String, JsValue> {
    let response = analyze(resume_text, job_description);
    serde_json::to_string(&response)
        .map_err(|e| JsValue::from_str(&format!("JSON serialization error: {}", e)))
}
