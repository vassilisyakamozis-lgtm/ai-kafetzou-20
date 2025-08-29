// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-white">
      <Coffee className="h-12 w-12 text-purple-600 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Καλώς ήρθες στην Ai Kafetzou</h1>
      <p className="text-gray-600 mb-6">Η τεχνητή νοημοσύνη που διαβάζει το φλιτζάνι σου ☕</p>

      <Link
        to="/cup"
        className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
      >
        Διάβασε το Φλιτζάνι σου
      </Link>
    </div>
  );
}