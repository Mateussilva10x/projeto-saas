"use client";
import {
  useActivityStore,
  ActivityData,
  ActivityQuestion,
} from "@/store/useActivityStore";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  FileText,
  Edit2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PDFConfigDialog from "@/components/pdf/PDFConfigDialog";

export default function ActivityResultPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();

  const { currentActivity, setActivity } = useActivityStore();
  const [activity, setLocalActivity] = useState<ActivityData | null>(
    currentActivity
  );
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<{
    index: number;
    data: ActivityQuestion;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchActivity = async () => {
      if (currentActivity && currentActivity.id === id) {
        setLocalActivity(currentActivity);
        setLoading(false);
        return;
      }
      if (user && id) {
        try {
          const docRef = doc(db, "users", user.uid, "history", id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as ActivityData;
            setLocalActivity(data);
            setActivity(data);
          } else {
            router.push("/historico");
          }
        } catch (error) {
          console.error("Erro ao buscar atividade:", error);
          router.push("/historico");
        } finally {
          setLoading(false);
        }
      }
    };
    if (user) fetchActivity();
  }, [id, user, currentActivity, setActivity, router]);

  const getCorrectAnswer = (questionIndex: number) => {
    if (!activity) return null;
    const answerObj = activity.answerKey[questionIndex];
    return answerObj ? answerObj.answer : null;
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion || !activity || !user) return;

    setIsSaving(true);
    try {
      const updatedQuestions = [...activity.questions];
      updatedQuestions[editingQuestion.index] = editingQuestion.data;

      const updatedActivity = { ...activity, questions: updatedQuestions };
      setLocalActivity(updatedActivity);
      setActivity(updatedActivity);

      const docRef = doc(db, "users", user.uid, "history", activity.id);
      await updateDoc(docRef, { questions: updatedQuestions });

      toast.success("Questão atualizada com sucesso!");
      setEditingQuestion(null);
    } catch (error) {
      toast.error("Erro ao salvar edição.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !activity) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="flex w-full max-w-5xl mx-auto flex-col gap-8 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
              Revisar Atividade
            </h2>
            <p className="text-base font-normal text-slate-600 dark:text-slate-400">
              Confira as questões e respostas antes de finalizar.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              className="h-12 px-5 text-base cursor-pointer font-bold bg-primary text-white hover:bg-primary/90"
              onClick={() => setIsPdfModalOpen(true)}
            >
              <FileText className="w-5 h-5 mr-2" />
              Exportar para PDF
            </Button>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
          {activity.questions.map((q, index) => {
            const correctAnswer = getCorrectAnswer(index);

            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6 justify-between items-start"
              >
                <div className="flex items-start gap-4 w-full">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                    {index + 1}
                  </div>

                  <div className="flex flex-1 flex-col justify-center gap-3">
                    <p className="text-base font-medium leading-normal text-slate-900 dark:text-slate-50">
                      {q.question}
                    </p>

                    {q.type === "multiple_choice" && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {q.options.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);

                          const isCorrect =
                            correctAnswer?.includes(opt) ||
                            correctAnswer?.includes(`Opção ${letter}`);

                          return (
                            <span
                              key={i}
                              className={`flex items-center gap-2 px-2 py-1 rounded-md ${
                                isCorrect
                                  ? "font-semibold text-green-700 dark:text-green-400 bg-green-500/10"
                                  : ""
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 shrink-0" />
                              ) : (
                                <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">
                                  {letter})
                                </span>
                              )}
                              {opt}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {q.type === "discursive" && (
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Gabarito Esperado:
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-center sm:self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 cursor-pointer text-primary font-bold hover:bg-primary/10 hover:text-primary"
                    onClick={() => setEditingQuestion({ index, data: q })}
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      >
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle>
              Editar Questão {editingQuestion ? editingQuestion.index + 1 : ""}
            </DialogTitle>
          </DialogHeader>

          {editingQuestion && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Enunciado</Label>
                <Textarea
                  id="question"
                  value={editingQuestion.data.question}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      data: {
                        ...editingQuestion.data,
                        question: e.target.value,
                      },
                    })
                  }
                  rows={3}
                />
              </div>

              {editingQuestion.data.type === "multiple_choice" &&
                editingQuestion.data.options && (
                  <div className="grid gap-2">
                    <Label>Opções</Label>
                    {editingQuestion.data.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-bold text-sm w-4">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [
                              ...editingQuestion.data.options!,
                            ];
                            newOptions[i] = e.target.value;
                            setEditingQuestion({
                              ...editingQuestion,
                              data: {
                                ...editingQuestion.data,
                                options: newOptions,
                              },
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-primary text-white"
            >
              {isSaving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {activity && (
        <PDFConfigDialog
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          activity={activity}
        />
      )}
    </AuthGuard>
  );
}
