import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: unknown) {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }
  componentDidCatch(error: unknown) {
    console.error("Unhandled error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-xl mx-auto text-center">
          <h1 className="text-2xl font-semibold mb-2">Κάτι πήγε στραβά</h1>
          <p className="opacity-80 mb-4">{this.state.message ?? "Άγνωστο σφάλμα."}</p>
          <button onClick={() => location.reload()} className="px-4 py-2 rounded bg-black text-white">
            Επαναφόρτωση
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
