"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check, ArrowRight, X, FileText } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ActivityData } from "@/store/useActivityStore";

export default function ImportExamPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<ActivityData | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) =>
        file.type.startsWith("image/") ? URL.createObjectURL(file) : "pdf"
      );
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (files.length === 0 || !user) return;
    setIsAnalyzing(true);

    const formData = new FormData();

    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/extract-test", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Falha na análise");

      const data = await response.json();

      const formattedData: ActivityData = {
        ...data,
        topics: ["Importado"],
        series: "N/A",
        id: "temp",
        createdAt: new Date().toISOString(),
      };

      setAnalyzedData(formattedData);
      toast.success("Prova analisada com sucesso!");
    } catch (error) {
      toast.error("Erro ao ler arquivos. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAndCorrect = async () => {
    if (!analyzedData || !user) return;

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "history"),
        {
          ...analyzedData,
          createdAt: Timestamp.now(),
          isImported: true,
        }
      );

      toast.success("Prova salva na biblioteca!");
      router.push(`/activity/${docRef.id}`);
    } catch (error) {
      toast.error("Erro ao salvar");
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
            Importar Prova Externa
          </h1>
          <p className="text-slate-500">
            Envie fotos ou PDFs da sua prova em branco (múltiplas páginas).
            Nossa IA vai ler as questões e criar o gabarito.
          </p>
        </div>

        {!analyzedData ? (
          <div className="space-y-6">
            {/* Área de Upload */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center bg-slate-50 dark:bg-slate-900/50 hover:border-primary/50 transition-colors">
              <input
                type="file"
                id="exam-upload"
                className="hidden"
                accept="application/pdf,image/*"
                multiple
                onChange={handleFileChange}
              />
              <label
                htmlFor="exam-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="bg-primary/10 p-5 rounded-full text-primary">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-lg font-semibold text-slate-900 dark:text-white block hover:text-primary transition-colors">
                    Clique para adicionar páginas
                  </span>
                  <span className="text-sm text-slate-500">
                    Imagens (JPG, PNG) ou PDF
                  </span>
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative group aspect-3/4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800"
                  >
                    {preview === "pdf" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <FileText className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">PDF</span>
                      </div>
                    ) : (
                      <img
                        src={preview}
                        alt={`Pág ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}

                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Pag {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className="flex justify-end">
                <Button
                  className="w-full sm:w-auto h-12 px-8 text-lg font-bold"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" /> Lendo{" "}
                      {files.length} páginas...
                    </>
                  ) : (
                    `Analisar ${files.length} Página(s)`
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg flex items-center gap-3">
              <Check className="text-green-600 w-6 h-6" />
              <div>
                <p className="text-green-800 dark:text-green-200 font-bold text-lg">
                  Sucesso!
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Identificamos{" "}
                  <strong>{analyzedData.questions.length} questões</strong> nas
                  suas {files.length} páginas.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-xl text-primary">
                {analyzedData.title}
              </h3>
              <div className="space-y-3">
                {analyzedData.questions.slice(0, 3).map((q, i) => (
                  <div
                    key={i}
                    className="text-sm text-slate-600 dark:text-slate-300 border-l-4 border-slate-200 dark:border-slate-700 pl-4 py-1"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">
                      Questão {i + 1}
                    </span>
                    {q.question.length > 120
                      ? q.question.substring(0, 120) + "..."
                      : q.question}
                  </div>
                ))}
                {analyzedData.questions.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground font-medium bg-slate-50 dark:bg-slate-900 p-2 rounded">
                    + {analyzedData.questions.length - 3} outras questões
                    identificadas...
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setAnalyzedData(null)}
                className="flex-1 border-slate-300 dark:border-slate-700"
              >
                Cancelar
              </Button>
              <Button
                size="lg"
                onClick={handleSaveAndCorrect}
                className="flex-1 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                Salvar e Revisar Gabarito{" "}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
