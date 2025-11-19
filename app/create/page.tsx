"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore, ActivityData } from "@/store/useActivityStore";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ThemesInput from "@/components/ThemesInput";

export default function CreateActivityPage() {
  const [level, setLevel] = useState("Fundamental 2");
  const [series, setSeries] = useState("6º Ano");
  const [type, setType] = useState("Atividade");
  const [topics, setTopics] = useState([
    "Revolução Francesa",
    "Equações de 2º Grau",
  ]);

  const { setLoading, setActivity } = useActivityStore();
  const isLoading = useActivityStore((state) => state.isLoading);
  const router = useRouter();
  const { user } = useAuth();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const topicsArray = topics.filter((t) => t.trim() !== "");

    if (!level || !series || !type || topicsArray.length === 0) {
      toast.error("Campos obrigatórios", {
        description:
          "Preencha Nível, Série, Tipo e adicione pelo menos um tema.",
      });
      return;
    }
    if (!user) {
      toast.error("Erro de Autenticação", {
        description: "Usuário não encontrado.",
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
          series,
          type,
          topics: topicsArray,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Falha ao gerar documento.");
      }

      const activityData: ActivityData = await response.json();
      setActivity(activityData);
      toast.success("Documento gerado com sucesso!");
      router.push(`/activity/${activityData.id}`);
    } catch (error: any) {
      setLoading(false);
      toast.error("Erro na Geração", {
        description: error.message,
      });
    }
  };

  return (
    <AuthGuard>
      <div className="layout-content-container flex flex-col w-full max-w-2xl flex-1 mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap justify-between gap-3 text-center">
            <p className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] w-full">
              Criar Nova Atividade
            </p>
            <p className="text-gray-400 w-full">
              Preencha os campos abaixo para gerar um documento personalizado.
            </p>
          </div>

          <div className="bg-gray-800-dark p-6 sm:p-8 rounded-xl shadow-sm border border-gray-900-dark">
            <form onSubmit={handleGenerate} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className="flex flex-col w-full">
                  <p className="text-gray-300 text-base font-medium leading-normal pb-2">
                    Nível Escolar
                  </p>
                  <Select onValueChange={setLevel} value={level}>
                    <SelectTrigger className="h-12 border border-gray-900-dark bg-background-dark focus:border-primary">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800-dark border-gray-900-dark">
                      <SelectItem value="Fundamental 1">
                        Fundamental 1
                      </SelectItem>
                      <SelectItem value="Fundamental 2">
                        Fundamental 2
                      </SelectItem>
                      <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                    </SelectContent>
                  </Select>
                </label>

                <label className="flex flex-col w-full">
                  <p className="text-gray-300 text-base font-medium leading-normal pb-2">
                    Série
                  </p>
                  <Select onValueChange={setSeries} value={series}>
                    <SelectTrigger className="h-12 border border-gray-900-dark bg-background-dark focus:border-primary">
                      <SelectValue placeholder="Selecione a série" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800-dark border-gray-900-dark">
                      <SelectItem value="6º Ano">6º Ano</SelectItem>
                      <SelectItem value="7º Ano">7º Ano</SelectItem>
                      <SelectItem value="8º Ano">8º Ano</SelectItem>
                      <SelectItem value="9º Ano">9º Ano</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <label className="flex flex-col w-full">
                <p className="text-gray-300 text-base font-medium leading-normal pb-2">
                  Tipo de Documento
                </p>
                <Select onValueChange={setType} value={type}>
                  <SelectTrigger className="h-12 border border-gray-900-dark bg-background-dark focus:border-primary">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800-dark border-gray-900-dark">
                    <SelectItem value="Atividade">Atividade</SelectItem>
                    <SelectItem value="Prova">Prova</SelectItem>
                    <SelectItem value="Simulado">Simulado</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <ThemesInput topics={topics} setTopics={setTopics} />

              <Button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold shadow-sm hover:bg-primary/90 transition-colors mt-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4 text-white" />
                    Gerando Documento...
                  </>
                ) : (
                  <span>Gerar Documento</span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
