/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const activityId = formData.get("activityId") as string;

    const files = formData.getAll("files") as File[];

    const token = request.headers.get("Authorization")?.split("Bearer ")[1];

    if (!token || files.length === 0 || !activityId) {
      return NextResponse.json(
        { message: "Dados inválidos ou nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const decodedToken = await authAdmin.verifyIdToken(token);
    const userId = decodedToken.uid;

    const imageParts = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          inlineData: {
            data: Buffer.from(arrayBuffer).toString("base64"),
            mimeType: file.type,
          },
        };
      })
    );

    const activityDoc = await dbAdmin
      .collection("users")
      .doc(userId)
      .collection("history")
      .doc(activityId)
      .get();

    if (!activityDoc.exists) {
      return NextResponse.json(
        { message: "Atividade original não encontrada." },
        { status: 404 }
      );
    }

    const activityData = activityDoc.data();
    const answerKeyString = JSON.stringify(activityData?.answerKey || []);
    const questionsString = JSON.stringify(activityData?.questions || []);

    const prompt = `
      Você é um professor experiente corrigindo uma prova.
      
      CONTEXTO:
      - Eu estou enviando ${files.length} imagem(ns) ou página(s) de uma prova respondida por um aluno.
      - As páginas podem estar fora de ordem, analise o conteúdo globalmente.
      - Abaixo, forneço as QUESTÕES ORIGINAIS e o GABARITO CORRETO em JSON.
      
      DADOS ORIGINAIS:
      Questões: ${questionsString}
      Gabarito Esperado: ${answerKeyString}

      SUA TAREFA:
      1. Identifique as respostas do aluno em todas as imagens fornecidas.
      2. Compare cada resposta com o gabarito.
      3. Avalie questões de múltipla escolha e dissertativas com precisão.
      4. Calcule a nota final (0 a 10).

      FORMATO DE SAÍDA (JSON ESTRITO):
      Retorne APENAS um JSON com esta estrutura:
      {
        "studentName": "Nome identificado (ou 'Aluno')",
        "finalGrade": 0.0,
        "corrections": [
          {
            "questionIndex": 0,
            "status": "correct" | "partial" | "wrong",
            "score": 0.0,
            "teacherFeedback": "Comentário curto."
          }
        ]
      }
    `;

    const result = await model.generateContent([prompt, ...imageParts]);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const correctionData = JSON.parse(cleanJson);

    return NextResponse.json(correctionData, { status: 200 });
  } catch (error: any) {
    console.error("Erro na correção:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
