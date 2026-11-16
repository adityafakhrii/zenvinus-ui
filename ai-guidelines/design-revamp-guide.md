# Panduan Instruksi AI Agent — Total UI/UX Revamp Zenvinus UI

> **Status Dokumen:** Blueprint & Design Specification (Tahap Perencanaan — **JANGAN generate/ubah kode sebelum AI agent membaca dokumen ini dan `color-system.md` secara menyeluruh**).  
> **Cakupan:** Perombakan total UI/UX **seluruh halaman** di `zenvinus-ui` (45 route / seluruh view Public, Enterprise, Community, Internal, Expert, Dataset Studio, Task Studio, Lab, dan Support).

---

## 1. Referensi Wajib & Sumber Kebenaran

Sebelum menyentuh kode komponen atau stylesheet apa pun, AI agent **wajib** membaca dan mematuhi tiga rujukan utama berikut:

1. **Sistem Warna (Wajib Dipertahankan 100%):** [ai-guidelines/color-system.md](color-system.md)
   - Referensi desain visual (gaya **ACRU**) menggunakan palet hijau limau sebagai contoh tampilan. Saat mengimplementasikan ke Zenvinus, **seluruh warna hijau limau dari referensi HARUS diterjemahkan ke sistem warna Zenvinus** (`#020626` Deep Midnight Navy, `#05DAC3` Zenvinus Teal, `#0D9488` Accessible Teal, `#F5F6F8` App Canvas, `#FFFFFF` Card Surface, dan 6-tone semantic status).
2. **Metodologi Anti-AI-Slop (`unslop`):** [../.agents/unslop/skills/unslop/SKILL.md](../.agents/unslop/skills/unslop/SKILL.md) beserta [signs.md](../.agents/unslop/skills/unslop/references/signs.md) dan [tokens.md](../.agents/unslop/skills/unslop/references/tokens.md) *(unslop by Damir Sokolovsky, CC BY 4.0)*.
3. **Konvensi Codebase & Alur Produk:** [../docs/frontend.md](../docs/frontend.md), [../docs/ZENVINUS-workflows-v3.md](../docs/ZENVINUS-workflows-v3.md), dan [../AGENTS.md](../AGENTS.md).

---

## 2. Unslop Direction untuk Zenvinus UI

Sesuai metode `unslop`, setiap keputusan layout, tipografi, komponen, dan copy di seluruh website wajib berakar pada **5 baris Direction** berikut:

- **Product:** Platform kolaborasi data AI dan model Indonesia yang menghubungkan kebutuhan proyek Enterprise, kontributor Community, reviewer Expert, dan tim operasional Internal dalam satu alur kerja terverifikasi.
- **Character:** Presisi, tenang, terstruktur (*exact, calm, structured*). Dilarang memakai estetika template "startup AI generik" yang penuh glow, ungu-biru, atau kartu seragam.
- **World:** Ruang instrumen kurasi data dan lembar kerja analitik presisi — permukaan kertas putih bersih di atas kanvas abu-dingin lembut (`#F5F6F8`), tinta navy pekat (`#020626`), dan aksen instrumen teal (`#05DAC3` / `#0D9488`).
- **Moments:**
  1. **Grafik Utama & Panel Kualitas Dashboard:** Satu chart fokus per layar dengan seri historis netral, satu bar/seri aktif yang disorot Zenvinus Teal, dan tooltip melayang presisi.
  2. **Dataset Preview & Annotation Studio Canvas:** Tabel split bergaya explorer dan kanvas anotasi bounding-box/mask yang menjadi pusat warna fungsional.
- **Signature:** Hairline `1px` tipis (`rgba(8, 13, 53, 0.08)`), indikator aktif vertikal/horizontal `2px–3px` berwarna Zenvinus Teal/Navy, serta angka metrik rata-kanan dengan `tabular-nums`.

---

## 3. Bahasa Desain & Terjemahan Referensi Visual (ACRU Style → Zenvinus)

Mengacu pada layout dashboard referensi yang dilampirkan, terapkan bahasa visual berikut ke seluruh aplikasi:

### A. Prinsip Komposisi & Grid (Anti-Template)
- **Kanvas & Kartu:** Kanvas halaman menggunakan `#F5F6F8`, kartu dan panel menggunakan `#FFFFFF` dengan sudut `12px–16px`, border `1px solid rgba(8, 13, 53, 0.08)`, dan bayangan sangat halus (`0 1px 2px rgba(0, 0, 0, 0.04)`). **Tanpa** glassmorphism, **tanpa** glowing shadow berwarna, **tanpa** kartu dengan gradient warna-warni.
- **Ritme Grid Bervariasi (*Varied Widths*):** Hindari menaruh 4 kartu identik lalu 2 chart seukuran di bawahnya. Ikuti ritme referensi:
  - **Baris Utama (12 kolom):** Panel analitik besar (8 kolom: angka utama + chart utama dengan tooltip + 3 ringkasan metrik bertumpuk di sisi kanan dalam kartu yang sama) bersanding dengan Panel Aksi/Identitas (4 kolom: kartu objek akun/escrow, grid 5 Quick Actions berikon tipis, dan strip avatar tim/kontributor).
  - **Baris Menengah:** Kartu progress limit/kuota (kiri) bersanding dengan kartu insight/panduan kontekstual berhias grid kubus pastel teal-mint (kanan).
  - **Baris Bawah (3 kolom):** Kartu komposisi biaya/data (1 horizontal segmented block bar + legenda 2 kolom), Kartu Health/Quality Score (semi-circular segmented gauge + 1 kalimat ringkas), dan Kartu Tracker + Daftar Aktivitas/Riwayat terbaru berikon bulat `36px`.
- **Nested Radius Math:** Selalu patuhi rumus `innerRadius = outerRadius - padding` (minimal `4px`). Panel/window `16px–20px`, kartu `12px–16px`, input/tombol/row aktif `8px–10px`, tag/keycap `4px–6px`.

### B. Tipografi, Angka & Copywriting (Aturan Unslop)
- **Font:** Pertahankan font brand yang jelas dan terbaca (sans-serif bersih untuk UI seperti `Plus Jakarta Sans` / `Inter` / `DM Sans` + monospace `JetBrains Mono` / `ui-monospace` untuk ID proyek, token, keycap shortcut, dan angka tabular).
- **Bobot Teks (Weight):** Gunakan `400` (body), `500` (label/angka KPI/nav), dan `600` (judul kartu & penekanan). **Hindari** heading super tebal `800–900` dan **dilarang** `gradient text` atau `italic` untuk penekanan.
- **Sentence Case:** Semua label navigasi, header tabel, subjudul, dan badge ditulis dalam *Sentence case* (`Workspace`, `Paid this month`, `Review queue`), **bukan** `UPPERCASE` dengan *wide letter-spacing*.
- **Tabular Numbers:** Seluruh angka uang, persentase, durasi, jumlah baris, dan tanggal di tabel/KPI wajib memakai `font-variant-numeric: tabular-nums` dan format seragam.
- **Copywriting Bersih:**
  - Tidak ada sapaan emosional/emoji (`Welcome back! 👋` → gunakan judul konteks seperti `Enterprise Workspace` atau `Project Overview`).
  - Tidak ada tanda seru (`!`), kata hype (*supercharge, seamless, unlock, magic, AI-powered*), atau badge gimmick (`PRO ✨`, `New 🚀`, `Beta`).
  - Setiap delta persentase wajib menyebut pembandingnya (`+12.4% vs last month`, bukan `+12.4%` saja).
  - Placeholder singkat (`Search`, bukan `Search anything...`).

### C. Ikonografi
- Gunakan **satu set ikon garis (line icons)** secara konsisten di seluruh aplikasi (misalnya `lucide-react` berukuran `16px` atau `18px` dengan ketebalan `strokeWidth={1.5}` — atau ikon garis seragam jika tetap memakai subset Font Awesome).
- **Dilarang keras** menggunakan emoji sebagai ikon menu, badge, atau dekorasi teks di UI.
- Ikon mengambil warna peran teks (`#5A627D` / `#6B7280`, atau `#020626` saat aktif). Untuk indikator kategori berwarna, gunakan status dot kecil (`6px–8px`), bukan mewarnai seluruh ikon.

---

## 4. Sistem Navigasi Ganda (Top Navbar Default & Sidebar Opsional)

Salah satu persyaratan utama revamp adalah **fleksibilitas mode navigasi** pada area aplikasi (`/dashboard/*`, `/lab`, `/task-*`, `/studio/*`):

### A. Aturan Mode & Default State
- **Default Mode:** `topbar` (**Top Navbar**). Saat pengguna pertama kali membuka aplikasi, navigasi utama tampil sebagai Top Navbar.
- **Pilihan di Pengaturan (`/dashboard/settings`):**
  - Tambahkan bagian **Workspace Navigation** dengan komponen **Custom Radio Card** (dilengkapi pratinjau *mini wireframe* visual untuk masing-masing mode):
    1. **Top Navbar (Default)** — Bar atas tunggal sticky (`64px`) + bar Role Switcher sekunder yang ringkas.
    2. **Sidebar** — Sidebar kiri (`256px`, bisa di-collapse ke `72px`) ala referensi desain + utility header bar di kanan atas.
  - Simpan preferensi ke **Redux Toolkit** (`uiPreferences` / `layoutSlice`) dan persist di `localStorage` via `@/lib/storage` agar pilihan bertahan antar-reload dan langsung mengubah shell layout tanpa refresh halaman.

### B. Spesifikasi Mode 1: Top Navbar (Default)
- **Struktur Sticky Header (`height: 64px`, `#FFFFFF`, border-bottom `1px solid rgba(8, 13, 53, 0.08)`):**
  - **Kiri:** Logo Zenvinus (flat mark + wordmark, tanpa glow) + Menu horizontal sesuai role aktif (nav item tinggi `36px`, padding `0 12px`, radius `8px`; item aktif memakai surface `#F5F6F8` + teks `#020626` dengan indikator garis tipis `#05DAC3` di bawahnya).
  - **Kanan:** Global Quick Search trigger (dengan keycap `Ctrl K` / `/`), Language Switcher custom (`ID / EN`), Notification Bell popover (indikator dot teal/amber tenang tanpa animasi `ping`), Primary Role CTA (mis. `+ New Project` untuk Enterprise, `Find Tasks` untuk Community), dan Account Menu chip (avatar inisial/foto + nama + role aktif + dropdown).
- **Sub-bar Workspace Role Switcher (`44px`):** Terintegrasi rapi di bawah topbar (atau sebagai segmented switcher di bar utilitas) agar pengguna dapat berpindah role (`Enterprise`, `Community`, `Internal`, `Expert`) dengan jelas.

### C. Spesifikasi Mode 2: Sidebar (Mengikuti Referensi Desain)
- **Sidebar Panel (`width: 256px`, collapsed `72px`, `#FFFFFF`, border-right `1px solid rgba(8, 13, 53, 0.08)`):**
  - **Header Sidebar:** Logo Zenvinus + tombol collapse/pin di desktop.
  - **Grup Menu Utama:** Row tinggi `36px`, gap antar-row `4px`, ikon box `20px` sejajar vertikal, label satu baris. Mendukung **nested submenu** dengan garis vertikal konektor tipis `1px` di kiri dan pill counter monospaced tenang (seperti badge `19` pada referensi).
  - **Role Switcher di Sidebar:** Segmented selector atau dropdown workspace role tepat di bawah logo/search agar pengguna tahu role mana yang sedang aktif.
  - **Footer Sidebar:** Link bantuan (`Support`, `Settings`), opsional 1 kartu info status workspace yang tenang (tanpa gradient norak), dan tombol `Collapse sidebar` (`<<`).
- **Top Utility Header di Area Konten (`64px`, `#FFFFFF` / transparan di atas `#F5F6F8`):**
  - **Kiri:** Global Quick Search input (`Search`, trigger modal command palette).
  - **Kanan:** Notification Bell popover, Settings icon shortcut (`/dashboard/settings`), Account Chip (avatar + nama + email), dan Primary Role CTA.

---

## 5. Sistem Custom Component (Dilarang Style Bawaan Browser)

AI agent **wajib membangun atau menstandarkan seluruh komponen input dan overlay secara custom** di `src/components/ui/` sehingga tidak ada satu pun elemen di seluruh 45 halaman yang tampil dengan gaya OS/browser bawaan (`<select>` native, kalender OS `<input type="date">`, `window.confirm`, radio/checkbox bawaan browser, atau scrollbar/tooltip kasar).

Berikut daftar komponen custom wajib dan penggantian yang harus dilakukan:

| Komponen Custom Wajib | Menggantikan Native / Lama | Spesifikasi Visual & Perilaku |
| :--- | :--- | :--- |
| **`CustomSelect` & `MultiSelect`** | Semua `<select>` di `new-project.tsx` (17 buah), `assets-area.tsx`, `tasks-area.tsx`, `company-settings.tsx`, `contact-form.tsx`, `studio-editor.tsx`, `request-form.tsx`, `studio-topbar.tsx` | Trigger seperti `.edash-input` (`height: 42px`, radius `10px`, chevron ikon garis `16px` yang berotasi halus). Menu dropdown portal/floating (`#FFFFFF`, border `1px solid rgba(8, 13, 53, 0.1)`, shadow `0 8px 24px rgba(2, 6, 38, 0.08)`, radius `12px`, animasi masuk `180ms cubic-bezier(0.22, 1, 0.36, 1)`). Item terpilih ditandai background `#F1FBFA` dan centang `#0D9488`. Mendukung pencarian opsional untuk list panjang, navigasi keyboard (`ArrowUp/Down`, `Enter`, `Escape`), dan click-outside. |
| **`CustomDatePicker` & `CustomDateTimePicker`** | `<input type="date">` di `lab-page.tsx` dan `new-project.tsx` (serta input tanggal di filter/billing/task deadline) | Trigger button bergaya input dengan ikon kalender garis + format tanggal lokal (`tabular-nums`). Popover kalender custom dengan header bulan/tahun (navigasi panah + quick month/year selector), grid tanggal `7 kolom`, hari ini bertanda border `#0D9488`, tanggal terpilih solid `#020626` teks `#FFFFFF` (atau `#05DAC3` dengan teks `#020626`), rentang hover `#F1FBFA`. Untuk mode `DateTime`, sertakan pemilih jam/menit custom (listbox atau stepper presisi) di sisi kanan/bawah grid. **Dilarang `type="date"` / `type="datetime-local"` tampil ke pengguna.** |
| **`CustomRadioGroup` & `CustomRadioCard`** | Native `type="radio"` di kuis kualifikasi (`task-qualification-area.tsx`), wizard proyek, dan pilihan Navigation Mode di Settings | `input` tersembunyi secara aksesibel (`sr-only`), dirender sebagai lingkaran `18px` berborder `1.5px` (`#D1D5DB`) dengan dot dalam `#0D9488` / `#020626` saat terpilih, atau varian **Radio Card** (kartu interaktif berborder `#0D9488` + background `#F1FBFA` saat terpilih). Mendukung navigasi panah keyboard dan `role="radiogroup"`. |
| **`CustomCheckbox` & `CustomSwitch`** | Native `type="checkbox"` di `assets-area.tsx`, `tasks-area.tsx`, `company-settings.tsx`, `task-join-area.tsx`, `footer.tsx` | Kotak `18px × 18px` radius `5px`, border `#D1D5DB`, fill `#020626` (atau `#0D9488`) dengan ikon centang putih tajam saat checked, focus ring `3px rgba(13, 148, 136, 0.15)`. Untuk pengaturan biner (notifikasi, 2FA), gunakan **`CustomSwitch`** pill `40px × 22px` (off `#E5E7EB`, on `#0D9488`). |
| **`Modal` / `Dialog` & `ConfirmDialog`** | `window.alert`, `window.confirm`, modal Bootstrap JS, popup inline | Portal terpusat dengan backdrop `rgba(2, 6, 38, 0.45)`, panel `#FFFFFF` radius `16px`, border `1px solid rgba(8, 13, 53, 0.08)`, header/body/footer terstruktur, focus trap, tombol close `×`, dan konfirmasi aksi berbahaya dengan tombol merah `#DC2626`. Di layar mobile `< 640px`, otomatis berubah menjadi **Bottom Sheet** dengan handle bar atas. |
| **`Drawer` / `Sheet`** | Offcanvas mobile menu & panel detail order/ticket | Slide-in panel halus (`280ms cubic-bezier(0.22, 1, 0.36, 1)`) untuk navigasi mobile, filter catalog/task di mobile, dan inspector detail proyek. |
| **`Popover` & `Tooltip`** | Native `title` attributes pada kontrol penting & tooltip chart | Floating card tipis (`#020626` teks `#FFFFFF` untuk tooltip ringkas; `#FFFFFF` border hairline + shadow untuk popover interaktif dan hover chart). |
| **`TextInput`, `Textarea`, `SearchInput`, `FileDropzone`** | Input HTML mentah & `<input type="file">` standar di `studio-editor.tsx` & `company-settings.tsx` | Tinggi seragam (`42px` default, `36px` compact), border `1px solid #D5DBE2`, hover `#9CA3AF`, focus border `#0D9488` + ring `rgba(13, 148, 136, 0.15)`. `FileDropzone` menyembunyikan `<input type="file">` native dan menampilkan zona drag-and-drop rapi dengan preview nama/ukuran file. |
| **`Tabs` / `SegmentedControl` & `Toast`** | Tab campuran & inline state alerts | `SegmentedControl` ala referensi (`7d`, `30d`, view switcher `Rows / Stats`, tab `Card / Viewer / Files`) dengan pill aktif `#FFFFFF` ber-shadow lembut di atas track `#F1F1F1` / `#F5F6F8`. `Toast` melayang di pojok kanan bawah tanpa menggeser layout. |

---

## 6. Strategi Responsive Multi-Layar

Semua 45 halaman wajib diuji dan didesain untuk 5 breakpoint utama:

| Breakpoint | Rentang Lebar | Perilaku Layout & Navigasi |
| :--- | :--- | :--- |
| **Mobile** | `< 640px` | Topbar compact (`56px`, logo + quick search icon + notification + avatar + burger). Baik mode Top Navbar maupun Sidebar otomatis membuka **Mobile Slide Drawer**. Bento grid turun ke 1 kolom; filter sidebar catalog/tasks berubah menjadi tombol **"Filters"** yang membuka **Bottom Sheet / Drawer**; tabel berubah menjadi card list atau scroll horizontal berindikator; modal menjadi Bottom Sheet; minimal tap target `44px`. |
| **Tablet Portrait** | `640px – 1023px` | Grid 2 kolom untuk KPI & kartu; Topbar/Sidebar tetap kolaps ke drawer agar area konten lega; chart utama full width di atas sub-panel. |
| **Compact Desktop / Laptop** | `1024px – 1279px` | Jika mode `Sidebar`, default bisa auto-collapse ke `72px` (icon rail + tooltip) atau tetap `240px` dengan konten fluid; jika mode `Top Navbar`, menu tampil ringkas dengan overflow dropdown bila perlu. |
| **Desktop Standard** | `1280px – 1599px` | Layout penuh ala referensi: Sidebar `256px` atau Topbar `64px` + container konten maksimal `1440px` dengan padding `24px–32px`. |
| **Ultrawide** | `≥ 1600px` | Kontainer konten terpusat maksimal `1520px–1600px` (`margin: 0 auto`) sehingga panjang baris teks dan lebar kartu tetap ergonomis dan tidak melar ekstrem. |

---

## 7. Urutan Eksekusi 9-Pass Unslop (Wajib Diikuti AI Agent)

Saat merombak setiap halaman/komponen, terapkan 9 pass `unslop` secara berurutan:
1. **Spacing:** Standarkan semua margin, padding, gap, dan tinggi ke kelipatan `4px` (`4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 96`). Samakan padding antar-kartu sejenis.
2. **Color:** Terapkan `ai-guidelines/color-system.md`. Hapus gradient hue-to-hue, glow, colored shadow, serta `$theme-primary: #3D6CE7` lama. Pastikan `#0D9488` dipakai untuk teks teal di atas terang.
3. **Icons:** Migrasi emoji/ikon campuran ke 1 set ikon garis (`16px`/`18px`, stroke `1.5`), lebar kotak ikon seragam agar teks sejajar.
4. **Copy:** Bersihkan sapaan greeting, tanda seru, huruf kapital berlebih, dan klaim hype. Gunakan Sentence case dan format angka konsisten.
5. **Type:** Terapkan skala ukuran terstruktur, bobot maksimal `600`, `tabular-nums` pada angka, nol negative tracking pada teks kecil.
6. **Layout:** Terapkan komposisi asimetris/Bento seperti referensi di dashboard, serta scene/asymmetric split pada landing hero tanpa blok kosong mati.
7. **Details:** Terapkan nested radius, status badges 6-tone pastel, hierarchy 1 chart utama per layar, dan hilangkan sparkline hiasan di stat card kecil.
8. **Visuals:** Hapus blob/orb/dekorasi abstrak yang tidak bermakna; ganti dengan preview produk nyata atau komponen materiil yang rapi (seperti kartu akun/escrow, chart interaktif, preview dataset).
9. **Motion:** Hapus `wowjs` scroll-bounce lama, `animate-pulse`, dan `transition-all`. Gunakan satu easing `cubic-bezier(0.22, 1, 0.36, 1)` (`120–180ms` hover, `160–220ms` menu/popover, `240–320ms` drawer/modal) hanya pada `color`, `background-color`, `border-color`, `opacity`, dan `transform`.

---

## 8. Peta Perombakan Total Seluruh Halaman (45 Route)

**Seluruh halaman yang dianalisis pada repo ini WAJIB dirombak** menggunakan design system baru (tanpa meninggalkan halaman lama yang masih memakai styling Bootstrap/Technix template mentah):

### Grup A — Halaman Publik, Marketing, Katalog & Auth (16 Halaman)
*Chrome: Public Top Navbar (`64px` sticky, quiet nav: Logo, `Company`, `Community` dropdown, `Media` dropdown, `Contact`, `ID/EN`, `Sign in` text link + 1 primary CTA `Get Started`) & Dark Footer (`#020C1B`) yang dirapikan — **tanpa** breadcrumb banner template lama sesuai aturan [AGENTS.md](../AGENTS.md).*

1. **`/` ([index.tsx](../src/pages/index.tsx)) — Home / Landing Page:**
   - Ganti hero template lama dengan komposisi hero *scene / asymmetric split* yang kuat: headline tajam spesifik Zenvinus di sisi kiri + 1 primary & 1 secondary CTA, dan pratinjau produk interaktif / visual dunia data AI Indonesia di sisi kanan/bawah.
   - Rombak seluruh section (*Engines / Services*, *Community vs Enterprise Pipeline*, *Featured Datasets & Tasks*, *Numbers/Trust*, *CTA*) agar bersih dari blob dekoratif dan `wowjs`.
2. **`/about` ([about.tsx](../src/pages/about.tsx)) — Company / About:** Pertahankan struktur 5 section yang sudah rapi (`Intro + 4-layer flow`, `Problem & Pillars`, `Dark Numbers Panel #020626`, `Timeline`, `CTA Card`), selaraskan token tipografi, ikon garis seragam, dan spacing `4px` grid.
3. **`/contact` ([contact.tsx](../src/pages/contact.tsx)) — Contact:** Asymmetric split (info kontak & SLA respons di kiri + form dengan **CustomSelect topik** & **Custom Inputs** di kanan).
4. **`/service` ([service.tsx](../src/pages/service.tsx)) & `/service-details` ([service-details.tsx](../src/pages/service-details.tsx)):** Rombak total dari template Technix lama menjadi halaman layanan data/model/inference yang selaras dengan bahasa desain baru.
5. **`/blog` ([blog.tsx](../src/pages/blog.tsx)) & `/news` ([news.tsx](../src/pages/news.tsx)):** Header editorial bersih, toolbar filter kategori (**Custom pill tabs**) + **Custom SearchInput** + jumlah hasil `tabular-nums`, dan grid kartu artikel 3 kolom dengan proporsi gambar `16:10`.
6. **`/blog-details` ([blog-details.tsx](../src/pages/blog-details.tsx)) & `/news-details` ([news-details.tsx](../src/pages/news-details.tsx)):** Kolom bacaan tunggal terpusat (`680px–720px`), metadata rapi, block code `#0B1220`, author card `#F1FBFA`, tombol share custom, dan section "More articles".
7. **`/datasets` ([datasets.tsx](../src/pages/datasets.tsx)) & `/models` ([models.tsx](../src/pages/models.tsx)):** Katalog bergaya marketplace modern: panel filter kiri (desktop) / Drawer filter (mobile) memakai **CustomCheckbox** & **CustomSelect sort**, kartu list/grid bersih menampilkan tipe data dot, download count `tabular-nums`, quality badge, dan lisensi.
8. **`/dataset-details` ([dataset-details.tsx](../src/pages/dataset-details.tsx)) & `/model-details` ([model-details.tsx](../src/pages/model-details.tsx)):** Hero header ala Hugging Face yang disederhanakan (ikon Zenvinus `#F3FBFE`, pemilik/slug, tombol `Open in Studio` & `Download`), **Custom Segmented Tabs** (`Card`, `Dataset Viewer`, `Files`), metadata sidebar kanan, serta blok BibTeX `#0B1220` dengan tombol copy ber-toast.
9. **`/tasks` ([tasks.tsx](../src/pages/tasks.tsx)) — Public Task Marketplace:** Filter kategori/difficulty/status dengan **CustomCheckbox & CustomSelect**, daftar task ber-badge 6-tone (reward Rp, slot kontributor, deadline `tabular-nums`).
10. **`/login` ([login.tsx](../src/pages/login.tsx)) — Auth / Sign In:** Kartu tunggal tenang di atas kanvas `#F5F6F8` (atau split tenang dengan ringkasan platform), tombol Google & GitHub berikon bersih, **Custom TextInput** email, dan **Custom 6-digit OTP Input** yang presisi (tanpa copy hype).
11. **`/404` ([404.tsx](../src/pages/404.tsx)) — Not Found:** Empty state bersih dengan ilustrasi/typographic numeral tenang dan 1 CTA kembali ke Home / Dashboard.

### Grup B — Main Dashboard Shell & 4 Role Views (`/dashboard`)
*Chrome: Mengikuti pilihan user di Settings (`Top Navbar` default atau `Sidebar` ala referensi), dengan Bento Grid asimetris sebagai standar visual utama:*

12. **`/dashboard` (Default: Enterprise Dashboard):**
    - **Baris Atas:** Panel utama 8 col (**Annotation / Data Delivery Volume** chart interaktif dengan selector `7d/30d` custom, tooltip melayang seperti referensi, + 3 metrik ringkasan bertumpuk: *Active Spend*, *Items Delivered*, *Pending Review*) + Panel 4 col (**Account & Plan Card** berdesain kartu fisik/objek, **Quick Actions** 5 tombol: `New Project`, `Pay Invoice`, `Team`, `Billing`, `Support`, dan strip avatar tim/CSM).
    - **Baris Tengah:** Kartu **Monthly Quota / Budget Limit** (progress bar teal) + Kartu **Quick Guidance** (tautan ke Proposal/QC workflow).
    - **Baris Bawah:** Kartu **Spend Breakdown** (segmented bar + legenda 2 kolom), Kartu **Delivery Quality Health** (semi-circular gauge persentase acceptance), dan Kartu **Recent Projects & Activity** (daftar ringkas berikon + status pastel 6-tone + filter dropdown).
13. **`/dashboard?as=community` — Community Dashboard:**
    - **Baris Atas:** Chart **Weekly Earnings** (dengan bar aktif teal + tooltip) + 3 metrik (*Paid to Date*, *Pending Ledger*, *Accuracy Score*) bersanding dengan **Next Payout Card** (kartu objek payout bank/e-wallet + jadwal + tombol cepat `Find Tasks`, `Studio`, `Rewards`, `Qualifications`, `Support`).
    - **Baris Tengah & Bawah:** Target pencapaian mingguan, breakdown task by type, semi-circular **Approval Rate Gauge**, dan daftar **Active Tasks & Payout History**.
14. **`/dashboard?as=internal` — Internal Operations Dashboard:**
    - **Baris Atas:** Chart **Throughput & Revenue MTD** + 3 metrik (*Proposal Queue*, *Active Projects*, *Active Workforce*) bersanding dengan **Operations Quick Card** (`AI Lab`, `Studio`, `Projects`, `Support All`, `Workforce`).
    - **Baris Bawah:** Pipeline distribusi proyek (segmented bar per status enterprise), **SLA Health Gauge**, dan **Proposal & Escalation Queue Table** dengan tombol aksi langsung.
15. **`/dashboard?as=expert` — Expert Reviewer Dashboard:**
    - **Baris Atas:** Chart **Daily Reviews Completed** + 3 metrik (*Assigned Reviews*, *Awaiting Action*, *Expert Earnings*) bersanding dengan **Reviewer Calibration Card** (Agreement Score gauge + Quick Actions ke `Review Queue`, `Quality Rubric`, `Task Studio`, `Support`).
    - **Baris Bawah:** **Interactive Review Queue Table** dengan expandable row inspector, status chip 6-tone, dan tombol keputusan (**Approve**, **Request Revision**, **Reject**, **Escalate**) memakai **Custom Modal / Popover**.

### Grup C — Enterprise & Company Management (6 Halaman + 1 Redirect)
16. **`/dashboard/projects` ([projects.tsx](../src/pages/dashboard/projects.tsx)) & `/dashboard/orders` (redirect stub):** Tabel/daftar proyek dengan filter status custom, progress pipeline visual (`REQUESTED → DELIVERED`), dan panel/drawer detail order tanpa modal browser.
17. **`/dashboard/new-project` ([new-project.tsx](../src/pages/dashboard/new-project.tsx)) — Project Request Wizard:** Stepper horizontal bersih; ganti **semua 17 `<select>`** menjadi **`CustomSelect`**, ganti **`<input type="date">`** menjadi **`CustomDatePicker`**, dan gunakan **`CustomRadioCard`** untuk memilih deliverable (`Dataset`, `Model`, `Hosted Inference`).
18. **`/dashboard/pay` ([pay.tsx](../src/pages/dashboard/pay.tsx)) — Payment Gateway:** Split layout: ringkasan invoice & milestone (`DP` / `Final Payment`) di kiri + metode pembayaran (**CustomRadioCard** VA/QRIS/Transfer/Card) di kanan.
19. **`/dashboard/billing` ([billing.tsx](../src/pages/dashboard/billing.tsx)) — Billing:** Kartu ringkasan budget, kartu metode pembayaran berdesain objek kartu (seperti *My card* pada referensi), dan tabel riwayat invoice dengan tombol unduh.
20. **`/dashboard/team` ([team.tsx](../src/pages/dashboard/team.tsx)) — Team Management:** Seat usage progress bar, tabel anggota tim dengan **CustomSelect** role, dan **Custom Modal** invite member.
21. **`/dashboard/settings` ([settings.tsx](../src/pages/dashboard/settings.tsx)) — Workspace & Navigation Settings:**
    - **Bagian Baru Wajib:** **Appearance & Navigation Layout** dengan **CustomRadioCard** bergambar wireframe mini untuk memilih **`Top Navbar (Default)`** atau **`Sidebar`**, plus toggle compact/expanded sidebar.
    - **Bagian Profil, Notifikasi & Keamanan:** Ganti semua `<select>` ke **`CustomSelect`**, checkbox notifikasi & 2FA ke **`CustomSwitch`**, dan upload logo ke **`FileDropzone`**.

### Grup D — Community & Expert Task Flow (8 Halaman Aktif + 1 Redirect)
22. **`/dashboard/tasks` ([dashboard/tasks.tsx](../src/pages/dashboard/tasks.tsx)):** Wrapper task marketplace di dalam shell dashboard (Topbar/Sidebar).
23. **`/task-details` ([task-details.tsx](../src/pages/task-details.tsx)):** Hero task ringkas (badge tipe workspace, slot, deadline, reward/item), panduan markdown rapi, dan CTA `Join Task` / `Continue`.
24. **`/task-join` ([task-join.tsx](../src/pages/task-join.tsx)):** Stepper alur kontributor (`Join → Qualification → Studio → Quality → Completed → Reward`) + NDA/guidelines checklist dengan **`CustomCheckbox`**.
25. **`/task-qualification` ([task-qualification.tsx](../src/pages/task-qualification.tsx)):** Kuis kualifikasi memakai **`CustomRadioCard`** per pilihan jawaban, progress pertanyaan, dan kartu hasil pass/retry yang bersih.
26. **`/task-studio` ([task-studio.tsx](../src/pages/task-studio.tsx)) & `/task-workspace` (redirect stub):**
    - Full-height workspace fokus (`100dvh` / fluid split): Topbar ringkas (back link, task title, item counter `1 / 12`, **CustomSelect** dev workspace switcher bila perlu, tombol `Save Draft` & `Submit`).
    - Rombak seluruh **6 Workspace Editor** (`object_annotation`, `image_classification`, `text_classification`, `audio_transcription`, `llm_evaluation`, `tabular_validation`) agar panel kontrol, palette class, slider rating, dan chip validasi memakai komponen custom selaras.
27. **`/task-quality-check` ([task-quality-check.tsx](../src/pages/task-quality-check.tsx)):** Ringkasan skor kualitas (gauge bersih), rincian item lulus/perlu revisi, dan tombol tindak lanjut.
28. **`/task-completed` ([task-completed.tsx](../src/pages/task-completed.tsx)):** Halaman konfirmasi penyelesaian bersih (tanpa animasi konfeti/pulsing slop) dengan ringkasan item & estimasi reward.
29. **`/task-reward` ([task-reward.tsx](../src/pages/task-reward.tsx)):** Kartu saldo reward, status ledger (`PENDING` / `PAID`), dan tabel riwayat pencairan.

### Grup E — Shared Catalog, Dataset Studio, Internal Lab & Support (10 Halaman / Route)
30. **`/dashboard/datasets`, `/dashboard/dataset-details`, `/dashboard/model-details`:** Memakai komponen catalog yang sama dengan Grup A namun di dalam shell Dashboard (`Top Navbar` / `Sidebar`).
31. **`/dashboard/studio` & `/studio` ([studio/index.tsx](../src/pages/dashboard/studio/index.tsx)):** Daftar dataset studio dengan status pill (`Published` mint, `Draft` amber), jumlah split/row `tabular-nums`, dan CTA `+ New Dataset`.
32. **`/dashboard/studio/explore` & `/studio/explore` ([studio/explore.tsx](../src/pages/dashboard/studio/explore.tsx)):** Toolbar split selector (**CustomSelect**), **SegmentedControl** (`Rows` vs `Column Stats`), **SearchInput**, tabel data dengan thumbnail gambar rapi, dan kartu distribusi statistik kolom ber-progress bar teal.
33. **`/dashboard/studio/edit` & `/studio/edit` ([studio/edit.tsx](../src/pages/dashboard/studio/edit.tsx)):** Form metadata (`CustomSelect` untuk dataType, license, status), markdown card editor, dan **`FileDropzone`** import CSV.
34. **`/lab` ([lab.tsx](../src/pages/lab.tsx)) — AI Research Lab (Internal):** Terintegrasi ke shell dashboard internal; proposal queue table, form quotation/timeline memakai **`CustomDatePicker`** (ganti `<input type="date">`), **`CustomSelect`**, dan status stepper.
35. **`/dashboard/support` ([support/index.tsx](../src/pages/dashboard/support/index.tsx)):** Kartu daftar tiket (filter scope `Mine / Everyone` & status pill dengan `SegmentedControl`), **SearchInput** FAQ, accordion FAQ bergaris tipis, dan form kirim tiket memakai **`CustomSelect`**.
36. **`/dashboard/support/ticket` ([support/ticket.tsx](../src/pages/dashboard/support/ticket.tsx)):** Layout 2 kolom (8 col thread percakapan bergaya chat bubble `#F3F5F8` vs staff `#F1FBFA` + reply box; 4 col metadata info tiket & tombol Close/Reopen dengan **`ConfirmDialog`** custom).

---

## 9. Urutan Implementasi Revamp yang Direkomendasikan

Saat mulai mengeksekusi revamp di kode nanti, jalankan dalam fase berikut agar aplikasi tetap jalan dan terverifikasi (`bun run typecheck` + `bun run lint` + `bun run next build --webpack`) di setiap fase:

1. **Fase 1 — Design Foundation & Custom UI Kit (`src/styles/` & `src/components/ui/`):**
   - Definisikan CSS tokens lengkap (warna dari `color-system.md`, spacing 4px scale, radius, motion curve, font scale).
   - Bangun seluruh custom primitives (`CustomSelect`, `CustomDatePicker`, `CustomRadioGroup`/`Card`, `CustomCheckbox`/`Switch`, `Modal`/`ConfirmDialog`, `Drawer`, `Popover`/`Tooltip`, `SegmentedControl`, `FileDropzone`, `Toast`).
   - Hapus ketergantungan animasi `wowjs` dan kurangi CSS template Bootstrap yang bertabrakan.
2. **Fase 2 — Dual-Mode App Shell (`Top Navbar` Default + `Sidebar` Switchable):**
   - Tambah Redux slice preferensi layout navigasi (`navMode: 'topbar' | 'sidebar'`, default `'topbar'`, persisted di `localStorage`).
   - Bangun `DashboardShell` yang mendukung kedua mode + Mobile Drawer responsif + Global Quick Search.
   - Integrasikan pemilih mode navigasi di `/dashboard/settings`.
3. **Fase 3 — Revamp 4 Role Dashboards (`/dashboard`):**
   - Terapkan Bento Grid asimetris ala referensi untuk Enterprise, Community, Internal, dan Expert.
4. **Fase 4 — Revamp Public Site, Catalog, Blog/News & Login:**
   - Rombak `/`, `/about`, `/contact`, `/service*`, `/blog*`, `/news*`, `/datasets*`, `/models*`, `/login`, `/404`.
5. **Fase 5 — Revamp Task Flow, Annotation Studio, Dataset Studio, Projects, Lab & Support:**
   - Pastikan seluruh `<select>`, `<input type="date">`, checkbox, radio, dan dialog di semua wizard & workspace telah diganti 100% ke komponen custom.
6. **Fase 6 — Audit Akhir `unslop` & Responsive QA:**
   - Periksa seluruh checklist 20 poin di `SKILL.md` pada viewport `375px`, `768px`, `1280px`, dan `1440px`.
