"use client";
import { SetStateAction, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      toast.success("Sucesso!", {
        description: "Redirecionando...",
      });
      router.push("/");
    } catch (error: any) {
      toast.error("Erro", {
        description: error.message || "Verifique suas credenciais.",
      });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">
        {isLogin ? "Login" : "Criar Conta"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setEmail(e.target.value)
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e: { target: { value: SetStateAction<string> } }) =>
              setPassword(e.target.value)
            }
            required
          />
        </div>
        <Button type="submit" className="w-full">
          {isLogin ? "Entrar" : "Registrar"}
        </Button>
      </form>
      <Button
        variant="link"
        className="w-full mt-4"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "Não tem uma conta? Crie uma"
          : "Já tem uma conta? Faça login"}
      </Button>
    </div>
  );
}
