"use client";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/firebase";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            Olá, {user?.email?.split("@")[0] || "Professor"}!
          </h1>
          <Button variant="outline" onClick={() => auth.signOut()}>
            Sair
          </Button>
        </div>

        <p>Bem-vindo ao seu painel de geração de atividades.</p>

        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/create">Criar Nova Atividade</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/historico">Ver Histórico</Link>
          </Button>
        </div>
      </div>
    </AuthGuard>
  );
}
