/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";

export async function DELETE(
  request: Request,

  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const activityId = params.id;

    const token = request.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const decodedToken = await authAdmin.verifyIdToken(token);
    const userId = decodedToken.uid;

    if (!activityId) {
      return NextResponse.json(
        { message: "ID da atividade inválido" },
        { status: 400 }
      );
    }

    const docRef = dbAdmin
      .collection("users")
      .doc(userId)
      .collection("history")
      .doc(activityId);

    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Atividade não encontrada" },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json(
      { message: "Atividade excluída com sucesso" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao excluir atividade:", error);
    return NextResponse.json(
      { message: "Erro interno ao excluir" },
      { status: 500 }
    );
  }
}
