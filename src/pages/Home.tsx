// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { Coffee, Feather } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-white">
      <h1 className="text-4xl font-bold text-purple-700 mb-4 flex items-center gap-2">
        <Coffee className="h-8 w-8" />
        Καλώς Ήρθες στην AI Kafetzou
      </h1>
      <p className="text-gray-600 mb-8 text-center max-w-xl">
        Ξεκλείδωσε την αρχαία τέχνη της καφεμαντείας με τη δύναμη της Τεχνητής Νοημοσύνης.
      </p>
      <Link
        to="/cup"
        className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
      >
        Διάβασε το Φλιτζάνι σου
      </Link>
      <div className="mt-10 flex items-center gap-2 text-gray-500">
        <Feather className="h-5 w-5" />
        <span>Ανακάλυψε τα μυστικά που κρύβει το μέλλον</span>
      </div>
    </div>
  );
}
