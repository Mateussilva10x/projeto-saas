"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore, ActivityData } from "@/store/useActivityStore";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

export default function CreateActivityPage() {
  const [level, setLevel] = useState("");
  const [type, setType] = useState("");
  const [topics, setTopics] = useState("");

  const { setLoading, setActivity } = useActivityStore();
  const isLoading = useActivityStore((state) => state.isLoading);
  const router = useRouter();
  const { user } = useAuth();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!level || !type || !topics) {
      toast.error("Erro", {
        description: "Preencha todos os campos.",
      });
      return;
    }

    if (!user) {
      toast.error("Erro de Autenticação", {
        description: "Usuário não encontrado. Tente fazer login novamente.",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          level,
          type,
          topics: topics.split(",").map((t) => t.trim()),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao gerar atividade.");
      }

      const activityData: ActivityData = await response.json();

      setActivity(activityData);

      router.push(`/activity/${activityData.id}`);

      toast.success("Atividade gerada com sucesso!");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      toast.error("Erro na Geração", {
        description: error.message,
      });
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Criar Nova Atividade</h1>
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <Label>Nível Escolar</Label>
            <Select onValueChange={setLevel} value={level} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fundamental I">Fundamental I</SelectItem>
                <SelectItem value="Fundamental II">Fundamental II</SelectItem>
                <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo de Documento</Label>
            <Select onValueChange={setType} value={type} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Atividade">Atividade</SelectItem>
                <SelectItem value="Prova">Prova</SelectItem>
                <SelectItem value="Simulado">Simulado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="topics">Temas (separados por vírgula)</Label>
            <Textarea
              id="topics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="Ex: Fotossíntese, Ecossistema, Cadeias Alimentares"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            {isLoading ? "Gerando... (Pode levar 30s)" : "Gerar Atividade"}
          </Button>
        </form>
      </div>
    </AuthGuard>
  );
}
