// src/pages/Cup.tsx
'use client';
import { useState } from 'react';
import SafeStartCTA from '@/components/SafeStartCTA';

export default function Cup() {
  // Προαιρετικά τοπικά states για να μοιάζει με φόρμα (δεν επηρεάζουν τη ροή)
  const [gender, setGender] = useState('Άνδρας');
  const [age, setAge] = useState('35-44');
  const [topic, setTopic] = useState('Πνευματική & βαθιά');
  const [question, setQuestion] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) { setPreview(null); return; }
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Στοιχεία Προφίλ</h1>

      {/* >>> ΠΟΤΕ submit: κόβουμε το default για να μην κάνει full reload <<< */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-4">
          {/* Φύλο & Ηλικία */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Φύλο</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option>Άνδρας</option>
                <option>Γυναίκα</option>
                <option>Άλλο</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Ηλικία</label>
              <select
                className="w-full rounded-lg border px-3 py-2"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              >
                <option>18-24</option>
                <option>25-34</option>
                <option>35-44</option>
                <option>45-54</option>
                <option>55+</option>
              </select>
            </div>
          </div>

          {/* Θεματική */}
          <div>
            <label className="block text-sm mb-1">Θεματική</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option>Ερωτικά</option>
              <option>Χρήματα & Οικονομικά</option>
              <option>Πνευματική & βαθιά</option>
              <option>Επαγγελματικά</option>
              <option>Τύχη</option>
            </select>
          </div>

          {/* Προαιρετική ερώτηση */}
          <div>
            <label className="block text-sm mb-1">Προαιρετική ερώτηση</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              rows={3}
              placeholder="(π.χ. Θα βρω αγάπη φέτος;)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          {/* Φωτογραφία Φλιτζανιού (προαιρετικό) */}
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Φωτογραφία Φλιτζανιού (προαιρετικό)</h2>
            <p className="text-sm text-gray-600 mb-4">
              Αν έχεις καθαρή φωτογραφία από το φλιτζάνι σου, ανέβασέ την (προεπισκόπηση τοπικά).
            </p>

            <div className="rounded-xl border-2 border-dashed border-purple-300 p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={onPickFile}
              />
              {preview && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={preview}
                    alt="cup"
                    className="max-h-48 rounded-lg shadow"
                  />
                </div>
              )}
            </div>
          </section>

          {/* CTA – ασφαλές & στιλισμένο */}
          <div className="mt-8 flex justify-center">
            <SafeStartCTA className="w-full sm:w-auto">
              Ξεκίνα την Ανάγνωση
            </SafeStartCTA>
          </div>
        </div>
      </form>
    </main>
  );
}
