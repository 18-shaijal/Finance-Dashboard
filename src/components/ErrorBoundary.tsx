import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            maxWidth: 720,
            margin: "48px auto",
          }}
        >
          <h1 style={{ fontSize: 20, marginBottom: 12 }}>Something broke</h1>
          <p style={{ color: "#444", marginBottom: 16 }}>
            Hard refresh first. If it persists, clear storage for this site (key{" "}
            <code>finance-dashboard-v1</code>).
          </p>
          <pre
            style={{
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              overflow: "auto",
              fontSize: 13,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
