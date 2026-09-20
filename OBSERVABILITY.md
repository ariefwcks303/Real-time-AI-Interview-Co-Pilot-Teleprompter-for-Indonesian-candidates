# Observability & Telemetry Specification - KoePilot

## 1. Observability Goals

Tujuan instrumentasi observabilitas pada KoePilot adalah:
1. **Real-time Pipeline Transparency**: Memberikan visibilitas langsung kepada kandidat dan operator mengenai apa yang sedang terjadi di balik layar saat memproses audio pertanyaan HR.
2. **Bottleneck Isolation**: Mengidentifikasi secara tepat apakah kelambatan respons berasal dari perangkat keras audio, jaringan browser, proses STT, atau pemanggilan LLM di cloud.
3. **Operational Confidence**: Memastikan kandidat mengetahui bahwa sistem sedang bekerja (tidak hang atau freeze) melalui indikator state machine (`RECORDING` → `PROCESSING` → `GENERATING` → `COMPLETED`).
4. **Fast Diagnostic & Troubleshooting**: Mempercepat investigasi insiden produksi menggunakan korelasi Request ID yang seragam di konsol dan antarmuka.

---

## 2. Telemetry Metrics Catalog

Berikut adalah seluruh metrik yang diinstrumentasi secara aktual dalam codebase:

| Nama Metrik | Definisi | Satuan | Sumber Data | Titik Pengumpulan (*Collection Point*) | Interpretasi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`totalMs` (E2E Latency)** | Total durasi siklus request dari deteksi audio/klik hingga render DOM selesai. | ms | `performance.now()` | `App.tsx` (didalam `requestAnimationFrame`) | Total waktu tunggu kandidat hingga naskah siap dibaca. |
| **`audioProcessingMs`** | Durasi inisialisasi buffer audio dan deteksi awal suara pembicara. | ms | `performance.now()` | `speech.ts` (`onaudiostart` ke `onspeechstart`) | Latensi perangkat audio / mikrofon client. |
| **`sttMs`** | Waktu pemrosesan suara menjadi transkrip teks final. | ms | `performance.now()` | `speech.ts` (`onspeechstart` ke `onresult` final) | Kecepatan engine Web Speech Recognition browser. |
| **`contextMs`** | Waktu pembentukan prompt dan penggabungan metadata profil di server. | ms | `Date.now()` | `server.ts` (sebelum memanggil `generateContent`) | Efisiensi CPU backend dalam merakit konteks STAR. |
| **`generationMs`** | Durasi round-trip panggilan AI ke Google Gemini API. | ms | `Date.now()` | `server.ts` (blok pemanggilan Gemini SDK) | Latensi komputasi model AI dan jaringan cloud. |
| **`postProcessingMs`** | Waktu validasi, sanitasi, dan ekstraksi naskah jeda nafas di client. | ms | `performance.now()` | `App.tsx` (sebelum `setState`) | Overhead pengolahan data lokal pada browser. |
| **`uiRenderingMs`** | Waktu yang dibutuhkan browser untuk mengecat frame visual ke layar. | ms | `performance.now()` | `App.tsx` (`requestAnimationFrame` delta) | Beban render grafis / DOM React 19. |
| **`timeToFirstTokenMs` (TTFT)** | Waktu hingga token pertama diterima dari model. | ms | N/A | N/A | **N/A** (*Not currently implemented* karena endpoint menggunakan mode non-streaming). |
| **`inputTokens`** | Jumlah token input yang dikirim ke model Gemini. | count | `usageMetadata.promptTokenCount` | `server.ts` → HTTP response body | Volume prompt yang diproses model. |
| **`outputTokens`** | Jumlah token jawaban yang dihasilkan model. | count | `usageMetadata.candidatesTokenCount` | `server.ts` → HTTP response body | Panjang naskah teleprompter yang digenerate. |
| **`totalTokens`** | Total akumulasi token input dan output. | count | `usageMetadata.totalTokenCount` | `server.ts` → HTTP response body | Penggunaan kuota total per request. |
| **`tokensPerSecond`** | Throughput kecepatan pembentukan token. | tok/s | Kalkulasi | `outputTokens / (generationMs / 1000)` | Kecepatan inferensi model Gemini. |
| **`audioDurationSec`** | Estimasi durasi ucapan pertanyaan HR dalam detik. | detik | Kalkulasi timer STT | `speech.ts` / `App.tsx` | Panjang pertanyaan lisan pewawancara. |
| **`inputCharacters`** | Jumlah karakter pertanyaan + profil CV kandidat. | chars | String length | `server.ts` / `App.tsx` | Ukuran payload teks input. |
| **`outputCharacters`** | Jumlah karakter script teleprompter yang dihasilkan. | chars | String length | `server.ts` / `App.tsx` | Volume teks yang harus dibaca kandidat. |
| **`requestDurationMs`** | Durasi jaringan HTTP request dari browser ke backend. | ms | `performance.now()` | `App.tsx` (fetch wrapper) | Overhead jaringan HTTP client-server. |
| **`httpStatus`** | Kode status HTTP dari respon backend. | code | `response.status` | `App.tsx` | Indikator keberhasilan panggilan API (200, 400, 500). |
| **`retryCount`** | Jumlah percobaan fallback ke model alternatif. | count | `server.ts` loop counter | `server.ts` → HTTP response body | Menandai kegagalan model utama jika > 0. |

---

## 3. Structured Logging Format

Setiap request memancarkan jejak log terstruktur ke console browser dengan format baku:

```text
[REQ-001] START
[REQ-001] AUDIO_PROCESSING: 85 ms
[REQ-001] STT: 340 ms
[REQ-001] CONTEXT: 12 ms
[REQ-001] GENERATION: 4120 ms
[REQ-001] POST_PROCESSING: 4 ms
[REQ-001] END: 4561 ms
```

Jika terjadi error pada salah satu tahapan, format log akan mencatat exception dan waktu terminasi:

```text
[REQ-002] START
[REQ-002] AUDIO_PROCESSING: 90 ms
[REQ-002] STT: 250 ms
[REQ-002] ERROR: [Error details]
[REQ-002] END: 1540 ms (ERROR)
```

---

## 4. Request Correlation Mechanism

Korelasi request diimplementasikan menggunakan nomor sekuensial monolitik berbasis `useRef` di browser:

1. **Pemberian ID**: Setiap request baru memperoleh ID terformat `REQ-001`, `REQ-002`, dst.
2. **Korelasi Frontend-Backend**: ID ini disematkan pada seluruh log konsol, rekaman memori (`ObservabilityRecord`), dan tabel riwayat request.
3. **Korelasi Data**: Memungkinkan developer mencocokkan baris data pada tabel *Recent Requests* langsung dengan jejak log di DevTools.

---

## 5. Performance Baseline

* **Production Baseline**: `Not established yet` (memerlukan pengujian berulang dalam berbagai kondisi jaringan produksi).
* **Hasil Pengujian Awal (Estimasi Dev Container)**:
  - Total E2E Latency: ~3,500 – 5,500 ms (mayoritas waktu berada pada LLM Generation ~3,000 – 4,500 ms).
  - STT Latency: ~250 – 500 ms.
  - UI Rendering: ~2 – 15 ms.

---

## 6. Future Observability Improvements

1. **Streaming TTFT Measurement**: Mengubah endpoint backend menjadi Server-Sent Events (SSE) agar `timeToFirstTokenMs` dapat diukur secara presisi sejak byte pertama keluar dari model.
2. **Distributed Tracing (OpenTelemetry)**: Menambahkan header `traceparent` (W3C Trace Context) dari browser ke Express server untuk integrasi dengan Cloud Trace / Datadog.
3. **Persistent Telemetry Sink**: Mengirim metrik observabilitas ke penyimpanan log terpusat (misal Google Cloud Logging atau BigQuery) untuk analitik jangka panjang.
4. **Client Network Quality Probing**: Mengukur estimasi RTT (*Round Trip Time*) jaringan pengguna secara berkala menggunakan Network Information API.
