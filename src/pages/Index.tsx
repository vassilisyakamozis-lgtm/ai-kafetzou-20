// src/pages/Cup.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";   // <--- προστέθηκε useNavigate

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormItem, FormMessage, FormField, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Coffee, ArrowLeft, Sparkles, ImageIcon } from "lucide-react";

// ... (όλος ο υπόλοιπος κώδικας ίδιος)

export default function Cup() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const navigate = useNavigate();  // <--- αρχικοποίηση

  // ... (υπόλοιπος κώδικας)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Home</span>
          </button>
          <h1 className="text-2xl font-bold text-primary">
            <Coffee className="inline-block mr-2 h-6 w-6" />
            Ανάγνωση Φλιτζανιού
          </h1>
          <div />
        </div>
      </header>
      
      {/* ... υπόλοιπο component */}
    </div>
  );
}
