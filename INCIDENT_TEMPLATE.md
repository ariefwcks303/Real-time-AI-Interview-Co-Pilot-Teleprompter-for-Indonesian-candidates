# Incident Report

## Incident ID
`INC-YYYYMMDD-XXX`

## Date / Time
- **Waktu Mulai Insiden**: YYYY-MM-DD HH:MM:SS (WIB / UTC)
- **Waktu Terdeteksi**: YYYY-MM-DD HH:MM:SS (WIB / UTC)
- **Waktu Resolusi**: YYYY-MM-DD HH:MM:SS (WIB / UTC)
- **Durasi Total**: XX menit / jam

## Severity
- [ ] **SEV-1 (Kritis)**: Sistem down total, teleprompter gagal memproses naskah untuk seluruh pengguna selama wawancara aktif.
- [ ] **SEV-2 (Tinggi)**: Latensi sangat lambat (> 10 detik) atau fitur penangkapan audio gagal di browser utama.
- [ ] **SEV-3 (Sedang)**: Model primer gagal, namun fallback berhasil merespons; atau fitur non-kritis (seperti Webcam Mirror) mengalami error.
- [ ] **SEV-4 (Rendah)**: Glitch visual kosmetik pada UI atau peringatan non-blocking di konsol.

## Summary
*Tuliskan ringkasan singkat kejadian insiden dalam 1-2 paragraf.*

## User Impact
- **Pengguna Terdampak**: (e.g. Seluruh kandidat, pengguna browser tertentu, kandidat yang menggunakan target bahasa Jepang).
- **Dampak Fungsional**: (e.g. Teleprompter tidak memunculkan teks jawaban saat HR selesai berbicara, menyebabkan kandidat harus menjawab secara spontan tanpa panduan).

## Detection
*Bagaimana insiden pertama kali terdeteksi? (e.g. Laporan langsung kandidat saat wawancara, alert HTTP 500 di log container, indikator ERROR merah di Observability Dashboard).*

## Request ID
- **Request ID Terdampak**: `REQ-XXX`
- **Session Timestamp**: `HH:MM:SS.mmm`

## Timeline
- `HH:MM:SS` - Insiden mulai terjadi.
- `HH:MM:SS` - Masalah dilaporkan atau terdeteksi di observabilitas.
- `HH:MM:SS` - Tim investigasi mulai memeriksa log server dan DevTools.
- `HH:MM:SS` - Akar masalah (*root cause*) teridentifikasi.
- `HH:MM:SS` - Tindakan mitigasi / perbaikan diterapkan.
- `HH:MM:SS` - Sistem diverifikasi kembali normal.

## Observed Metrics (dari Observability Dashboard)
- **E2E Latency**: XXX ms (Normal: 3,500 - 5,500 ms)
- **Audio Processing**: XXX ms
- **STT**: XXX ms
- **Context**: XXX ms
- **Generation**: XXX ms
- **Post-Processing**: XXX ms
- **UI Rendering**: XXX ms
- **TTFT**: N/A (Batch mode)
- **HTTP Status**: XXX (e.g. 500 / 429 / 200)
- **Retry Count**: X
- **Errors Logged**: `[Tuliskan pesan error lengkap dari konsol / response body]`

## Root Cause
*Jelaskan akar penyebab teknis masalah secara mendalam (misal: API key habis kuota, perubahan format modul CommonJS yang memicu crash proses, audio track terputus).*

## Contributing Factors
1. Faktor pendukung 1 (e.g. Kurangnya monitoring kuota proaktif).
2. Faktor pendukung 2 (e.g. Koneksi internet pengguna yang tidak stabil).

## Resolution
*Langkah taktis yang dilakukan untuk memulihkan layanan sesegera mungkin.*

## Corrective Action
*Perbaikan kode atau konfigurasi yang diterapkan untuk memperbaiki kerusakan yang terjadi.*

## Preventive Action
- [ ] Item pencegahan 1 (e.g. Menambahkan unit test build produksi sebelum deployment).
- [ ] Item pencegahan 2 (e.g. Menyiapkan alarm notifikasi batas kuota API).

## Lessons Learned
*Pelajaran apa yang dipetik oleh tim agar kejadian serupa tidak terulang di masa mendatang.*
