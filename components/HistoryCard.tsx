import React from "react";
import Link from "next/link";
import { MoreVertical, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const tagColors = {
  Prova: { bg: "bg-blue-900/50", text: "text-blue-300" },
  Simulado: { bg: "bg-indigo-900/50", text: "text-indigo-300" },
  Exercício: { bg: "bg-green-900/50", text: "text-green-300" },
  Médio: { bg: "bg-yellow-900/50", text: "text-yellow-300" },
  Difícil: { bg: "bg-red-900/50", text: "text-red-300" },
  Fácil: { bg: "bg-green-900/50", text: "text-green-300" },
};

interface HistoryCardProps {
  id: string;
  title: string;
  type: "Prova" | "Simulado" | "Exercício";
  level: string;
  createdAt: string;
}

const Tag = ({ type, value }: { type: "type" | "level"; value: string }) => {
  const valueMap =
    type === "type"
      ? tagColors[value as keyof typeof tagColors]
      : tagColors[value as keyof typeof tagColors] || tagColors.Médio;

  const { bg, text } = valueMap || {
    bg: "bg-slate-900/50",
    text: "text-slate-300",
  };

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

  return (
    <div className="group flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 md:flex-row md:items-center">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-100">{title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Tag type="type" value={type} />

          <Tag type="level" value={level} />

          <p className="text-sm text-gray-400">Criado em: {date}</p>
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-2 md:w-auto">
        <Link href={`/atividade/${id}`}>
          <Button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-transparent px-4 text-sm font-semibold text-gray-300 hover:bg-gray-800">
            Ver Detalhes
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-700 bg-transparent text-gray-400 hover:bg-gray-800 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
