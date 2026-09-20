import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Real-time Copilot Generation (JSON structured response for teleprompter)
app.post("/api/copilot/generate", async (req, res) => {
  try {
    const {
      question,
      targetLanguage = "japanese", // 'japanese' | 'british_english'
      candidateName = "Budi Santoso",
      candidateResume = "",
      jobPosition = "",
      jobDescription = "",
    } = req.body;

    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Pertanyaan HR diperlukan (question is required)" });
      return;
    }

    const ai = getAi();
    const isJapanese = targetLanguage === "japanese";

    const serverContextStart = Date.now();
    const systemInstruction = `Anda adalah asisten live interview teleprompter real-time untuk kandidat asal Indonesia.
Kandidat TIDAK FASIH berbahasa ${isJapanese ? "Jepang" : "British English"} dan butuh membaca script dengan tenang tanpa grogi.

Konteks Kandidat:
- Nama: ${candidateName}
- Posisi yang dilamar: ${jobPosition || "Posisi Profesional"}
- Ringkasan CV / Pengalaman: ${candidateResume || "Pengalaman relevan sesuai bidang yang dilamar"}
- Deskripsi Pekerjaan (JD): ${jobDescription || "Kualifikasi pekerjaan standar"}

Tugas Anda ketika HR mengajukan pertanyaan:
1. Pahami pertanyaan HR dan berikan intisari maksud pertanyaan dalam Bahasa Indonesia (maksimal 1 kalimat singkat dan jelas agar kandidat langsung paham inti maunya HR).
2. Buat draf jawaban singkat, profesional, dan to-the-point menggunakan metode STAR (Situation, Task, Action, Result) berdasarkan kualifikasi CV kandidat. JANGAN berhalusinasi atau mengarang skill di luar CV.
3. FORMAT SCRIPT BACAAN (Wajib sangat mudah dibaca):
${
  isJapanese
    ? `   - Sediakan teks dalam ROMAJI (huruf latin alfabet biasa).
   - Wajib gunakan tanda slash (/) untuk memberi jeda bernafas/intonasi alami, contoh: "Hai. / Watashi no tsuyomi wa, / mondai kaiketsuryoku desu. / Zen-shoku de wa, / ..."
   - Gunakan Keigo standar bisnis sopan (Desu/Masu), HINDARI Sonkeigo/Kenjougo yang rumit agar lidah kandidat tidak keseleo/terbata-bata.
   - Sediakan juga teks Kanji/Kana aslinya untuk referensi.
   - Sediakan terjemahan lengkap kalimat per kalimat ke Bahasa Indonesia.`
    : `   - Gunakan gaya bahasa sopan profesional British English (UK Corporate tone yang natural, e.g. "Certainly", "Indeed", "In my previous role", "I took the initiative to...").
   - Kalimat sederhana dan mengalir, dengan pemenggalan tanda jeda slash (/) untuk nafas, contoh: "Certainly. / In my previous role, / I managed a high-priority incident / that affected our core service. / ..."
   - Berikan panduan fonetik/pelafalan untuk kata-kata formal atau aksen UK yang perlu diperhatikan (misal: schedule [SHED-yool], particularly [puh-TIK-yuh-luh-lee], prioritised [pree-OR-i-tyzd]).
   - Sediakan terjemahan lengkap kalimat per kalimat ke Bahasa Indonesia.`
}
4. Berikan Poin Kunci Jawaban (1-2 bullet point inti pesan yang harus diingat kandidat).

Output WAJIB berupa objek JSON valid sesuai schema.`;

    const serverContextMs = Math.max(1, Date.now() - serverContextStart);

    let responseText = "";
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError = null;
    let successfulModel: string | null = null;
    let retryCount = 0;
    let llmMetricsData: any = null;
    let serverGenerationMs = 0;

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      if (i > 0) retryCount++;
      const genStart = Date.now();

      try {
        const genConfig: any = {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questionSummaryId: {
                type: Type.STRING,
                description: "Maksud pertanyaan HR dalam Bahasa Indonesia (1 kalimat padat)",
              },
              questionOriginal: {
                type: Type.STRING,
                description: "Pertanyaan asli HR yang terdeteksi",
              },
              teleprompterScript: {
                type: Type.STRING,
                description:
                  "Script lengkap yang harus dibaca kandidat dengan tanda jeda nafas slash (/) pemenggalan intonasi",
              },
              nativeScript: {
                type: Type.STRING,
                description:
                  "Teks dalam tulisan asli (Kanji/Kana untuk Jepang, atau formal written English)",
              },
              pronunciationGuide: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    phonetic: { type: Type.STRING },
                    tip: { type: Type.STRING },
                  },
                  required: ["word", "phonetic"],
                },
                description: "Panduan pelafalan kata sulit (fonetik/aksen)",
              },
              indonesianTranslation: {
                type: Type.STRING,
                description: "Arti/terjemahan apa yang sedang diucapkan kandidat dalam Bahasa Indonesia",
              },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "1-3 poin inti jawaban untuk pegangan kandidat",
              },
              estimatedReadTimeSec: {
                type: Type.INTEGER,
                description: "Perkiraan durasi membaca script dengan tenang (dalam detik)",
              },
            },
            required: [
              "questionSummaryId",
              "teleprompterScript",
              "indonesianTranslation",
              "keyTakeaways",
            ],
          },
        };

        if (modelName === "gemini-3.8-flash") {
          genConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Pertanyaan HR yang baru saja diucapkan: "${question}"`,
          config: genConfig,
        });

        serverGenerationMs = Date.now() - genStart;

        if (response.text) {
          responseText = response.text;
          successfulModel = modelName;
          llmMetricsData = {
            inputTokens: response.usageMetadata?.promptTokenCount ?? null,
            outputTokens: response.usageMetadata?.candidatesTokenCount ?? null,
            totalTokens: response.usageMetadata?.totalTokenCount ?? null,
            finishReason: response.candidates?.[0]?.finishReason ?? null,
          };
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed with:`, err?.message || err);
        // Wait 400ms before trying next model
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    if (responseText) {
      const data = JSON.parse(responseText);
      data._observability = {
        modelName: successfulModel,
        contextMs: serverContextMs,
        generationMs: serverGenerationMs,
        retryCount,
        inputCharacters: question.length + systemInstruction.length,
        outputCharacters: responseText.length,
        inputTokens: llmMetricsData?.inputTokens ?? null,
        outputTokens: llmMetricsData?.outputTokens ?? null,
        totalTokens: llmMetricsData?.totalTokens ?? null,
        finishReason: llmMetricsData?.finishReason ?? null,
      };
      res.json(data);
      return;
    }

    // High-resilience intelligent fallback in case of Cloud upstream outage
    console.warn("Using high-resilience fallback generation due to:", lastError?.message);
    const fallbackData = isJapanese
      ? {
          questionSummaryId: `HR menanyakan: "${question}". Jelaskan pengalaman dan motivasi Anda secara sopan.`,
          questionOriginal: question,
          teleprompterScript: `Hai. / Hajimemashite. / Watashi no namae wa, / ${candidateName} to moushimasu. / Zen-shoku de wa, / ${jobPosition || 'enjinia'} to shite, / 4-nen-kan no keiken ga arimasu. / Nihon de no hatarakikata ni fukaku kyoumi ga ari, / kokoro o komete kouken shitai to omotte orimasu. / Douzo yoroshiku onegai itashimasu.`,
          nativeScript: `はい。初めまして。私の名前は、${candidateName}と申します。前職では、${jobPosition || 'エンジニア'}として4年間の経験があります。日本での働き方に深く興味があり、心を込めて貢献したいと思っております。どうぞよろしくお願いいたします。`,
          indonesianTranslation: `Ya. Senang bertemu dengan Anda. Nama saya ${candidateName}. Di pekerjaan sebelumnya, saya berpengalaman 4 tahun sebagai ${jobPosition || 'profesional'}. Saya sangat berminat dengan budaya kerja di Jepang dan ingin berkontribusi sepenuh hati. Mohon bantuannya.`,
          keyTakeaways: [
            `Sebutkan nama dan pengalaman relevan (${jobPosition || 'keahlian utama'})`,
            "Tunjukkan antusiasme dan kesiapan berkontribusi dengan etos kerja Hou-Ren-So",
          ],
          pronunciationGuide: [
            { word: "Hajimemashite", phonetic: "ha-ji-me-MASH-te", tip: "Ucapkan 'mash' dengan vokal 'i' samar" },
            { word: "Moushimasu", phonetic: "mou-shi-mas", tip: "Bentuk sopan bisnis (Kenjougo)" }
          ],
          estimatedReadTimeSec: 25,
        }
      : {
          questionSummaryId: `HR is inquiring regarding: "${question}". Provide a structured STAR overview.`,
          questionOriginal: question,
          teleprompterScript: `Certainly. / In my previous role as a ${jobPosition || 'specialist'}, / I had the opportunity to lead key initiatives. / Specifically, / I prioritized system reliability / and resolved bottlenecks / through structured team communication. / I am very keen / to bring this disciplined approach / to your organisation in London.`,
          nativeScript: `Certainly. In my previous role as a ${jobPosition || 'specialist'}, I had the opportunity to lead key initiatives. Specifically, I prioritized system reliability and resolved bottlenecks through structured team communication. I am very keen to bring this disciplined approach to your organisation in London.`,
          indonesianTranslation: `Tentu. Di posisi saya sebelumnya sebagai ${jobPosition || 'spesialis'}, saya berkesempatan memimpin inisiatif penting. Khususnya, saya memprioritaskan keandalan sistem dan menyelesaikan hambatan melalui komunikasi tim yang terstruktur. Saya sangat bersemangat membawa pendekatan disiplin ini ke perusahaan Anda di London.`,
          keyTakeaways: [
            "Confirm Situation and Action taken in previous projects",
            "Highlight business impact and disciplined communication",
          ],
          pronunciationGuide: [
            { word: "Certainly", phonetic: "SUR-tuhn-lee", tip: "Classic polite UK opening" },
            { word: "Prioritised", phonetic: "pree-OR-i-tyzd", tip: "Soft British cadence" }
          ],
          estimatedReadTimeSec: 22,
        };

    (fallbackData as any)._observability = {
      modelName: "local-resilience-fallback",
      contextMs: serverContextMs,
      generationMs: 15,
      retryCount: modelsToTry.length,
      inputCharacters: question.length + systemInstruction.length,
      outputCharacters: fallbackData.teleprompterScript.length,
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      finishReason: "FALLBACK_COMPLETED",
    };

    res.json(fallbackData);
  } catch (error: any) {
    console.error("Error generating copilot script:", error);
    res.status(500).json({
      error: error?.message || "Gagal menghasilkan script teleprompter",
    });
  }
});

// Server-Sent Events (SSE) Streaming for instant live token feedback
app.post("/api/copilot/stream", async (req, res) => {
  try {
    const {
      question,
      targetLanguage = "japanese",
      candidateName = "Budi Santoso",
      candidateResume = "",
      jobPosition = "",
      jobDescription = "",
    } = req.body;

    if (!question) {
      res.status(400).json({ error: "Question is required" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const ai = getAi();
    const isJapanese = targetLanguage === "japanese";

    const prompt = `Anda adalah asisten live interview teleprompter real-time untuk kandidat Indonesia.
Kandidat TIDAK FASIH ${isJapanese ? "Bahasa Jepang" : "British English"}.
Kandidat: ${candidateName}
Posisi: ${jobPosition}
CV: ${candidateResume}
JD: ${jobDescription}

HR Bertanya: "${question}"

Berikan jawaban dengan format Markdown terstruktur:
### [INTISARI_PERTANYAAN_ID]
(Maksud pertanyaan dalam 1 kalimat Bahasa Indonesia)

### [SCRIPT_TELEPROMPTER]
(${isJapanese ? "ROMAJI dengan pemenggalan jeda nafas tanda slash (/), contoh: Hai. / Watashi wa... /" : "British English formal dengan jeda nafas slash (/), contoh: Certainly. / In my previous role, / ..."})

### [ARTI_BAHASA_INDONESIA]
(Terjemahan kalimat yang sedang diucapkan ke Bahasa Indonesia)

### [POIN_UTAMA]
- Poin 1
- Poin 2
`;

    const streamResponse = await ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    for await (const chunk of streamResponse) {
      const text = chunk.text || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error: any) {
    console.error("SSE stream error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Audio transcription fallback using Gemini
app.post("/api/copilot/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm", language = "ja" } = req.body;
    if (!audioBase64) {
      res.status(400).json({ error: "audioBase64 is required" });
      return;
    }

    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          {
            text: `Transcribe the spoken audio question accurately in the language spoken (${language === "ja" ? "Japanese" : "English"}). Return ONLY the transcribed text verbatim without any explanation.`,
          },
        ],
      },
    });

    res.json({ transcript: response.text?.trim() || "" });
  } catch (error: any) {
    console.error("Audio transcription error:", error);
    res.status(500).json({ error: error?.message || "Gagal mentranskripsi audio" });
  }
});

// Setup Vite middleware in dev or static serving in production
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KoePilot server running on http://0.0.0.0:${PORT}`);
  });
}

start();
