# Panduan Sistem Pewarnaan (Color System) — Zenvinus UI Revamp

> **Tujuan Dokumen:** File ini adalah instruksi resmi untuk AI saat melakukan **revamp UI/UX** pada proyek **Zenvinus UI**. Seluruh desain baru (baik komponen, halaman publik, dashboard 4 role, maupun studio anotasi) **wajib** mengacu pada palet, hierarki kontras, dan aturan semantik warna di bawah ini agar identitas visual Zenvinus tetap konsisten.

---

## 1. Identitas & Karakter Warna Zenvinus

Zenvinus menggabungkan dua karakter visual utama:
1. **Deep Midnight Navy (`#020626`)** — memberi kesan teknikal, kredibel, enterprise, dan tegas untuk tipografi heading, struktur navigasi aktif, dan panel data gelap.
2. **Zenvinus Teal / Aqua (`#05DAC3`)** — warna aksen khas AI/data Zenvinus yang energik dan modern untuk CTA utama dashboard, highlight interaktif, ikon fitur, serta indikator aktif.
3. **Clean Light Canvas (`#FFFFFF` & `#F5F6F8`)** — permukaan terang yang bersih dan lapang agar data tabel, kartu proyek, serta ruang kerja anotasi nyaman dibaca dalam waktu lama.

---

## 2. Token Warna Utama (Core Brand & Surface Tokens)

Saat menulis CSS/SCSS atau mengonfigurasi design tokens (termasuk jika migrasi ke Tailwind CSS / CSS variables baru), pertahankan mapping token berikut:

| Peran / Fungsi | CSS Variable Eksisting | Hex / Nilai | Aturan Penggunaan |
| :--- | :--- | :--- | :--- |
| **Brand Primary (Dark Navy)** | `--tp-theme-primary` | `#020626` | Heading utama, tombol primer halaman publik (`.tp-btn`), pill filter aktif, panel angka gelap, badge langkah. |
| **Brand Accent (Zenvinus Teal)** | `--tp-theme-secondary` | `#05DAC3` | Aksen utama, tombol primer dashboard (`.edash-btn`), highlight kata kunci, hover link/border, ikon fitur, bar chart. |
| **Accessible Teal (Teks & Link)** | `--zv-accent-ink` *(lokal)* | `#0D9488` | **WAJIB dipakai** jika warna teal digunakan sebagai **teks, link, atau label kecil** di atas background putih/terang (karena `#05DAC3` kontrasnya terlalu rendah untuk teks kecil). |
| **Accessible Teal Dark** | — | `#0F5F58` / `#07876F` | Teks di atas soft teal tint (alert sukses, badge valid/open). |
| **Heading Primary** | `--tp-heading-primary` | `#020626` | Judul halaman (`h1`–`h6`), label form, judul kartu, angka KPI. |
| **Heading Secondary** | `--tp-heading-secondary` | `#000000` | Judul meta/detail aset tertentu (opsional; saat revamp lebih baik diseragamkan ke `#020626`). |
| **Body Text** | `--tp-text-body` | `#5A627D` | Paragraf, deskripsi kartu, subtitle, caption, label sekunder. |
| **Body Text (Prose / Artikel)** | — | `#3F4756` / `#4A5160` | Teks bacaan panjang pada halaman artikel, About, dan FAQ agar lebih nyaman dibaca. |
| **Muted / Placeholder / Icon** | — | `#6B7280` / `#9CA3AF` | Label metadata sekunder, teks placeholder input, ikon non-aktif, nilai `null`. |
| **App Canvas Background** | `--tp-grey-2` | `#F5F6F8` | Latar belakang utama seluruh halaman **Dashboard**, **Task Flow**, dan **Login**. |
| **Neutral Surface Grey** | `--tp-grey-1` | `#F1F1F1` | Latar netral sekunder, track progress bar kosong. |
| **Soft Ice Cyan Tint** | `--tp-bg-primary` | `#F3FBFE` | Latar section ringan (Engines, Asset Hero Icon, Preview Split Box). |
| **Soft Mint Tint** | `--zv-soft` *(About)* | `#F1FBFA` / `#F1FBFE` | Latar kartu highlight, blockquote artikel, author box, dan CTA card. |
| **Card / Elevated Surface** | `--tp-common-white` | `#FFFFFF` | Latar kartu (`.edash-card`, `.tflow-panel`), topbar, modal, input field. |

> **Catatan Legacy:** Di `public/assets/scss/utils/_colors.scss` terdapat variabel SCSS `$theme-primary: #3D6CE7` yang merupakan sisa template lama dan **tidak** di-output ke `:root`. **Jangan gunakan `#3D6CE7`** sebagai primary brand Zenvinus saat revamp.

---

## 3. Warna Permukaan Gelap (Dark Surfaces & Code Blocks)

Digunakan khusus pada **Footer**, **Blok Kode / Citation**, **Hero Gelap**, dan **Elemen Kontras Tinggi**:

| Area | Hex / Nilai | Penggunaan |
| :--- | :--- | :--- |
| **Footer Main Background** | `#020C1B` | Latar utama footer situs publik. |
| **Footer Secondary Surface** | `#0E1825` | Kartu/elemen sekunder di dalam footer. |
| **Footer Bottom / Input** | `#081221` | Baris copyright bawah & area input newsletter footer. |
| **Teks Muted di Atas Gelap** | `#B4B4B4` | Teks sekunder dan link di footer gelap. |
| **Border di Atas Gelap** | `#4E545F` / `rgba(255, 255, 255, 0.16)` | Garis pemisah tipis pada panel/footer gelap. |
| **Code / Citation Block** | BG `#0B1220` · Teks `#DBE4FF` | Blok `<pre><code>` artikel dan BibTeX citation di halaman detail dataset/model. |
| **Studio Dark Accent** | `#071C34` | Tombol aktif view switcher Dataset Studio, nomor step aktif, serta backdrop modal mobile (`rgba(7, 28, 52, 0.45)`). |
| **Dark Hero / Banner Gradient** | `linear-gradient(160deg, #020626 0%, #131B46 100%)` | Hero gradient pada ringkasan reward / panel pencapaian gelap. |

---

## 4. Warna Border, Divider & Skeleton

Gunakan garis pemisah yang sangat halus agar UI terasa modern dan tidak berisik:

| Elemen | Nilai Warna |
| :--- | :--- |
| **Card / Input Border (Dashboard & Login)** | `rgba(8, 13, 53, 0.08)` s.d. `rgba(8, 13, 53, 0.10)` |
| **Standard Neutral Border** | `#E5E7EB`, `#E6E9EE`, `#E3E8EF`, `#D1D5DB` |
| **Hairline List Divider** | `#EEF1F4`, `#EDF0F4` |
| **Focus Ring (Teal Glow)** | Border `#05DAC3` / `#0D9488` + `box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15)` (atau `rgba(19, 205, 189, 0.12)`) |
| **Soft Card Shadow** | `0px 4px 27px rgba(0, 0, 0, 0.04)` atau `0 12px 40px rgba(2, 6, 38, 0.07)` |
| **Skeleton Loading Shimmer** | `linear-gradient(90deg, #EDF1F5 25%, #F6F8FA 37%, #EDF1F5 63%)` |

---

## 5. Sistem Warna Semantik (Status, Tone, & Badge)

Sistem semantik di seluruh aplikasi (**KPI Grid**, **Status Proyek/Order**, **Task Types**, **Quality Check**, **Dataset Studio**, dan **Support Tickets**) menggunakan pasangan **soft pastel background + vivid text**:

| Tone / Makna | Background | Teks / Ikon | Konteks Penggunaan |
| :--- | :--- | :--- | :--- |
| **Blue** *(Info / Active / In Review)* | `#E7F1FF` | `#1684ED` *(atau `#1668D6`)* | Status `IN REVIEW`, `AUTO`, tipe task Vision/Image, KPI proyek aktif. |
| **Mint / Green** *(Success / Approved / Published)* | `#DCF7F0` / `#E3F9F1` / `#DCFCE7` | `#09AD86` / `#07876F` / `#166534` | Status `APPROVED`, `OPEN`, `PUBLISHED`, delta naik (`+12%`), step selesai, tipe Text/Tabular. |
| **Purple** *(Expert / Escalated / Internal)* | `#E9E5FE` | `#5337EF` | Status `ESCALATED`, badge `Internal · Zenvinus`, tipe Audio/Speech, KPI revenue/earnings. |
| **Orange** *(Revision / Down / LLM)* | `#FFEEDA` | `#EF7A00` | Status `REVISION REQUIRED`, delta turun, tipe LLM Evaluation / Video. |
| **Amber** *(Pending / Draft / Qualification)* | `#FFF4DD` / `#FEF3C7` / `#FFF8E6` | `#A06A00` / `#92400E` *(aksen `#F59E0B` / `#F0A912`)* | Status `PENDING REVIEW`, `DRAFT`, `QUALIFICATION`, warning callout, gold/rating (`#FFB820`). |
| **Red** *(Error / Rejected / Danger)* | `#FFE8EA` / `rgba(220, 38, 38, 0.10)` | `#DC3545` / `#DC2626` / `#B42318` | Status `REJECTED`, `INVALID`, validasi gagal, error form, tombol aksi berbahaya. |

---

## 6. Visualisasi Data & Canvas Anotasi

### A. Grafik & Progress Bar Dashboard
- **Bar Chart Default:** `linear-gradient(180deg, #05DAC3, rgba(19, 205, 189, 0.35))`
- **Bar Chart Hover:** `linear-gradient(180deg, #020626, #05DAC3)`
- **Progress Fill Horizontal:** `linear-gradient(90deg, #020626, #05DAC3)`

### B. Object Annotation Workspace (`object-annotation.tsx`)
Untuk bounding box & polygon mask multi-kelas di atas gambar, gunakan palet kontras tinggi yang mudah dibedakan mata:
- **Class Palette (`CLASS_COLORS`):** `['#3B82F6', '#F97316', '#22C55E', '#A855F7', '#EAB308', '#EC4899', '#14B8A6', '#EF4444']`
- **Unlabelled Region:** `#94A3B8`
- **Active Polygon Drawing Stroke:** `#38BDF8` (titik penutup polygon: `#22C55E`)

---

## 7. Aturan Ketat untuk AI Saat Revamp UI/UX

1. **Pertahankan Identitas Dual-Brand (`#020626` + `#05DAC3`):**
   - Jangan mengganti warna aksen menjadi biru generic (`#3B82F6` / `#3D6CE7`) atau ungu/gradient AI generik (*AI slop*).
   - Gunakan `#020626` sebagai jangkar ketegasan (heading, active filter/tab, dark showcase) dan `#05DAC3` sebagai aksen utama interaktif.
2. **Jaga Aksesibilitas & Kontras Teks (WCAG):**
   - **DILARANG** memakai `#05DAC3` untuk teks paragraf, link kecil, atau label di atas latar putih (`#FFFFFF`) / abu terang (`#F5F6F8`). Gunakan `#0D9488` atau `#07876F` untuk teks/link teal di atas permukaan terang, dan gunakan `#05DAC3` untuk background tombol (dengan teks `#FFFFFF` atau `#020626` yang kontras), ikon besar, border fokus, atau teks di atas background gelap (`#020626` / `#020C1B`).
   - Pastikan kontras tombol utama `.edash-btn` terbaca jelas: bila background `#05DAC3`, pertimbangkan teks `#020626` atau pastikan varian hover/filled memakai shade teal yang cukup pekat (`#0D9488` / `#08B8A4`) jika teksnya `#FFFFFF`.
3. **Konsistensi Permukaan Publik vs Dashboard:**
   - **Halaman Publik (Marketing, About, Blog, Catalog):** Latar dominan `#FFFFFF` diselingi `#F3FBFE` / `#F1FBFA` dan panel aksen gelap `#020626` + footer `#020C1B`.
   - **Halaman Aplikasi (Dashboard 4 Role, Login, Task Flow, Studio, Support):** Latar kanvas `#F5F6F8` dengan kartu putih `#FFFFFF`, border tipis `rgba(8, 13, 53, 0.08)`, dan shadow lembut.
4. **Jangan Campur Kode Warna Semantik:**
   - Selalu gunakan palet status pastel (`Blue`, `Mint`, `Purple`, `Orange`, `Amber`, `Red`) dari Bagian 5 secara konsisten di seluruh role (**Enterprise**, **Community**, **Internal**, **Expert**). Jangan membuat warna status baru yang menyimpang dari sistem 6 tone tersebut.
5. **Satu Sumber Token Saat Revamp:**
   - Saat melakukan revamp (misalnya mengonsolidasikan ke CSS variables modern atau Tailwind `@theme`), definisikan seluruh token warna dari dokumen ini di satu file terpusat agar tidak ada hardcode hex yang berulang di komponen TSX.
