"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { ActivityData } from "@/store/useActivityStore";
import HistoryCard from "@/components/HistoryCard";
import HistorySkeleton from "@/components/HistorySkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  PlusCircle,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type FetchedActivity = Omit<ActivityData, "createdAt"> & {
  createdAt: Timestamp;
};

const TOTAL_RESULTS = 15;
const PAGE_SIZE = 3;
const TOTAL_PAGES = Math.ceil(TOTAL_RESULTS / PAGE_SIZE);

export default function HistoryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        setLoading(true);
        const historyCollectionRef = collection(
          db,
          "users",
          user.uid,
          "history"
        );
        const q = query(historyCollectionRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedActivities = querySnapshot.docs.map((doc) => {
          const data = doc.data() as FetchedActivity;
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate().toISOString(),
          };
        });

        const filtered = fetchedActivities
          .filter((a) =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, PAGE_SIZE);

        setActivities(filtered);
        setLoading(false);
      };

      fetchHistory();
    }
  }, [user, searchTerm]);

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
          <HistorySkeleton />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Cabeçalho da Página (Igual ao Design) */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-gray-100 dark:text-gray-100">
            Meu Histórico de Atividades
          </h2>
          <Link href="/criar">
            <Button className="flex min-w-[84px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90">
              <PlusCircle className="w-4 h-4" />
              <span className="truncate">Criar Nova Atividade</span>
            </Button>
          </Link>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="relative flex w-full items-center">
                <Search className="absolute left-3 text-gray-500 w-5 h-5" />
                <input
                  className="w-full rounded-lg border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-gray-200 placeholder-gray-500 focus:border-primary focus:ring-primary"
                  placeholder="Buscar por título..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
            {/* Botões de Filtro */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3">
              <Button
                variant="outline"
                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                <span>Tipo</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                <span>Nível</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                <span>Data</span>
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Atividades */}
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <HistoryCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                type={activity.type as any}
                level={activity.level || "N/A"}
                createdAt={activity.createdAt}
              />
            ))
          ) : (
            <p className="text-gray-400 text-center py-10">
              Nenhuma atividade corresponde à sua busca.
            </p>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Mostrando 1-{activities.length} de {TOTAL_RESULTS} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            {[...Array(TOTAL_PAGES)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index + 1 ? "default" : "outline"}
                onClick={() => setCurrentPage(index + 1)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
                  currentPage === index + 1
                    ? "border-primary bg-primary text-white font-bold"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {index + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === TOTAL_PAGES}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
