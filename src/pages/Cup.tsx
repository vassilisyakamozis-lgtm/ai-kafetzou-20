import { Link, useNavigate } from "react-router-dom";

type Persona = {
  id: "classic" | "young" | "mystic";
  name: string;
  desc: string;
  img: string;
};

const PERSONAS: Persona[] = [
  {
    id: "classic",
    name: "Κλασική Καφετζού",
    desc: "παραδοσιακό, ζεστό ύφος",
    img: "/assets/kafetzou-classic.png",
  },
  {
    id: "young",
    name: "Νεαρή Καφετζού",
    desc: "ανάλαφρο, παιχνιδιάρικο ύφος",
    img: "/assets/kafetzou-young.png",
  },
  {
    id: "mystic",
    name: "Μυστική Μάντισσα",
    desc: "ποιητικό, μυστηριώδες ύφος",
    img: "/assets/kafetzou-mystic.png",
  },
];

export default function Cup() {
  const nav = useNavigate();

  const goStart = (persona?: Persona["id"]) => {
    // Προωθούμε (προαιρετικά) την persona στο /reading/start
    nav("/reading/start", { state: persona ? { persona } : undefined });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* HERO */}
      <header className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Ξεκλείδωσε την Αρχαία Τέχνη της Καφεμαντείας
          </h1>
          <p className="mt-3 text-lg opacity-80">
            Το πεπρωμένο σου σε περιμένει στο φλιτζάνι σου. Με την βοήθεια της Τεχνητής Νοημοσύνης,
            οι συμβολισμοί αποκτούν φωνή — εξατομικευμένα, ζεστά και ουσιαστικά.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => goStart()}
              className="rounded-xl px-5 py-3 bg-black text-white hover:opacity-90 transition"
            >
              Ξεκίνα Ανάλυση Τώρα
            </button>
            <Link
              to="/my-readings"
              className="rounded-xl px-5 py-3 border hover:bg-gray-50 transition"
            >
              Τα Χρησμολόγιά Μου
            </Link>
          </div>
        </div>

        <img
          src="/assets/katina-klassiki.png"
          alt="AI Καφετζού"
          className="w-56 h-56 object-contain select-none"
          draggable={false}
        />
      </header>

      {/* PERSONAS */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Διάλεξε Καφετζού</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => goStart(p.id)}
              className="group rounded-2xl border overflow-hidden bg-white shadow-sm hover:shadow-md transition text-left"
              title={`Επιλογή: ${p.name}`}
            >
              <div className="bg-gray-50">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full aspect-square object-contain"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm opacity-70">{p.desc}</div>
                <div className="mt-3 text-sm underline group-hover:no-underline">
                  Επίλεξε & συνεχίστε →
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

