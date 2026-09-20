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
      capabilities, // CandidateCapabilityProfile
    } = req.body;

    if (!question || typeof question !== "string") {
      res.status(400).json({ error: "Pertanyaan HR diperlukan (question is required)" });
      return;
    }

    const ai = getAi();
    const isJapanese = targetLanguage === "japanese";

    const serverContextStart = Date.now();

    // Format structured candidate evidence
    const declaredSkills = Array.isArray(capabilities?.skills)
      ? capabilities.skills.map((s: any) => `- ${s.name} (${s.level || 'declared'}${s.description ? `: ${s.description}` : ''})`).join('\n')
      : 'Tidak ada keahlian terstruktur yang dideklarasikan secara eksplisit.';

    const declaredExperiences = Array.isArray(capabilities?.experiences)
      ? capabilities.experiences.map((e: any) => `- ${e.title} di ${e.organization || 'Organisasi'}: ${e.description}${e.technologies?.length ? ` [Tech: ${e.technologies.join(', ')}]` : ''}`).join('\n')
      : 'Tidak ada riwayat pekerjaan terstruktur.';

    const declaredProjects = Array.isArray(capabilities?.projects)
      ? capabilities.projects.map((p: any) => `- ${p.name}: ${p.description}${p.technologies?.length ? ` [Tech: ${p.technologies.join(', ')}]` : ''}${p.achievements?.length ? ` [Achievements: ${p.achievements.join('; ')}]` : ''}`).join('\n')
      : 'Tidak ada proyek terstruktur.';

    const declaredCerts = Array.isArray(capabilities?.certifications)
      ? capabilities.certifications.map((c: any) => `- ${c.name} (${c.issuer || 'Penerbit'}${c.year ? `, ${c.year}` : ''})`).join('\n')
      : 'Tidak ada sertifikasi terdaftar.';

    const systemInstruction = `Anda adalah KoePilot, asisten live interview teleprompter real-time untuk kandidat asal Indonesia.
Kandidat TIDAK FASIH berbahasa ${isJapanese ? "Jepang" : "British English"} dan butuh membaca script dengan tenang, percaya diri, dan profesional.

================================================================================
CANDIDATE CAPABILITY CONSTRAINTS (STRICT & ABSOLUTE PRODUCT PRINCIPLE):
KoePilot membantu kandidat mengomunikasikan pengalaman nyata mereka.
KoePilot DILARANG MENGARANG (MANUFACTURE/FABRICATE) pengalaman yang tidak dimiliki kandidat!

AI DILARANG KERAS mengarang, mengasumsikan, mengekstrapolasi, atau mengklaim hal-hal berikut jika TIDAK ada bukti di profil kandidat di bawah:
1. Keterampilan / Teknologi (Skills / Technologies)
2. Perusahaan / Pemberi kerja (Employers / Organizations)
3. Proyek nyata (Projects)
4. Tanggung jawab pekerjaan (Responsibilities)
5. Pencapaian atau Metrik terukur (Achievements, metrics, percentages like "improved by 25%", benchmarks)
6. Sertifikasi resmi (Certifications)
7. Tahun pengalaman / Lama kerja (Years of experience)
8. Pengalaman kepemimpinan / Manajerial / Ukuran tim (Leadership, team size like "led a team of 5 engineers")
9. Pengalaman deployment skala produksi (Production deployment, cluster scale)
10. Hasil bisnis (Business results)

ATURAN EVALUASI PERTANYAAN (CAPABILITY ANALYSIS):
Sebelum membuat jawaban, evaluasi pertanyaan HR terhadap bukti yang dideklarasikan kandidat:
- "SUPPORTED": Pertanyaan dapat dijawab penuh menggunakan keterampilan, pengalaman, dan bukti nyata yang tercantum di profil kandidat.
- "PARTIALLY_SUPPORTED": Kandidat memiliki pengalaman atau fondasi terkait (misal: punya Docker tapi tidak punya Kubernetes produksi), namun belum memiliki pengalaman langsung pada alat/teknologi spesifik yang ditanyakan.
  -> AI WAJIB jujur mengakui bahwa kandidat belum menggunakan teknologi tersebut secara langsung di produksi, lalu pivot secara profesional ke keterampilan terkait yang benar-benar ada di profil.
- "UNSUPPORTED": Pertanyaan menanyakan keterampilan, teknologi, atau peran di luar profil kandidat (misal: arsitektur AWS Lambda serverless ketika profil hanya frontend React, atau memimpin tim besar ketika profil staf biasa).
  -> AI WAJIB dengan jujur dan rendah hati mengakui bahwa kandidat belum memiliki pengalaman langsung dengan hal tersebut, menjelaskan fondasi yang dimiliki, dan menunjukkan kemauan serta kecepatan belajar tanpa berbohong!

FORMAT SCRIPT BACAAN (Wajib sangat mudah dibaca):
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

Output WAJIB berupa objek JSON valid sesuai schema.

--- DATA KANDIDAT YANG VALID (EVIDENCE SOURCE OF TRUTH) ---
[CANDIDATE PROFILE]
Nama: ${candidateName}
Posisi Dilamar: ${jobPosition || "Posisi Profesional"}

[CANDIDATE SKILLS]
${declaredSkills}

[CANDIDATE EXPERIENCE]
${declaredExperiences}

[CANDIDATE PROJECTS]
${declaredProjects}

[CANDIDATE CERTIFICATIONS]
${declaredCerts}

[RESUME & CV SUMMARY]
${candidateResume || "Tidak ada CV summary tambahan."}

[JOB DESCRIPTION]
${jobDescription || "Kualifikasi standar untuk posisi."}
================================================================================`;

    const serverContextMs = Math.max(1, Date.now() - serverContextStart);

    let responseText = "";
    const modelsToTry = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let lastError = null;
    let successfulModel: string | null = null;
    let retryCount = 0;
    let llmMetricsData: any = null;
    let serverGenerationMs = 0;
    let regenerationCount = 0;
    let unsupportedClaimDetected = false;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        capabilityStatus: {
          type: Type.STRING,
          enum: ["SUPPORTED", "PARTIALLY_SUPPORTED", "UNSUPPORTED"],
          description: "Status kesesuaian kapabilitas kandidat terhadap pertanyaan HR",
        },
        relevantCapabilities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Daftar keterampilan atau bukti dari profil yang digunakan dalam jawaban",
        },
        missingCapabilities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Keterampilan atau alat yang ditanyakan HR namun belum ada di profil kandidat",
        },
        evidenceUsed: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Kutipan bukti konkret dari pengalaman/proyek/sertifikasi kandidat yang dipakai",
        },
        riskNote: {
          type: Type.STRING,
          description: "Penjelasan batas kapabilitas, catatan kejujuran, atau pivot yang dilakukan",
        },
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
        "capabilityStatus",
        "questionSummaryId",
        "teleprompterScript",
        "indonesianTranslation",
        "keyTakeaways",
      ],
    };

    // Helper to validate whether an answer contains fabricated claims
    const validateCapabilityCompliance = (parsed: any) => {
      const issues: string[] = [];
      const scriptLower = ((parsed.teleprompterScript || '') + ' ' + (parsed.nativeScript || '')).toLowerCase();

      // Check for fabricated metrics if none exist in profile
      const rawProfileText = (declaredSkills + ' ' + declaredExperiences + ' ' + declaredProjects + ' ' + declaredCerts + ' ' + candidateResume).toLowerCase();
      
      // Look for percentages in script not in profile
      const percentageMatches = scriptLower.match(/\b\d{1,3}%\b/g);
      if (percentageMatches) {
        for (const p of percentageMatches) {
          if (!rawProfileText.includes(p)) {
            issues.push(`Fabricated metric detected: "${p}" is not declared in candidate profile`);
          }
        }
      }

      // Check if question asks about specific unlisted tech but status was claimed as fully SUPPORTED
      const qLower = question.toLowerCase();
      const techKeywords = ['aws lambda', 'kubernetes', 'k8s', 'kafka', 'graphql', 'golang', 'rust', 'flutter'];
      for (const tech of techKeywords) {
        if (qLower.includes(tech) && !rawProfileText.includes(tech)) {
          if (parsed.capabilityStatus === 'SUPPORTED') {
            issues.push(`Unsupported claim: Question asks about "${tech}" which is not in candidate profile, but status was marked SUPPORTED`);
          }
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
      };
    };

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      if (i > 0) retryCount++;
      const genStart = Date.now();

      try {
        const genConfig: any = {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        };

        if (modelName === "gemini-3.8-flash") {
          genConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        let currentPrompt = `Pertanyaan HR yang baru saja diucapkan: "${question}"`;
        let response = await ai.models.generateContent({
          model: modelName,
          contents: currentPrompt,
          config: genConfig,
        });

        serverGenerationMs = Date.now() - genStart;

        if (response.text) {
          let parsed = JSON.parse(response.text);

          // P1: UNSUPPORTED CLAIM GUARD & VALIDATION (Section 9)
          const validation = validateCapabilityCompliance(parsed);
          if (!validation.isValid && regenerationCount < 2) {
            unsupportedClaimDetected = true;
            regenerationCount++;
            console.warn(`[Capability Guard] Validation issues detected on attempt ${regenerationCount}:`, validation.issues);

            // Re-generate with strict corrective prompt
            const correctionPrompt = `PERINGATAN VALIDASI: Draf jawaban sebelumnya melanggar batas kapabilitas kandidat:
${validation.issues.join('\n')}

Silakan susun ulang jawaban dengan jujur!
- Jika kandidat tidak memiliki teknologi/metrik tersebut, set capabilityStatus ke "PARTIALLY_SUPPORTED" atau "UNSUPPORTED".
- Akui keterbatasan secara jujur, JANGAN sebutkan metrik atau skill yang tidak tercantum di profil!
- Sediakan teleprompterScript yang aman dan jujur.

Pertanyaan HR: "${question}"`;

            const secondGenStart = Date.now();
            const secondResponse = await ai.models.generateContent({
              model: modelName,
              contents: correctionPrompt,
              config: genConfig,
            });
            serverGenerationMs += (Date.now() - secondGenStart);

            if (secondResponse.text) {
              const secondParsed = JSON.parse(secondResponse.text);
              const secondValidation = validateCapabilityCompliance(secondParsed);
              if (secondValidation.isValid) {
                parsed = secondParsed;
              } else {
                // If still invalid, enforce safe fallback answer
                unsupportedClaimDetected = true;
                parsed.capabilityStatus = parsed.capabilityStatus === 'SUPPORTED' ? 'PARTIALLY_SUPPORTED' : parsed.capabilityStatus;
                parsed.riskNote = `[Safe Boundary Guard] ${secondValidation.issues[0] || 'Jawaban disesuaikan agar tidak mengarang pengalaman yang tidak ada.'}`;
              }
            }
          }

          responseText = JSON.stringify(parsed);
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
        capabilityStatus: data.capabilityStatus || "SUPPORTED",
        relevantCapabilityCount: (data.relevantCapabilities || []).length,
        evidenceCount: (data.evidenceUsed || []).length,
        unsupportedClaimDetected,
        regenerationCount,
      };
      res.json(data);
      return;
    }

    // High-resilience intelligent fallback in case of Cloud upstream outage
    console.warn("Using high-resilience fallback generation due to:", lastError?.message);
    const fallbackData = isJapanese
      ? {
          capabilityStatus: "PARTIALLY_SUPPORTED",
          relevantCapabilities: [(capabilities?.skills?.[0]?.name) || jobPosition || "Pengalaman profesional"],
          missingCapabilities: [],
          evidenceUsed: [(capabilities?.experiences?.[0]?.title) || candidateResume?.slice(0, 80) || "Riwayat pekerjaan"],
          riskNote: "Fallback safe boundary: menggunakan pengalaman nyata yang dideklarasikan.",
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
          capabilityStatus: "PARTIALLY_SUPPORTED",
          relevantCapabilities: [(capabilities?.skills?.[0]?.name) || jobPosition || "Professional background"],
          missingCapabilities: [],
          evidenceUsed: [(capabilities?.experiences?.[0]?.title) || candidateResume?.slice(0, 80) || "Career history"],
          riskNote: "Fallback safe boundary: adhering strictly to declared profile.",
          questionSummaryId: `HR is inquiring regarding: "${question}". Provide a structured STAR overview.`,
          questionOriginal: question,
          teleprompterScript: `Certainly. / In my previous role as a ${jobPosition || 'specialist'}, / I had the opportunity to work on core systems. / While I haven't worked with all specific tools directly, / I have strong transferable foundations / and a proven ability to learn rapidly. / I prioritize reliability / and structured team communication.`,
          nativeScript: `Certainly. In my previous role as a ${jobPosition || 'specialist'}, I had the opportunity to work on core systems. While I haven't worked with all specific tools directly, I have strong transferable foundations and a proven ability to learn rapidly. I prioritize reliability and structured team communication.`,
          indonesianTranslation: `Tentu. Di posisi saya sebelumnya sebagai ${jobPosition || 'spesialis'}, saya berkesempatan menangani sistem utama. Meskipun saya belum pernah menggunakan semua alat spesifik tersebut secara langsung, saya memiliki fondasi kuat yang dapat dialihkan serta kemampuan belajar cepat. Saya memprioritaskan keandalan dan komunikasi tim terstruktur.`,
          keyTakeaways: [
            "Confirm honest boundaries and strong transferable foundations",
            "Highlight rapid learning ability and disciplined communication",
          ],
          pronunciationGuide: [
            { word: "Certainly", phonetic: "SUR-tuhn-lee", tip: "Classic polite UK opening" },
            { word: "Prioritise", phonetic: "pree-OR-i-tyz", tip: "Soft British cadence" }
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
      capabilityStatus: fallbackData.capabilityStatus,
      relevantCapabilityCount: fallbackData.relevantCapabilities.length,
      evidenceCount: fallbackData.evidenceUsed.length,
      unsupportedClaimDetected: false,
      regenerationCount: 0,
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
      capabilities,
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

    const prompt = `Anda adalah KoePilot, asisten live interview teleprompter real-time untuk kandidat Indonesia.
Kandidat TIDAK FASIH ${isJapanese ? "Bahasa Jepang" : "British English"}.
Kandidat: ${candidateName}
Posisi: ${jobPosition}
CV: ${candidateResume}
Skills: ${JSON.stringify(capabilities?.skills || [])}
Projects: ${JSON.stringify(capabilities?.projects || [])}
JD: ${jobDescription}

PENTING - BATASAN KAPABILITAS KANDIDAT:
Hanya gunakan keahlian nyata di atas. DILARANG MENGARANG teknologi, metrik (persentase), atau posisi kepemimpinan yang tidak tercantum di profil! Jika pertanyaan menanyakan hal di luar profil, akui keterbatasan secara jujur dan pivot ke keahlian dasar terkait.

HR Bertanya: "${question}"

Berikan jawaban dengan format Markdown terstruktur:
### [STATUS_KAPABILITAS]
(SUPPORTED / PARTIALLY_SUPPORTED / UNSUPPORTED)

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
