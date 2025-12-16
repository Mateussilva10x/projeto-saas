"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, FileText, Sparkles } from "lucide-react";
import PricingSection from "@/components/landing/PrincingSection";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/history");
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      <main className="flex-1 pt-16">
        <section className="w-full py-20 md:py-32 lg:py-40 flex flex-col items-center text-center px-4">
          <div className="container px-4 md:px-6 space-y-8">
            <div className="space-y-4 max-w-3xl mx-auto">
              <h1 className="text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                Crie e Corrija Provas com IA em Segundos
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400 leading-relaxed">
                Pare de levar trabalho para casa. O Lume gera atividades
                alinhadas à BNCC e corrige provas automaticamente usando apenas
                a câmera do celular.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button className="h-12 px-8 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Começar Agora Grátis <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#precos">
                <Button variant="outline" className="h-12 px-8 text-lg">
                  Ver Planos
                </Button>
              </Link>
            </div>

            <div className="mt-12 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl max-w-4xl mx-auto rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="aspect-video bg-white dark:bg-slate-950 rounded-lg flex items-center justify-center text-slate-300">
                <span className="flex items-center gap-2">
                  <FileText className="w-12 h-12" />
                  (Aqui vai um print ou vídeo da tela do app)
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-3">
                <div className="inline-block p-3 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Criação Instantânea</h3>
                <p className="text-slate-500">
                  Diga o tema, a série e a dificuldade. Nossa IA gera uma prova
                  completa, formatada e pronta para imprimir em PDF.
                </p>
              </div>
              <div className="space-y-3">
                <div className="inline-block p-3 rounded-2xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Correção por Foto</h3>
                <p className="text-slate-500">
                  Tire uma foto da prova do aluno. O sistema lê a letra (OCR),
                  corrige as respostas e dá a nota automaticamente.
                </p>
              </div>
              <div className="space-y-3">
                <div className="inline-block p-3 rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-2">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Histórico Digital</h3>
                <p className="text-slate-500">
                  Nunca mais perca uma prova. Tudo fica salvo na nuvem,
                  organizado por turma e data, acessível de qualquer lugar.
                </p>
              </div>
            </div>
          </div>
        </section>

        <PricingSection />
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-8 w-full shrink-0 items-center px-4 md:px-6 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          © 2025 Profex.AI. Todos os direitos reservados.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4 text-slate-500"
            href="#"
          >
            Termos de Uso
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4 text-slate-500"
            href="#"
          >
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  );
}
