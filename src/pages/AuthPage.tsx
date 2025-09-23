// src/pages/auth/AuthPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AuthPage() {
  const query = useQuery();
  const nav = useNavigate();
  const next = query.get("next") || "/cup";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLogged(!!data.session);
    });
  }, []);

  const signInGoogle = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
  };

  const signInMagicLink = async () => {
    try {
      setStatus("loading");
      setError(null);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        }
      });
      if (error) throw error;
      setStatus("sent");
    } catch (e: any) {
      setError(e?.message || "Αποτυχία αποστολής συνδέσμου.");
      setStatus("idle");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsLogged(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isLogged ? "Είσαι συνδεδεμένος/η" : "Σύνδεση"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-destructive text-sm">{error}</p>}

          {isLogged ? (
            <>
              <div className="flex gap-2">
                <Button onClick={() => location.assign((new URLSearchParams(location.search)).get("next") || "/cup")}>
                  Συνέχεια
                </Button>
                <Button variant="secondary" onClick={signOut}>Αποσύνδεση</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <Link to="/">Αρχική</Link>
              </p>
            </>
          ) : (
            <>
              <Button className="w-full" onClick={signInGoogle}>
                Σύνδεση με Google
              </Button>

              <div className="text-xs text-muted-foreground text-center">ή με μαγικό σύνδεσμο</div>

              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <Button className="w-full" onClick={signInMagicLink} disabled={status !== "idle"}>
                  {status === "sent" ? "Εστάλη!" : status === "loading" ? "Αποστολή..." : "Αποστολή συνδέσμου"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
