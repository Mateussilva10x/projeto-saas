/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    const fileParts = await Promise.all(
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

    const prompt = `
      Aja como um digitalizador e professor especialista.
      Analise estas ${files.length} imagem(ns) ou página(s) de uma prova escolar.
      O conteúdo pode estar dividido entre as páginas. Trate tudo como um único documento sequencial.

      SUA TAREFA:
      1. Transcreva todas as questões (enunciados) em ordem.
      2. Identifique se é múltipla escolha ou dissertativa.
      3. RESOLVA a prova para criar o gabarito oficial.
      4. Se for múltipla escolha, liste as opções.

      SAÍDA JSON ESTRITA (sem markdown):
      {
        "title": "Título identificado da prova (ou 'Prova Importada')",
        "level": "Nível identificado (ex: Fundamental, Médio)",
        "type": "Prova Externa",
        "questions": [
          {
            "question": "Texto da questão",
            "type": "multiple_choice" | "discursive",
            "options": ["A) ...", "B) ..."] (apenas se for múltipla escolha)
          }
        ],
        "answerKey": [
          {
            "question": "Repita o texto da questão para referência",
            "answer": "A resposta correta ou a letra da alternativa"
          }
        ]
      }
    `;

    const result = await model.generateContent([prompt, ...fileParts]);

    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const extractedData = JSON.parse(cleanJson);

    return NextResponse.json(extractedData, { status: 200 });
  } catch (error: any) {
    console.error("Erro na extração:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
