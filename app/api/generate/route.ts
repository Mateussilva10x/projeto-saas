/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { authAdmin, dbAdmin } from "@/lib/firebaseAdmin";
import { geminiModel } from "@/lib/gemini";
import { ActivityData } from "@/store/useActivityStore";
import { Timestamp } from "firebase-admin/firestore";

const buildPrompt = (
  level: string,
  series: string,
  type: string,
  topics: string[]
): string => {
  const topicsList = topics.join(", ");
  const numQuestions = type === "Prova" ? 10 : type === "Simulado" ? 20 : 5;
  const mcCount = Math.floor(numQuestions * 0.6);
  const disCount = numQuestions - mcCount;

  return `
    Você é um assistente pedagógico especializado em criar avaliações e atividades
    para o sistema educacional brasileiro, seguindo as diretrizes da BNCC.

    Sua tarefa é gerar um documento JSON para uma ${type} destinada a alunos do ${series} do ${level}.

    Regras Estritas de Geração:
    1.  Nível de Dificuldade: Ajuste a complexidade e a linguagem para a **Série ${series} (${level})**.
    2.  Temas: A ${type} deve cobrir **exclusivamente** os seguintes temas: ${topicsList}.
    3.  Total de Questões: Gere exatamente ${numQuestions} questões.
    4.  Tipos de Questão:
        -   Gere ${mcCount} questões de múltipla escolha.
        -   Gere ${disCount} questões discursivas.
    5.  Formato de Saída: Retorne **APENAS** um objeto JSON válido, sem nenhum texto
        ou markdown antes ou depois dele.
    
    Estrutura do JSON esperado:
    {
      "title": "String (um título criativo para a ${type} sobre ${topicsList})",
      "questions": [
        {
          "type": "multiple_choice",
          "question": "String (O enunciado da questão de múltipla escolha)",
          "options": [
            "String (Opção A)",
            "String (Opção B)",
            "String (Opção C)",
            "String (Opção D)"
          ]
        },
        {
          "type": "discursive",
          "question": "String (O enunciado da questão discursiva)"
        }
        
      ],
      "answerKey": [
        {
          "question": "String (Repetir o enunciado da questão 1)",
          "answer": "String (A resposta correta. Para múltipla escolha, coloque o texto da opção correta, ex: 'Opção C')"
        },
        {
          "question": "String (Repetir o enunciado da questão 2)",
          "answer": "String (A resposta esperada para a questão discursiva)"
        }
        
      ]
    }
  `;
};

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    const token = authorization.split("Bearer ")[1];
    const decodedToken = await authAdmin.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { level, series, type, topics } = await request.json();
    if (!level || !series || !type || !topics || topics.length === 0) {
      return NextResponse.json(
        { message: "Campos faltando: nível, série, tipo ou temas." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(level, series, type, topics);
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    const generatedData = JSON.parse(responseText);

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
    console.error("Erro em /api/generate:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor", error: error.message },
      { status: 500 }
    );
  }
}
