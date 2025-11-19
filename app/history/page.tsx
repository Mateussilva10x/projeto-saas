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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import HistorySkeleton from "@/components/HistorySkeleton";
import { FileText, PlusCircle } from "lucide-react";

type FetchedActivity = Omit<ActivityData, "createdAt"> & {
  createdAt: Timestamp;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

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

        setActivities(fetchedActivities);
        setLoading(false);
      };

      fetchHistory();
    }
  }, [user]);

  if (loading) {
    return (
      <AuthGuard>
        <HistorySkeleton />
      </AuthGuard>
    );
  }

  if (activities.length === 0) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center text-center h-[60vh] gap-4">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">
            Nenhuma atividade encontrada
          </h2>
          <p className="text-muted-foreground">
            Comece a criar sua primeira atividade agora mesmo.
          </p>
          <Button asChild className="mt-4">
            <Link href="/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Atividade
            </Link>
          </Button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <h1 className="text-3xl font-bold mb-6">Meu Histórico</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <Link href={`/activity/${activity.id}`} key={activity.id} passHref>
            <Card className="h-full flex flex-col justify-between transition-all hover:shadow-lg hover:border-primary">
              <CardHeader>
                <CardTitle className="line-clamp-2">{activity.title}</CardTitle>
                <CardDescription>
                  {activity.type} - {activity.level}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Temas: {activity.topics.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Criado em:{" "}
                  {new Date(activity.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AuthGuard>
  );
}
