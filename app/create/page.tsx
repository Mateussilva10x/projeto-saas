"use client";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";

export default function CreateActivityPage() {
  const [level, setLevel] = useState("Fundamental 2");
  const [series, setSeries] = useState("6º Ano");
  const [type, setType] = useState("Atividade");
  const [topics, setTopics] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("Médio");
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [objectiveCount, setObjectiveCount] = useState(3);
  const [discursiveCount, setDiscursiveCount] = useState(2);

  const { setLoading, setActivity } = useActivityStore();
  const isLoading = useActivityStore((state) => state.isLoading);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (totalQuestions >= 0) {
      const obj = Math.ceil(totalQuestions / 2);
      const disc = Math.floor(totalQuestions / 2);
      setObjectiveCount(obj);
      setDiscursiveCount(disc);
    }
  }, [totalQuestions]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    const topicsArray = topics.filter((t) => t.trim() !== "");

    if (objectiveCount + discursiveCount !== totalQuestions) {
      toast.error("Erro na contagem", {
        description: `A soma de Objetivas (${objectiveCount}) e Dissertativas (${discursiveCount}) deve ser igual ao Total (${totalQuestions}).`,
      });
      return;
    }

    if (!level || !series || !type || topicsArray.length === 0) {
      toast.error("Campos obrigatórios", {
        description: "Preencha todos os campos.",
      });
      return;
    }

    setLoading(true);

    try {
      const token = await user?.getIdToken();

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
          difficulty,
          totalQuestions,
          objectiveCount,
          discursiveCount,
        }),
      });

      if (!response.ok) throw new Error("Falha ao gerar documento.");

      const activityData: ActivityData = await response.json();
      setActivity(activityData);
      toast.success("Documento gerado com sucesso!");
      router.push(`/activity/${activityData.id}`);
    } catch (error: any) {
      setLoading(false);
      toast.error("Erro na Geração", { description: error.message });
    }
  };

  return (
    <AuthGuard>
      <div className="layout-content-container flex flex-col w-full max-w-2xl flex-1 mx-auto">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap justify-between gap-3 text-center">
            <p className="text-gray-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] w-full">
              Criar Nova Atividade
            </p>
            <p className="text-gray-500 dark:text-gray-400 w-full">
              Preencha os campos abaixo para gerar um documento personalizado.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900/50 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <form onSubmit={handleGenerate} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <label className="flex flex-col w-full">
                  <p className="text-gray-900 dark:text-white text-base font-medium leading-normal pb-2">
                    Nível Escolar
                  </p>
                  <Select onValueChange={setLevel} value={level}>
                    <SelectTrigger className="form-select appearance-none w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800/50 focus:border-primary h-12 placeholder:text-gray-400 px-4 text-base font-normal leading-normal">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 border-gray-900-dark z-50">
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
                  <p className="text-gray-900 dark:text-white text-base font-medium leading-normal pb-2">
                    Série
                  </p>
                  <Select onValueChange={setSeries} value={series}>
                    <SelectTrigger className="form-select appearance-none w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800/50 focus:border-primary h-12 placeholder:text-gray-400 px-4 text-base font-normal leading-normal">
                      <SelectValue placeholder="Selecione a série" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 border-gray-900-dark z-50">
                      <SelectItem value="6º Ano">6º Ano</SelectItem>
                      <SelectItem value="7º Ano">7º Ano</SelectItem>
                      <SelectItem value="8º Ano">8º Ano</SelectItem>
                      <SelectItem value="9º Ano">9º Ano</SelectItem>
                      <SelectItem value="1º Ano EM">1º Ano (Médio)</SelectItem>
                      <SelectItem value="2º Ano EM">2º Ano (Médio)</SelectItem>
                      <SelectItem value="3º Ano EM">3º Ano (Médio)</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className="flex flex-row gap-6 flex-1">
                <label className="flex flex-col w-full gap-2 flex-1">
                  <p className="text-gray-900 dark:text-white text-base font-medium leading-normal ">
                    Dificuldade
                  </p>
                  <Select onValueChange={setDifficulty} value={difficulty}>
                    <SelectTrigger className="form-select appearance-none w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800/50 focus:border-primary h-12 placeholder:text-gray-400 px-4 text-base font-normal leading-normal">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800">
                      <SelectItem value="Fácil">Fácil</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Difícil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="flex flex-col w-full">
                  <p className="text-gray-900 dark:text-white text-base font-medium leading-normal pb-2">
                    Tipo de Documento
                  </p>
                  <Select onValueChange={setType} value={type}>
                    <SelectTrigger className="form-select appearance-none w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-700 bg-background dark:bg-gray-800/50 focus:border-primary h-12 placeholder:text-gray-400 px-4 text-base font-normal leading-normal">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 border-gray-900-dark z-50">
                      <SelectItem value="Atividade">Atividade</SelectItem>
                      <SelectItem value="Prova">Prova</SelectItem>
                      <SelectItem value="Simulado">Simulado</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                  Configuração de Questões
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Total
                    </span>
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={totalQuestions}
                      onChange={(e) =>
                        setTotalQuestions(Number(e.target.value))
                      }
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-center font-bold"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Objetivas
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={totalQuestions}
                      value={objectiveCount}
                      onChange={(e) =>
                        setObjectiveCount(Number(e.target.value))
                      }
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-center"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-medium">
                      Dissertativas
                    </span>
                    <Input
                      type="number"
                      min={0}
                      max={totalQuestions}
                      value={discursiveCount}
                      onChange={(e) =>
                        setDiscursiveCount(Number(e.target.value))
                      }
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-center"
                    />
                  </label>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-slate-400">
                    Soma atual: {objectiveCount + discursiveCount} /{" "}
                    {totalQuestions}
                  </span>
                  {objectiveCount + discursiveCount !== totalQuestions && (
                    <span className="text-xs text-red-500 font-bold animate-pulse">
                      A soma não bate!
                    </span>
                  )}
                </div>
              </div>

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
