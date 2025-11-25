"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ActivityData } from "@/store/useActivityStore";

interface CorrectionResult {
  studentName: string;
  finalGrade: number;
  corrections: {
    questionIndex: number;
    status: "correct" | "partial" | "wrong";
    score: number;
    teacherFeedback: string;
  }[];
}

export default function CorrectionPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const activityId = params.id as string;

  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);

  useEffect(() => {
    if (user && activityId) {
      const fetchActivity = async () => {
        const docSnap = await getDoc(
          doc(db, "users", user.uid, "history", activityId)
        );
        if (docSnap.exists()) {
          setActivity({ id: docSnap.id, ...docSnap.data() } as ActivityData);
        }
      };
      fetchActivity();
    }
  }, [user, activityId]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      setFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);

      setResult(null);
    }
  };

  const handleCorrection = async () => {
    if (files.length === 0 || !user) return;

    setIsCorrecting(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("activityId", activityId);

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/correct", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Falha ao corrigir");

      const data = await response.json();
      setResult(data);
      toast.success("Correção concluída!");
    } catch (error) {
      toast.error("Erro na correção", {
        description: "Não foi possível analisar os arquivos.",
      });
    } finally {
      setIsCorrecting(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "correct")
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === "partial")
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-6xl py-8 px-4">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Corretor Inteligente (Multipage)
            </h1>
            <p className="text-slate-500">
              {activity?.title || "Carregando atividade..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50 dark:bg-slate-900/50 transition-colors hover:border-primary/50">
              <input
                type="file"
                id="upload"
                className="hidden"
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileChange}
              />

              <label
                htmlFor="upload"
                className="cursor-pointer flex flex-col items-center gap-2 py-4"
              >
                <div className="bg-primary/10 p-4 rounded-full text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Adicionar Páginas da Prova
                </span>
                <span className="text-xs text-slate-500">
                  Imagens (JPG, PNG)
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((url, index) => (
                  <div
                    key={index}
                    className="relative group aspect-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                  >
                    <img
                      src={url}
                      alt={`Página ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 rounded">
                      Pág {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && !result && (
              <Button
                className="w-full h-12 text-lg bg-primary text-white hover:bg-primary/90"
                onClick={handleCorrection}
                disabled={isCorrecting}
              >
                {isCorrecting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando {files.length} página(s)...
                  </>
                ) : (
                  `Corrigir ${files.length} Página(s)`
                )}
              </Button>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            {result ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <p className="text-sm text-slate-500">Aluno identificado</p>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {result.studentName}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Nota Final</p>
                    <div
                      className={`text-4xl font-black ${
                        result.finalGrade >= 6
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {result.finalGrade.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.corrections.map((item, idx) => {
                    const originalQuestion =
                      activity?.questions[item.questionIndex]?.question;

                    return (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50"
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            Questão {item.questionIndex + 1}
                          </h4>
                          <div className="flex items-center gap-1">
                            <StatusIcon status={item.status} />
                            <span className="text-xs font-bold">
                              {item.score.toFixed(1)} pts
                            </span>
                          </div>
                        </div>

                        {originalQuestion && (
                          <p className="text-xs text-slate-500 mb-3 italic line-clamp-2 border-l-2 border-slate-300 pl-2">
                            "{originalQuestion}"
                          </p>
                        )}

                        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-primary text-xs uppercase mt-0.5">
                            Feedback:
                          </span>
                          <span>{item.teacherFeedback}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
                  <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Aguardando as provas...
                </h3>
                <p className="text-slate-500 max-w-md">
                  Tire fotos de todas as páginas da prova do aluno e faça o
                  upload ao lado. Nossa IA lerá todas as páginas para gerar a
                  correção.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
