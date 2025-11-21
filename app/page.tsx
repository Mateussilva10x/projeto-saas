"use client";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import DashboardCard from "@/components/DashboardCard";
import { FileText } from "lucide-react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const RecentActivityList = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRecentActivities = async () => {
      try {
        const historyCollectionRef = collection(
          db,
          "users",
          user.uid,
          "history"
        );
        const q = query(
          historyCollectionRef,
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(q);

        const fetchedActivities = snapshot.docs.map((doc) => {
          const data = doc.data();

          const date = data.createdAt.toDate();
          const day = date.getDate();

          const month = date
            .toLocaleDateString("pt-BR", { month: "short" })
            .replace(".", "");

          return {
            id: doc.id,
            title: data.title,
            created: `${day} de ${month}`,
            link: `/atividade/${doc.id}`,
          };
        });

        setActivities(fetchedActivities);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-slate-400 py-8">
        Você ainda não criou nenhuma atividade recente.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-card rounded-lg overflow-hidden">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center gap-4 px-4 min-h-[72px] py-2 justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="text-slate-600 dark:text-slate-300 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700/50 shrink-0 size-12">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-900 dark:text-white text-base font-medium leading-normal line-clamp-1">
                {activity.title}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal line-clamp-2">
                Criado em {activity.created}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              href={activity.link}
              className="text-primary text-sm font-medium leading-normal hover:underline flex items-center gap-1"
            >
              Visualizar
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1 px-4 sm:px-6 lg:px-0 mx-auto">
        <div className="flex flex-wrap justify-between gap-3 py-8">
          <div className="flex min-w-72 flex-col gap-2">
            <h2 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
              Olá, Professor! O que você gostaria de fazer hoje?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal">
              Crie provas, exercícios e simulados com facilidade.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <DashboardCard
            icon="create"
            title="Criar Nova Atividade"
            description="Gere provas, exercícios e simulados personalizados em minutos."
            link="/create"
            buttonText="Começar a Criar"
            variant="primary"
          />
          <DashboardCard
            icon="history"
            title="Meu Histórico"
            description="Visualize, edite ou baixe as atividades que você já criou."
            link="/history"
            buttonText="Ver Atividades"
            variant="secondary"
          />
        </div>

        <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 pt-10">
          Atividades Recentes
        </h2>
        <RecentActivityList />
      </div>
    </AuthGuard>
  );
}
