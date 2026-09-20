# Service Runbook - KoePilot AI Interview Teleprompter

## 1. Service Overview

KoePilot adalah layanan asisten teleprompter wawancara kerja *real-time*. Layanan ini menangkap audio pertanyaan pewawancara, mengonversinya menjadi teks, menyusun draf jawaban profesional berbasis CV kandidat menggunakan Google Gemini AI, dan menampilkan teks naskah bacaan ber-jeda nafas ke layar pengguna secara instan.

* **Proses Utama**: Node.js HTTP Server (`server.ts` / `dist/server.cjs`)
* **Port Standar**: `3000` (wajib terikat ke `0.0.0.0:3000`)
* **Protokol**: HTTP/1.1 (REST JSON API) + Static SPA Asset Serving

---

## 2. Health Indicators

Layanan dianggap beroperasi normal (*healthy*) apabila memenuhi indikator berikut:

1. **HTTP Health Check**: Endpoint `GET /api/health` mengembalikan status HTTP `200 OK` dengan payload:
   ```json
   { "status": "ok", "time": "2026-09-20T04:00:00.000Z" }
   ```
2. **AI Generation Endpoint**: Endpoint `POST /api/copilot/generate` merespons dalam waktu wajar (< 8000 ms) dengan HTTP `200 OK` dan struktur JSON valid.
3. **Audio Capture Status**: Indikator visual audio level pada navbar bergerak dinamis mengikuti suara pembicara.
4. **Console Log State**: Tidak ada uncaught error atau `TypeError` saat startup container.

---

## 3. Key Operational Metrics

| Metric | Normal Range | Unit | Cara Mengamati |
| :--- | :--- | :--- | :--- |
| **E2E Latency** | 2,000 – 6,500 | ms | Dasbor Observabilitas / Konsol (`[REQ-xxx] END`) |
| **STT Latency** | 100 – 800 | ms | Dasbor Observabilitas / Konsol (`[REQ-xxx] STT`) |
| **Context Latency** | 1 – 25 | ms | Dasbor Observabilitas / Konsol (`[REQ-xxx] CONTEXT`) |
| **Generation Latency** | 1,500 – 5,500 | ms | Dasbor Observabilitas / Konsol (`[REQ-xxx] GENERATION`) |
| **UI Rendering Latency** | 1 – 35 | ms | Dasbor Observabilitas (`uiRenderingMs`) |
| **TTFT** | N/A *(Batch mode)* | ms | Ditampilkan `N/A` (karena non-streaming endpoint) |
| **Token Usage** | 400 – 1,500 | tokens | Panel LLM Metrics (`totalTokens`) |
| **Request Status** | `COMPLETED` | enum | Indikator badge (`COMPLETED`, `PROCESSING`, `ERROR`) |
| **Error Rate** | 0% | % | Riwayat request table di dasbor |

---

## 4. Latency Troubleshooting Decision Tree

Jika terdeteksi latensi tinggi (*High E2E Latency > 8000 ms*), ikuti alur investigasi berikut:

```text
High E2E Latency (> 8000 ms)
       │
       ▼
Periksa Stage Breakdown pada Observability Dashboard
       │
       ├─► STT Latency Tinggi (> 1500 ms)
       │     │
       │     ├─► Browser Web Speech API lambat merespons jeda suara
       │     └─► Tindakan: Pastikan mikrofon tidak menangkap noise/gema konstan.
       │                   Gunakan simulator jika koneksi speech browser lambat.
       │
       ├─► Context Latency Tinggi (> 100 ms)
       │     │
       │     ├─► Beban CPU server tinggi pada perakitan prompt
       │     └─► Tindakan: Periksa panjang teks resume/JD kandidat; pastikan tidak melebihi 10.000 kata.
       │
       ├─► Generation Latency Tinggi (> 6000 ms)
       │     │
       │     ├─► Beban upstream Google Gemini API atau model fallback terjadi
       │     ├─► Periksa Retry Count di panel Network:
       │     │     • Jika Retry Count > 0: Model utama (gemini-3.8-flash) timeout/gagal, sistem beralih ke fallback.
       │     └─► Tindakan: Verifikasi status kuota API key dan cek status Google AI Studio Cloud.
       │
       └─► Network Latency / UI Rendering Tinggi (> 1000 ms)
             │
             ├─► Latensi koneksi internet antara browser kandidat dan server
             └─► Tindakan: Periksa koneksi internet pengguna atau matikan ekstensi browser yang memperlambat DOM render.
```

---

## 5. Common Failures & Remediation

| Gejala (Symptom) | Kemungkinan Penyebab | Langkah Investigasi | Solusi & Resolusi |
| :--- | :--- | :--- | :--- |
| **Status error: "GEMINI_API_KEY is not set"** | Variabel `GEMINI_API_KEY` kosong di environment server. | Periksa log backend saat startup atau periksa menu Secrets di AI Studio. | Tambahkan variabel `GEMINI_API_KEY` yang valid di file `.env` atau menu Settings/Secrets. |
| **Status HTTP 429 (Resource Exhausted)** | Kuota rate limit Gemini API terlampaui. | Periksa log respon server; periksa apakah retry count meningkat. | Tunggu 60 detik agar kuota quota window pulih, atau ganti API key dengan tier berbayar/kuota lebih tinggi. |
| **"Tidak ada audio tab yang dibagikan"** | Pengguna lupa mencentang opsi "Share tab audio" saat memilih tab Meet. | Periksa tab browser yang dipilih pengguna saat memicu `getDisplayMedia`. | Minta pengguna mengulang klik *Nyalakan Mic / Tab Audio* dan pastikan centang opsi "Share tab audio". |
| **Indikator mic tidak bergerak sama sekali** | Izin mikrofon diblokir pada tingkat browser atau sistem operasi. | Buka browser settings (`chrome://settings/content/microphone`) dan cek permission tab. | Izinkan akses mikrofon untuk domain aplikasi dan segarkan halaman. |
| **Container Crash saat Startup (`ERR_INVALID_ARG_TYPE`)** | Bundle CJS memanggil `fileURLToPath(import.meta.url)`. | Periksa log deployment Cloud Run saat revisi container booting. | Pastikan `server.ts` menggunakan `process.cwd()` dan bukan `import.meta.url` pada bundle CommonJS. |
| **Transkripsi bahasa Jepang terdengar salah / acak** | Pengaturan bahasa pada aplikasi berbeda dengan bahasa yang diucapkan HR. | Periksa badge bahasa di navbar (`Jepang` vs `British UK`). | Ganti pilihan target bahasa di navbar sesuai dengan bahasa wawancara aktual. |

---

## 6. Incident Response Procedures

Bila terjadi insiden saat sesi wawancara sedang atau akan berlangsung, lakukan 7 langkah mitigasi:

1. **Catat Request ID**: Ambil ID request yang bermasalah pada Observability Dashboard (misal: `REQ-004`).
2. **Periksa Request Status**: Identifikasi apakah status berlabel `ERROR`, `TIMEOUT`, atau terhenti di `PROCESSING`.
3. **Periksa Stage Latency Breakdown**: Lihat tahap mana yang waktu eksekusinya melonjak atau bernilai 0 ms (menandakan kegagalan sebelum tahap tersebut tercapai).
4. **Periksa Error Log Server**: Buka log container di Cloud Run / terminal dev server untuk melihat pesan exception asli dari Gemini SDK.
5. **Periksa Jaringan & HTTP Status**: Pastikan koneksi client ke `/api/copilot/generate` mengembalikan status 200, bukan 500 atau 504.
6. **Reproduksi Masalah Melalui Simulator**: Buka panel *Mock Interview Studio*, klik salah satu pertanyaan simulasi untuk mengisolasi apakah masalah terjadi pada input audio mikrofon atau pada backend AI.
7. **Dokumentasikan Temuan**: Salin metrik observabilitas dan isi template insiden pada `INCIDENT_TEMPLATE.md`.

---

## 7. Operational Debugging Checklist

Gunakan checklist ini saat melakukan verifikasi cepat sebelum wawancara dimulai:

- [ ] Pastikan dev server atau container aktif dan mengembalikan `200 OK` pada `GET /api/health`.
- [ ] Verifikasi `GEMINI_API_KEY` aktif dan memiliki kuota yang cukup.
- [ ] Buka aplikasi di Google Chrome / Chromium browser.
- [ ] Pastikan izin mikrofon telah disetujui (*Allow*).
- [ ] Uji satu pertanyaan di **Mock Interview Studio** (pastikan skrip teleprompter muncul dalam < 6 detik).
- [ ] Periksa console browser (tekan F12) untuk memastikan tidak ada error merah yang tidak tertangani.
- [ ] Pastikan cermin webcam (*Webcam Mirror*) dapat dibuka dan ditutup dengan lancar.

---

## 8. Escalation Guidelines

Apabila kegagalan tetap terjadi setelah menjalankan langkah-langkah di atas, kumpulkan informasi berikut sebelum meneruskan laporan eskalasi ke tim engineering:

1. **Request ID** dan **Timestamp kejadian** (beserta zona waktu).
2. **Tangkapan layar Observability Dashboard** (menampilkan Stage Breakdown, Token Metrics, dan Network Timing).
3. **Log konsol browser lengkap** (dari `[REQ-xxx] START` hingga `[REQ-xxx] END / ERROR`).
4. **Log server container** (output exception stack trace dari terminal / Cloud Run logs).
5. **Konfigurasi input**: Target bahasa, pertanyaan yang diucapkan, dan panjang teks profil kandidat.
