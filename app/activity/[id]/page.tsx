"use client";
import { useActivityStore } from "@/store/useActivityStore";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ActivityData } from "@/store/useActivityStore";
import ActivityPDF from "@/components/pdf/ActivityPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

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

    if (user) {
      fetchActivity();
    }
  }, [id, user, currentActivity, setActivity, router]);

  if (loading || !activity) {
    return <div>Carregando atividade...</div>;
  }

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{activity.title}</h1>

          {isClient && (
            <PDFDownloadLink
              document={<ActivityPDF activity={activity} />}
              fileName={`${activity.type}_${activity.id}.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading}>
                  {loading ? "Gerando PDF..." : "Exportar para PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>

        {/* Renderização da Atividade */}
        <div className="prose prose-lg max-w-none dark:prose-invert bg-card p-6 rounded-lg">
          <h2 className="text-2xl font-semibold">Questões</h2>
          {activity.questions.map((q, index) => (
            <div key={index} className="mt-4">
              <p className="font-semibold">
                {index + 1}. {q.question}
              </p>
              {q.type === "multiple_choice" && (
                <ul className="list-none p-0 ml-4">
                  {q.options?.map((opt, i) => (
                    <li key={i}>
                      {String.fromCharCode(97 + i)}) {opt}
                    </li>
                  ))}
                </ul>
              )}
              {q.type === "discursive" && (
                <div className="h-24 border-b-2 border-dashed mt-4"></div>
              )}
            </div>
          ))}

          <hr className="my-8" />

          <h2 className="text-2xl font-semibold">Gabarito</h2>
          {activity.answerKey.map((ans, index) => (
            <div key={index} className="mt-4">
              <p className="font-semibold">Questão {index + 1}:</p>
              <p>{ans.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
