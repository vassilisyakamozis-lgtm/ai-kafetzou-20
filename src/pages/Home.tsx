// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-primary mb-6 flex items-center gap-2">
        <Coffee className="h-8 w-8" />
        Καλώς ήρθες στην AI Καφετζού ☕
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Διάλεξε καφετζού, ανέβασε φωτογραφία από το φλιτζάνι σου και ξεκίνα την ανάγνωση.
      </p>

      <Link
        to="/cup"
        className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/80 transition"
      >
        Ξεκίνα Ανάγνωση Φλιτζανιού
      </Link>
    </div>
  );
}