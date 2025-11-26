/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { geminiModel } from "@/lib/gemini";
import { ActivityData } from "@/store/useActivityStore";
import { Timestamp } from "firebase-admin/firestore";

interface PromptParams {
  level: string;
  series: string;
  type: string;
  topics: string[];
  difficulty: string;
  totalQuestions: number;
  objectiveCount: number;
  discursiveCount: number;
}

const buildPrompt = ({
  level,
  series,
  type,
  topics,
  difficulty,
  totalQuestions,
  objectiveCount,
  discursiveCount,
}: PromptParams): string => {
  const topicsList = topics.join(", ");

  return `
    Você é um assistente pedagógico especialista em criar avaliações escolares (BNCC).

    TAREFA: Gerar um arquivo JSON para uma ${type}.
    
    CONFIGURAÇÕES DO DOCUMENTO:
    - Público Alvo: ${series} do ${level}.
    - Tópicos: ${topicsList}.
    - Nível de Dificuldade Cognitiva: **${difficulty}**.
    
    ESTRUTURA DA PROVA (Rigoroso):
    - Total de Questões: Exatamente **${totalQuestions}**.
    - Quantidade de Múltipla Escolha: Exatamente **${objectiveCount}**.
    - Quantidade Dissertativas: Exatamente **${discursiveCount}**.

    REGRAS DE GERAÇÃO:
    1. Se a dificuldade for "Difícil", use questões que exijam raciocínio crítico e síntese. Se "Fácil", foque em memorização e identificação.
    2. Para Múltipla Escolha: Forneça 4 ou 5 alternativas.
    3. Para Dissertativas: Forneça um gabarito esperado detalhado.
    4. Formato de Saída: Retorne **APENAS** o JSON válido.

    Estrutura do JSON esperado:
    {
      "title": "Título Criativo da Atividade",
      "questions": [
        
        {
          "type": "multiple_choice",
          "question": "Enunciado...",
          "options": ["A)", "B)", "C)", "D)"]
        },
        {
          "type": "discursive",
          "question": "Enunciado..."
        }
      ],
      "answerKey": [
        {
          "question": "Repita o enunciado",
          "answer": "Resposta correta ou letra"
        }
      ]
    }
  `;
};

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization)
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    const token = authorization.split("Bearer ")[1];
    const decodedToken = await authAdmin.verifyIdToken(token);
    const userId = decodedToken.uid;

    const {
      level,
      series,
      type,
      topics,
      difficulty,
      totalQuestions,
      objectiveCount,
      discursiveCount,
    } = await request.json();

    if (!level || !series || !type || !topics) {
      return NextResponse.json(
        { message: "Campos obrigatórios faltando." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt({
      level,
      series,
      type,
      topics,
      difficulty,
      totalQuestions,
      objectiveCount,
      discursiveCount,
    });

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const generatedData = JSON.parse(cleanJson);

    const historyRef = dbAdmin
      .collection("users")
      .doc(userId)
      .collection("history");
    const newActivityRef = historyRef.doc();

    const activityToSave: Omit<ActivityData, "id"> = {
      ...generatedData,
      level,
      series,
      type,
      topics,

      difficulty,
      metadata: { totalQuestions, objectiveCount, discursiveCount },
      createdAt: Timestamp.now(),
    };

    await newActivityRef.set(activityToSave);

    const finalActivity: ActivityData = {
      ...activityToSave,
      id: newActivityRef.id,
      createdAt: activityToSave.createdAt.toDate().toISOString(),
    };

    return NextResponse.json(finalActivity, { status: 200 });
  } catch (error: any) {
    console.error("Erro na geração:", error);
    return NextResponse.json(
      { message: "Erro ao gerar atividade", details: error.message },
      { status: 500 }
    );
  }
}
