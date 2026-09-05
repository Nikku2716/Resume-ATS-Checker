import React, { Component } from "react";
import { AlertOctagon, RotateCcw, Home, Copy, Check, ShieldCheck } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ResumeLint ErrorBoundary caught an unhandled exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleCopyDetails = async () => {
    const { error, errorInfo } = this.state;
    const details = [
      "ResumeLint Client-Side Error Log",
      "================================",
      `Error: ${error?.toString() || "Unknown Error"}`,
      "",
      "Component Stack:",
      errorInfo?.componentStack || "No stack trace available",
      "",
      `Timestamp: ${new Date().toISOString()}`,
      `User Agent: ${typeof navigator !== "undefined" ? navigator.userAgent : "N/A"}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(details);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = details;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto my-12 max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 sm:p-8 shadow-card-elevated"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertOctagon className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 font-mono">
                  Client-Side Exception
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  Something went wrong during local execution
                </h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                An unexpected error occurred while processing your request locally in the browser. No
                resume or job description data was lost or transmitted to any server.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="btn-primary text-xs sm:text-sm cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Try Again</span>
                </button>

                <a
                  href="/"
                  className="btn-secondary text-xs sm:text-sm"
                  onClick={() => window.location.href = "/"}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Reload Application</span>
                </a>

                <button
                  type="button"
                  onClick={this.handleCopyDetails}
                  className="btn-secondary text-xs sm:text-sm cursor-pointer text-slate-600"
                  aria-label="Copy error technical details"
                >
                  {this.state.copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-700 font-semibold">Error Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" aria-hidden="true" />
                      <span>Copy Error Details</span>
                    </>
                  )}
                </button>
              </div>

              {/* Technical Details Accordion */}
              {this.state.error && (
                <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                  <summary className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900">
                    Technical Error Details
                  </summary>
                  <div className="mt-2 space-y-2 font-mono text-[11px] text-rose-800">
                    <p className="font-bold">{this.state.error.toString()}</p>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-slate-900 p-2 text-slate-100">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Privacy Reassurance Banner */}
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50/80 px-3 py-2 text-xs text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <span>
                  <strong>100% Privacy Guarantee:</strong> Your documents never left your device.
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
