import Link from "next/link";
import { MoreVertical, ArrowRight, CheckSquare } from "lucide-react";
import { Button } from "./ui/button";

const tagColors = {
  Prova: {
    bg: "bg-blue-100 dark:bg-blue-900/50",
    text: "text-blue-800 dark:text-blue-300",
  },
  Simulado: {
    bg: "dark:bg-indigo-900/50",
    text: "text-indigo-800 dark:text-indigo-300",
  },
  Atividade: {
    bg: "dark:bg-green-900/50",
    text: "text-green-800 dark:text-green-300",
  },
  "N/A": {
    bg: "bg-gray-100 dark:bg-gray-700/50",
    text: "text-gray-800 dark:text-gray-400",
  },
  "Fundamental I": {
    bg: "bg-red-100 dark:bg-red-900/50",
    text: "text-red-800 dark:text-red-300",
  },
  "Fundamental II": {
    bg: "bg-yellow-100 dark:bg-yellow-900/50",
    text: "text-yellow-800 dark:text-yellow-300",
  },
  "Ensino Médio": {
    bg: "bg-green-100 dark:bg-green-900/50",
    text: "text-green-800 dark:text-green-300",
  },
};

interface HistoryCardProps {
  id: string;
  title: string;
  type: string;
  level: string;
  createdAt: string;
}

const Tag = ({ value }: { value: string }) => {
  const { bg, text } =
    tagColors[value as keyof typeof tagColors] || tagColors["N/A"];

  return (
    <span
      className={`inline-flex items-center rounded-full ${bg} px-2.5 py-0.5 text-xs font-medium ${text}`}
    >
      {value}
    </span>
  );
};

export default function HistoryCard({
  id,
  title,
  type,
  level,
  createdAt,
}: HistoryCardProps) {
  const date = new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  });

  console.log(level);

  return (
    <div className="group flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-primary/50 md:flex-row md:items-center">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Tag value={type} />

          <Tag value={level} />

          <p className="text-sm text-gray-400">Criado em: {date}</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-2 md:w-auto">
        <Link href={`/correct/${id}`}>
          <Button
            variant="secondary"
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-slate-800 px-4 text-sm font-semibold text-blue-400 hover:bg-slate-700 hover:text-blue-300"
          >
            <CheckSquare className="w-4 h-4" />
            Corrigir
          </Button>
        </Link>
        <Link href={`/activity/${id}`}>
          <Button className="flex h-10 items-center cursor-pointer justify-center gap-2 rounded-lg border border-gray-200 bg-transparent px-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            Ver Detalhes
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
