import { CandidateProfile, MockQuestion } from '../types';

export const PRESET_PROFILES: CandidateProfile[] = [
  {
    id: 'tokyo-it-frontend',
    name: 'Budi Santoso',
    targetLanguage: 'japanese',
    jobPosition: 'Frontend Engineer (React / TypeScript)',
    targetCompanyType: 'IT Startup di Shibuya, Tokyo (Sponsor Visa Gijinkoku)',
    badge: '🇯🇵 Japan IT Relocation',
    resumeSummary: `Pengalaman 4 tahun sebagai Frontend Developer di startup logistik Jakarta.
Keahlian: React 18, TypeScript, Tailwind CSS, REST API integration, state management (Zustand/Redux), Git workflow.
Prestasi: Berhasil mengoptimalkan web vitals FCP dari 2.8 detik menjadi 1.1 detik pada platform e-commerce dengan 200rb MAU.
Bahasa: Indonesia (Native), English (Conversational B2), Bahasa Jepang N4 (Sedang belajar untuk N3, mengerti etika kerja Hou-Ren-So).`,
    jobDescription: `Position: Frontend Developer (Tokyo/Hybrid)
Requirements: Experience in modern React & TypeScript, ability to collaborate with international team, eager to adapt to Japanese work culture, motivation to relocate to Tokyo.`,
  },
  {
    id: 'osaka-ssw-kaigo',
    name: 'Siti Nurhaliza',
    targetLanguage: 'japanese',
    jobPosition: 'Kaigo (Caregiver / Perawat Lansia)',
    targetCompanyType: 'Panti Lansia (Tokuyou) di Osaka (Visa SSW Tokutei Ginou 1)',
    badge: '🇯🇵 Tokutei Ginou SSW',
    resumeSummary: `Lulusan D3 Keperawatan dari Bandung dengan pengalaman 2 tahun di klinik geriatri.
Memiliki sertifikat kelulusan Ujian Keterampilan Tokutei Ginou Bidang Kaigo (Caregiver) dan JFT-Basic A2.
Keahlian: Membantu aktivitas harian lansia (makan, mobilitas kursi roda, kebersihan), pencatatan rekam medis harian, kesabaran tinggi dan kepribadian hangat.
Motivasi: Ingin mendedikasikan keterampilan di fasilitas lansia Jepang serta mempelajari standar pelayanan Omotenashi.`,
    jobDescription: `Caregiver Staff (Osaka Elderly Care Facility)
Kualifikasi: Lulus tes evaluasi keterampilan perawatan Tokutei Ginou 1, kemampuan komunikasi interpersonal yang ramah, sanggup bekerja shift malam berkala, disiplin kebersihan.`,
  },
  {
    id: 'london-fintech-cloud',
    name: 'Rizky Pratama',
    targetLanguage: 'british_english',
    jobPosition: 'Senior Cloud & DevOps Engineer',
    targetCompanyType: 'FinTech Enterprise di City of London (Remote to Relocation)',
    badge: '🇬🇧 UK Corporate / FinTech',
    resumeSummary: `6 years of hands-on experience architecting resilient cloud infrastructure on AWS & Kubernetes for high-volume payments systems in Southeast Asia.
Core Skills: Terraform, Docker, Kubernetes (EKS), CI/CD (GitHub Actions), PostgreSQL clustering, Prometheus/Grafana observability.
Key Achievement: Reduced cloud infrastructure spend by 28% while improving system SLA to 99.98% during peak transaction spikes.
Language: Indonesian (Native), English (Professional Working Proficiency, aiming for natural UK corporate tone and succinct STAR phrasing).`,
    jobDescription: `Role: Senior Cloud Platform Engineer (London / Hybrid / Remote)
We are seeking an experienced platform engineer to maintain our PCI-DSS compliant banking gateway. Must demonstrate solid incident triage skills, concise stakeholder communication, and architectural maturity.`,
  },
];

export const MOCK_QUESTIONS: MockQuestion[] = [
  // --- JAPANESE: TOKUTEI GINOU & IT ---
  {
    id: 'jp-q1',
    language: 'japanese',
    category: 'intro',
    textOriginal: 'まず初めに、自己紹介と志望動機を簡単にお話しいただけますか？',
    textTranslationId: 'Pertama-tama, bisakah ceritakan perkenalan diri dan motivasi melamar secara singkat?',
    suggestedFocus: 'Perkenalkan nama, asal Indonesia, pengalaman kunci 3-4 tahun, dan alasan memilih perusahaan ini.',
  },
  {
    id: 'jp-q2',
    language: 'japanese',
    category: 'technical',
    textOriginal: 'これまでのお仕事の中で、一番困難だった技術的な問題と、それをどう解決したか教えてください。',
    textTranslationId: 'Dalam pekerjaan sebelumnya, apa masalah teknis tersulit dan bagaimana Anda menyelesaikannya?',
    suggestedFocus: 'Fokus pada optimasi performa loading atau bug API yang berhasil diselesaikan tepat waktu.',
  },
  {
    id: 'jp-q3',
    language: 'japanese',
    category: 'cultural',
    textOriginal: '日本の仕事文化（ほうれんそう：報告・連絡・相談）について、どう考えて実践していますか？',
    textTranslationId: 'Bagaimana pandangan Anda tentang budaya kerja Hou-Ren-So (Lapor, Kontak, Konsultasi) dan praktiknya?',
    suggestedFocus: 'Jelaskan bahwa Hou-Ren-So mencegah keterlambatan proyek dan selalu berkomunikasi sebelum ada masalah besar.',
  },
  {
    id: 'jp-q4',
    language: 'japanese',
    category: 'tokutei_ginou',
    textOriginal: 'なぜ母国ではなく、日本に来て特定技能として働きたいと思ったのですか？',
    textTranslationId: 'Mengapa Anda memilih datang ke Jepang untuk bekerja sebagai Tokutei Ginou daripada di negara asal?',
    suggestedFocus: 'Sampaikan kekaguman pada etos kerja, teknologi, dan keinginan membangun karir jangka panjang di Jepang.',
  },
  {
    id: 'jp-q5',
    language: 'japanese',
    category: 'behavioral',
    textOriginal: 'チームのメンバーと意見が対立したとき、どのように解決しますか？',
    textTranslationId: 'Ketika ada perbedaan pendapat dengan rekan tim, bagaimana cara Anda menyelesaikannya?',
    suggestedFocus: 'Dengarkan dulu perspektif rekan kerja, cari titik temu berdasarkan data/tujuan bersama, lalu ambil keputusan terbaik.',
  },

  // --- BRITISH ENGLISH: UK CORPORATE / FINTECH ---
  {
    id: 'uk-q1',
    language: 'british_english',
    category: 'intro',
    textOriginal: 'Could you walk me through your background and what particularly drew you to this opportunity with us in London?',
    textTranslationId: 'Bisakah Anda ceritakan latar belakang Anda dan apa yang menarik minat Anda pada posisi ini di London?',
    suggestedFocus: 'Highlight strong tech expertise, financial reliability, and alignment with UK enterprise standards.',
  },
  {
    id: 'uk-q2',
    language: 'british_english',
    category: 'technical',
    textOriginal: 'Tell me about a time when a critical production incident occurred. How did you triage it under pressure?',
    textTranslationId: 'Ceritakan kejadian saat insiden kritis terjadi di server produksi. Bagaimana Anda menanganinya di bawah tekanan?',
    suggestedFocus: 'STAR method: identify caching/database bottleneck, roll back safely, fix within 2 hours, and publish post-mortem.',
  },
  {
    id: 'uk-q3',
    language: 'british_english',
    category: 'behavioral',
    textOriginal: 'How do you handle disagreements with stakeholders or senior managers regarding technical trade-offs?',
    textTranslationId: 'Bagaimana Anda menangani perbedaan pendapat dengan manajer/stakeholder terkait kompromi teknis?',
    suggestedFocus: 'Focus on empathy, framing arguments around business outcomes, latency vs cost, and documenting decisions.',
  },
  {
    id: 'uk-q4',
    language: 'british_english',
    category: 'cultural',
    textOriginal: 'Working across time zones requires disciplined asynchronous communication. How do you ensure smooth collaboration?',
    textTranslationId: 'Bekerja lintas zona waktu butuh komunikasi asinkron yang disiplin. Bagaimana Anda memastikan kolaborasi lancar?',
    suggestedFocus: 'Detailed documentation, clear PR descriptions, Loom summaries, and respecting British team working hours.',
  },
  {
    id: 'uk-q5',
    language: 'british_english',
    category: 'technical',
    textOriginal: 'What is your approach to code reviews and maintaining strict code quality across a distributed engineering team?',
    textTranslationId: 'Apa pendekatan Anda terhadap code review dan menjaga standar kualitas kode di tim yang tersebar?',
    suggestedFocus: 'Automated CI linters, constructive actionable comments, testing coverage, and shared ownership.',
  },
];
