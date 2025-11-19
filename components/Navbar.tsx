"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Sun, Moon, LogOut } from "lucide-react";
import { ModeToggle } from "./ModeToogle";

const UserAvatar = () => (
  <div
    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
    data-alt="User avatar image"
    style={{
      backgroundImage:
        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB875XA03g7scKttIwxvaVPgQ25jHVgwSCu_U84EIcrzI5LOsZpDr2guWuMDANln5K4YdvzXes6jjtXGxAxo87zK0b_y6a6MbRIllTce8DL6EtRODcz5Dyj9FAsDSVKaEOx4PYnSTrNNbYGdogeWjrlkmRIRV4A6HxhedgUznRfBfZB7UJEfUPxhccb-BjvrJ6EfDsf_HKuKRzw3Wbm-78i6evwRi4JLKZwFUtpQfgBq224dlAq-f7zVDFJ62VgHPXJrsENS0dUzUoL")',
    }}
  />
);

const AppLogo = () => (
  <div className="size-8 text-primary">
    <Sun className="size-full" />
  </div>
);

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-10 py-3 bg-white dark:bg-background">
      <div className="flex items-center gap-4 text-slate-900 dark:text-white">
        <AppLogo />
        <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          Lume.AI
        </h1>
      </div>

      <div className="flex flex-1 justify-end items-center gap-4 sm:gap-8">
        <ModeToggle />

        {loading ? (
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ) : user ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2  text-sm font-medium rounded-lg hover:bg-slate-700 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-700/50 transition-colors"
            >
              <LogOut className="size-4" />
              Sair
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
