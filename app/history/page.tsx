"use client";
import { useEffect, useState, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FetchedActivity = Omit<ActivityData, "createdAt"> & {
  createdAt: Timestamp;
};

const PAGE_SIZE = 10;
const DOCUMENT_TYPES = ["Todos", "Prova", "Simulado", "Atividade"];

const DIFFICULTY_LEVELS = [
  "Todos",
  "Fundamental 1",
  "Fundamental 2",
  "Ensino Médio",
];

interface FilterDropdownProps {
  title: string;
  options: string[];
  filterState: string;
  setFilterState: (state: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  title,
  options,
  filterState,
  setFilterState,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex h-10 shrink-0 items-center cursor-pointer justify-center gap-x-2 rounded-lg border border-gray-200 bg-background-light px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-background-dark dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <span>{filterState !== "Todos" ? filterState : title}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="dark:bg-gray-800 dark:border-gray-700"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => setFilterState(option)}
            className={`cursor-pointer ${
              filterState === option ? "bg-primary/20 text-primary" : ""
            }`}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [allActivities, setAllActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Todos");
  const [filterLevel, setFilterLevel] = useState("Todos");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

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

          const levelTag = data.series || data.level || "N/A";
          return {
            ...data,
            id: doc.id,
            level: levelTag,
            createdAt: data.createdAt.toDate().toISOString(),
          } as ActivityData;
        });

        setAllActivities(fetchedActivities);
        setLoading(false);
      };

      fetchHistory();
    }
  }, [user]);

  const filteredAndSortedActivities = useMemo(() => {
    let result = allActivities;

    if (searchTerm) {
      result = result.filter((a) =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "Todos") {
      result = result.filter((a) => a.type === filterType);
    }

    if (filterLevel !== "Todos") {
      result = result.filter((a) => a.level === filterLevel);
    }

    result = result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    if (
      currentPage !== 1 &&
      result.length > 0 &&
      currentPage > Math.ceil(result.length / PAGE_SIZE)
    ) {
      setCurrentPage(1);
    }

    return result;
  }, [
    allActivities,
    searchTerm,
    filterType,
    filterLevel,
    sortOrder,
    currentPage,
  ]);

  const totalActivities = filteredAndSortedActivities.length;
  const totalPages = Math.ceil(totalActivities / PAGE_SIZE);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredAndSortedActivities.slice(start, end);
  }, [filteredAndSortedActivities, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage < 3) {
        end = 4;
      } else if (currentPage > totalPages - 2) {
        start = totalPages - 3;
      }

      pages.push(1);
      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) pages.push("...");
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      })
      .map((page, index) => {
        if (page === "...") {
          return (
            <span key={index} className="text-gray-500">
              ...
            </span>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <Button
            key={index}
            onClick={() => handlePageChange(page as number)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium ${
              isCurrent
                ? "border-primary bg-primary text-white font-bold"
                : "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {page}
          </Button>
        );
      });
  };

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
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center mb-8">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Meu Histórico de Atividades
          </h2>
          <Link href="/create">
            <Button className="flex min-w-[84px] items-center cursor-pointer justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90">
              <PlusCircle className="w-4 h-4" />
              <span className="truncate">Criar Nova Atividade</span>
            </Button>
          </Link>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="relative flex w-full items-center">
                <Search className="absolute left-3 text-gray-500 w-5 h-5" />
                <input
                  className="w-full rounded-lg border-gray-200 bg-background-light py-2 pl-10 pr-4 text-gray-800 placeholder-gray-400 focus:border-primary focus:ring-primary dark:border-gray-700 dark:bg-background-dark dark:text-gray-200"
                  placeholder="Buscar por título..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-2">
              <FilterDropdown
                title="Tipo"
                options={DOCUMENT_TYPES}
                filterState={filterType}
                setFilterState={setFilterType}
              />
              <FilterDropdown
                title="Nível"
                options={DIFFICULTY_LEVELS}
                filterState={filterLevel}
                setFilterState={setFilterLevel}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {paginatedActivities.length > 0 ? (
            paginatedActivities.map((activity) => (
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
              {searchTerm || filterType !== "Todos" || filterLevel !== "Todos"
                ? "Nenhum resultado encontrado para os filtros aplicados."
                : "Você ainda não criou nenhuma atividade."}
            </p>
          )}
        </div>

        {totalActivities > PAGE_SIZE && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}-
              {Math.min(currentPage * PAGE_SIZE, totalActivities)} de{" "}
              {totalActivities} resultados
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border dark:border-gray-700 dark:bg-gray-800 text-gray-400 hover:bg-gray-700"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {renderPaginationButtons()}

              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border dark:border-gray-700 dark:bg-gray-800 text-gray-400 hover:bg-gray-700"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
