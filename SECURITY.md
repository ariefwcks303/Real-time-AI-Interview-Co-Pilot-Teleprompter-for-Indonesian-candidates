# Security & Data Privacy Policy - KoePilot

## 1. API Key Management & Secrets Isolation

* **Server-Only Exposure**: Kunci API Google Gemini (`GEMINI_API_KEY`) dikonsumsi secara eksklusif oleh server backend Node.js (`server.ts`). Kunci ini dimuat melalui `dotenv` atau disuntikkan secara aman oleh environment container runtime.
* **No Client Leakage**: Variabel `GEMINI_API_KEY` **tidak memiliki prefix `VITE_`**, sehingga Vite tidak akan mem-bundle kunci ini ke dalam aset JavaScript browser yang dapat diakses publik.
* **Lazy SDK Initialization**: Klien `@google/genai` diinisialisasi melalui fungsi pembungkus `getAi()` saat rute API dipanggil, mencegah kebocoran atau crash saat startup jika konfigurasi belum terpasang.

---

## 2. Environment Variables Governance

* File `.env` dikecualikan secara eksplisit dari kontrol versi pada file `.gitignore`.
* Repositori hanya menyertakan template publik `.env.example` dengan placeholder aman tanpa nilai rahasia riil.
* Header HTTP `User-Agent` disematkan secara spesifik (`aistudio-build`) saat menghubungi Gemini API untuk identifikasi layanan yang valid.

---

## 3. Audio & Voice Data Handling

* **In-Memory Streaming Only**: Tangkapan audio pewawancara (melalui `getDisplayMedia` atau `getUserMedia`) diproses murni dalam memori volatile peramban via buffer Web Audio API (`AudioContext`).
* **Tidak Ada Penyimpanan Audio ke Disk**: Aplikasi **tidak pernah** merekam, menyimpan, atau mengekspor file suara pengguna ke disk server, basis data, atau penyimpanan cloud pihak ketiga.
* **Pembersihan Aliran Audio (*Stream Teardown*)**: Saat fungsi pendengaran dinonaktifkan (`stopListening`), seluruh `MediaStreamTrack` diputus secara eksplisit (`track.stop()`) untuk memastikan lampu indikator mikrofon/kamera perangkat mati.
* **Keamanan Tab Rapat**: Penangkapan audio tab hanya mendengarkan sinyal audio tab yang dipilih pengguna secara sadar melalui prompt keamanan native browser.

---

## 4. Generated Text & Candidate PII (Personally Identifiable Information)

* **Data CV & Profil**: Data resume dan nama kandidat disimpan dalam state React lokal di browser dan diteruskan ke backend via HTTPS saat request naskah diajukan.
* **Sanitasi Prompt**: Instruksi sistem (*systemInstruction*) mengarahkan model untuk hanya menjawab berbasis data CV yang diberikan dan melarang halusinasi data baru.
* **Transisi Data**: Teks pertanyaan dan jawaban tidak disimpan di server database persisten mana pun (*zero persistence backend*).
* `TODO: Security Review`: Audit kepatuhan pemrosesan data pelamar kerja terhadap regulasi privasi data (misal: GDPR / UU PDP Indonesia) saat data CV diproses oleh layanan pihak ketiga (Google Gemini Cloud).

---

## 5. Telemetry, Observability & Console Logging

* **Tidak Menampilkan Teks PII pada Metrik**: Objek `ObservabilityRecord` hanya mencatat metadata kuantitatif (jumlah karakter `inputCharacters`, `outputCharacters`, durasi milidetik, jumlah token), bukan isi teks pertanyaan atau isi CV kandidat.
* **Console Tracing**: Log konsol hanya mencatat penanda waktu tahapan (`[REQ-001] START`, `[REQ-001] STT: ... ms`).
* **Korelasi Request ID**: Menggunakan string sekuensial publik (`REQ-xxx`) yang tidak mengekspos identifier internal infrastruktur atau sesi akun pribadi pengguna.

---

## 6. Browser Storage & Ephemeral State

* **Local State React**: Naskah bacaan, riwayat sesi aktif (`sessionHistory`), dan riwayat diagnostik (`observabilityHistory`) disimpan di memori RAM browser (`useState`). Seluruh data terhapus secara otomatis saat tab ditutup atau direfresh.
* **Tidak Ada Cookies / LocalStorage PII**: Aplikasi tidak menulis data kredensial atau riwayat wawancara ke `localStorage` atau `document.cookie`.
* `TODO: Security Review`: Jika fitur penyimpanan riwayat permanen ditambahkan di masa depan, wajib diimplementasikan enkripsi tingkat data (*encryption at rest*) dan sistem autentikasi multi-tenant yang terisolasi.

---

## 7. External API Communication

* Seluruh komunikasi antara backend Express dan Google Gemini API dilakukan melalui saluran terenkripsi aman **HTTPS / TLS 1.3** port 443.
* Endpoint API backend `/api/copilot/generate` memvalidasi tipe data input sebelum diteruskan ke model, menolak payload non-string dengan status HTTP 400.
* `TODO: Security Review`: Menambahkan rate limiter middleware (misal `express-rate-limit`) pada backend Express untuk mencegah serangan *Denial of Service* (DoS) atau lonjakan biaya konsumsi token dari pemanggilan berulang.

---

## 8. Summary of Security Posture

| Area Keamanan | Status Implementasi | Catatan & Referensi |
| :--- | :--- | :--- |
| **Pemisahan API Key** | **Implemented & Verified** | Kunci tersimpan di sisi server, tidak terpapar ke klien. |
| **Enkripsi Transit (HTTPS)** | **Implemented** | Ditangani oleh reverse proxy Cloud Run & TLS Gemini SDK. |
| **Pembersihan MediaStream** | **Implemented** | Track audio dan video diputus bersih saat standby. |
| **Sanitasi Log Publik** | **Implemented** | Hanya mencatat statistik waktu dan kuantitas karakter. |
| **Rate Limiting Backend** | **Partially implemented** | Bergantung pada kuota API provider; belum ada filter lokal di Express. |
| **Autentikasi Pengguna** | **Not implemented** | Akses publik terbuka untuk prototipe teleprompter. |
| **Audit Kepatuhan PII** | `TODO: Security Review` | Memerlukan review formal sebelum penggunaan produksi enterprise. |
