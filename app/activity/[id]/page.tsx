"use client";
import {
  useActivityStore,
  ActivityData,
  ActivityQuestion,
} from "@/store/useActivityStore";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PDFConfigDialog from "@/components/pdf/PDFConfigDialog";
import {
  ArrowLeft,
  Save,
  FileText,
  Edit2,
  CheckCircle,
  Circle,
  AlertCircle,
  Image as ImageIcon,
  Upload,
  Loader2,
  Trash2,
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
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState<
    string | null
  >(null);
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
            router.push("/history");
          }
        } catch (error) {
          console.error("Erro ao buscar atividade:", error);
          router.push("/history");
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

  const handleOpenEdit = (index: number, q: ActivityQuestion) => {
    const currentAnswer = getCorrectAnswer(index);
    setEditingCorrectAnswer(currentAnswer);

    const questionCopy = {
      ...q,
      options: q.options ? [...q.options] : [],
    };

    setEditingQuestion({ index, data: questionCopy });
  };

  const handleCloseEdit = () => {
    setEditingQuestion(null);
    setEditingCorrectAnswer(null);
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion || !activity || !user) return;

    setIsSaving(true);
    try {
      const updatedQuestions = [...activity.questions];
      updatedQuestions[editingQuestion.index] = editingQuestion.data;

      const updatedAnswerKey = [...activity.answerKey];
      if (!updatedAnswerKey[editingQuestion.index]) {
        updatedAnswerKey[editingQuestion.index] = {
          question: editingQuestion.data.question,
          answer: "",
        };
      }
      updatedAnswerKey[editingQuestion.index].question =
        editingQuestion.data.question;

      if (editingCorrectAnswer) {
        updatedAnswerKey[editingQuestion.index].answer = editingCorrectAnswer;
      }

      const updatedActivity = {
        ...activity,
        questions: updatedQuestions,
        answerKey: updatedAnswerKey,
      };

      setLocalActivity(updatedActivity);
      setActivity(updatedActivity);

      const docRef = doc(db, "users", user.uid, "history", activity.id);
      await updateDoc(docRef, {
        questions: updatedQuestions,
        answerKey: updatedAnswerKey,
      });

      toast.success("Atualizado com sucesso!");
      handleCloseEdit();
    } catch (error) {
      toast.error("Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !activity) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
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
              className="h-12 px-5 text-base font-bold bg-primary text-white hover:bg-primary/90"
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
                    <p className="text-base font-medium leading-normal text-slate-900 dark:text-slate-50 whitespace-pre-wrap">
                      {q.question}
                    </p>

                    {q.type === "multiple_choice" && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {q.options.map((opt, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const isCorrect =
                            correctAnswer?.includes(opt) ||
                            (correctAnswer?.length === 1 &&
                              correctAnswer === letter) ||
                            correctAnswer?.includes(`Opção ${letter}`);

                          return (
                            <span
                              key={i}
                              className={`flex items-center gap-2 px-2 py-1 rounded-md border ${
                                isCorrect
                                  ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 font-semibold"
                                  : "border-transparent"
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
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
                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                          {correctAnswer || (
                            <span className="text-red-400 italic">
                              Sem gabarito definido.
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-center sm:self-start">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-primary font-bold hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleOpenEdit(index, q)}
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
        onOpenChange={(open) => !open && handleCloseEdit()}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">
              Editar Questão {editingQuestion ? editingQuestion.index + 1 : ""}
            </DialogTitle>
          </DialogHeader>

          {editingQuestion && (
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Enunciado</Label>
                <Textarea
                  id="question"
                  value={editingQuestion.data.question || ""}
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
                  className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              {editingQuestion.data.type === "multiple_choice" &&
                editingQuestion.data.options && (
                  <div className="grid gap-3">
                    <Label>
                      Alternativas (Clique no círculo para definir a correta)
                    </Label>
                    {editingQuestion.data.options.map((opt, i) => {
                      const isSelected = editingCorrectAnswer === opt;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setEditingCorrectAnswer(opt)}
                            className="shrink-0 focus:outline-none transition-transform active:scale-95"
                            title="Marcar como correta"
                          >
                            {isSelected ? (
                              <CheckCircle className="w-6 h-6 text-green-500 fill-green-500/20" />
                            ) : (
                              <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400 dark:text-slate-600 dark:hover:text-slate-500" />
                            )}
                          </button>

                          <div className="flex-1 flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-500 w-4">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <Input
                              value={opt || ""}
                              onChange={(e) => {
                                const newVal = e.target.value;
                                const oldVal = opt;
                                const newOptions = [
                                  ...editingQuestion.data.options!,
                                ];
                                newOptions[i] = newVal;

                                setEditingQuestion({
                                  ...editingQuestion,
                                  data: {
                                    ...editingQuestion.data,
                                    options: newOptions,
                                  },
                                });

                                if (editingCorrectAnswer === oldVal) {
                                  setEditingCorrectAnswer(newVal);
                                }
                              }}
                              className={`bg-slate-50 dark:bg-slate-800 ${
                                isSelected
                                  ? "border-green-500 ring-1 ring-green-500/30"
                                  : "border-slate-200 dark:border-slate-700"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {!editingCorrectAnswer && (
                      <p className="text-xs text-orange-500 flex items-center gap-1 mt-1 font-medium bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                        <AlertCircle className="w-3 h-3" />
                        Atenção: Nenhuma alternativa está marcada como correta.
                      </p>
                    )}
                  </div>
                )}

              {editingQuestion.data.type === "discursive" && (
                <div className="grid gap-2">
                  <Label htmlFor="answer">
                    Gabarito Esperado (Resposta do Professor)
                  </Label>
                  <Textarea
                    id="answer"
                    value={editingCorrectAnswer || ""}
                    onChange={(e) => setEditingCorrectAnswer(e.target.value)}
                    rows={3}
                    className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900 focus:border-green-500"
                    placeholder="Digite a resposta correta esperada..."
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseEdit}
              className="border-slate-200 dark:border-slate-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-primary text-white hover:bg-primary/90"
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
