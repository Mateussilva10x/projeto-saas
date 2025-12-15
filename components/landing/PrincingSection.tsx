import { Check, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PricingSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50" id="precos">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
          <Badge
            variant="outline"
            className="text-primary border-primary/20 bg-primary/5 mb-2"
          >
            Planos Flexíveis
          </Badge>
          <h2 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl text-slate-900 dark:text-white">
            Escolha o poder da sua IA
          </h2>
          <p className="max-w-[700px] text-slate-500 md:text-xl/relaxed dark:text-slate-400">
            Do uso básico ao avançado. Cancele a qualquer momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-end">
          {/* Plano Gratuito - Isca */}
          <Card className="flex flex-col border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-700 dark:text-slate-200">
                Visitante
              </CardTitle>
              <CardDescription>Para testar a ferramenta.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-black mb-6 text-slate-900 dark:text-white">
                R$ 0
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-400" /> 1 Atividade / mês
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-slate-400" /> Histórico Simples
                </li>
                <li className="flex items-center gap-2 text-slate-400 line-through">
                  Correção Automática
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full font-bold">
                  Criar conta grátis
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Plano Standard - R$ 29,90 (O Intermediário) */}
          <Card className="flex flex-col relative border-slate-300 dark:border-slate-700 shadow-xl z-10 bg-white dark:bg-slate-900 h-full scale-100 md:scale-105">
            <div className="absolute top-0 inset-x-0 -mt-3 flex justify-center">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                Mais Popular
              </span>
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Professor
              </CardTitle>
              <CardDescription>O essencial para o dia a dia.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-black text-slate-900 dark:text-white">
                  R$ 29,90
                </span>
                <span className="text-slate-500 font-medium">/mês</span>
              </div>

              <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  20 Atividades / mês
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  Correção Automática (200 págs)
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  Exportação PDF sem marca
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  Importação de Provas
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90">
                  Começar Agora
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Plano Expert - R$ 49,90 (O Maior) */}
          <Card className="flex flex-col border-2 border-primary shadow-lg bg-slate-50/50 dark:bg-slate-900/50 h-fit">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                <Star className="w-5 h-5 fill-primary" />
                Expert
              </CardTitle>
              <CardDescription>Para quem quer limites altos.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900 dark:text-white">
                  R$ 49,90
                </span>
                <span className="text-slate-500 font-medium">/mês</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  <strong>Geração ILIMITADA</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />{" "}
                  <strong>Correção ILIMITADA</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" /> Modelo de IA
                  Prioritário (Mais rápido)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" /> Suporte VIP via
                  WhatsApp
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  className="w-full font-bold border-primary text-primary hover:bg-primary/10"
                >
                  Quero ser Expert
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
