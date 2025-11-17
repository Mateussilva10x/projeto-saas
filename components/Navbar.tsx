"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Lightbulb } from "lucide-react";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-2xl font-bold text-primary">
        <Lightbulb className="h-6 w-6" />
        Lume
      </Link>
      <div className="flex items-center gap-4">
        {loading ? (
          <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
        ) : user ? (
          <>
            <Button variant="ghost" asChild>
              <Link href="/create">Criar</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/history">Histórico</Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
