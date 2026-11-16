# Zenvinus UI

Frontend workspace untuk platform kolaborasi data AI **Zenvinus** berbasis Next.js 16 (Pages Router), React 19, TypeScript 7, dan Tailwind CSS v4.

> **Catatan:** Repository ini difokuskan **khusus untuk pengembangan frontend UI/UX**. Seluruh koneksi ke backend/API live sudah dinonaktifkan dan menggunakan **data dummy lokal** (auth, blog & news, catalog datasets/models, tasks & workspaces, dataset studio, serta support tickets).

## Tech Stack

- **Framework:** Next.js 16.4 (Pages Router, Turbopack), React 19.3, TypeScript 7.0 (`strict`)
- **Package Manager:** Bun (`bun.lock`)
- **Styling & Icons:** Tailwind CSS 4 (`src/styles/tailwind.css`), `tailwind-merge`, `lucide-react`
- **UI & Visualisasi:** Komponen kontrol custom & chart SVG custom yang responsif dari mobile hingga desktop
- **State & Data:** Redux Toolkit 2 + TanStack Query 5 (terhubung ke data dummy in-memory / `sessionStorage`)
- **Linter:** Oxlint

## Menjalankan di Lokal

Pastikan **Node.js 20.9+** dan **Bun** sudah terpasang:

```bash
bun install
bun run dev      # http://localhost:3000
```

## Preview Auth, Role Dashboard & Studio

- **Bypass Login Lokal:** Buka `/login` lalu klik **Send Verification Code** (email boleh kosong) atau tombol **Google / GitHub** untuk langsung masuk ke `/dashboard` dengan sesi dummy lokal.
- **Role Switcher (`/dashboard`):** Tersedia switcher mengambang untuk berpindah tampilan antar 4 role:
  - **Enterprise** (`/dashboard`) — dashboard analitik, pengajuan proyek, order tracking, billing, team, dan settings
  - **Community** (`/dashboard?as=community`) — task marketplace, qualification, quality check, dan rewards
  - **Internal** (`/dashboard?as=internal` & `/lab`) — queue proyek masuk, proposal & quotation, serta manajemen tiket support
  - **Expert** (`/dashboard?as=expert`) — review queue dan keputusan kualitas submission
- **Workspace & Studio:**
  - **Dataset Studio** (`/studio`, `/dashboard/studio`) — explorer dataset, ringkasan kolom, dan editor split
  - **Annotation Studio** (`/task-studio`) — editor bounding box & poligon sentuh, klasifikasi gambar/teks, transkripsi audio, evaluasi LLM, dan validasi tabular
- **Personalisasi:** Mendukung switcher bahasa **ID / EN** dan pilihan tata letak navigasi **Top Navbar** atau **Sidebar** di `/dashboard/settings`.

## Scripts

| Script | Kegunaan |
| --- | --- |
| `bun run dev` | Menjalankan dev server (`next dev`) |
| `bun run build` | Production build (`next build`) |
| `bun run start` | Menjalankan hasil production build (`next start`) |
| `bun run typecheck` | Pengecekan TypeScript (`tsc --noEmit`) |
| `bun run lint` | Pengecekan linter dengan Oxlint |

## Dokumentasi

- [docs/frontend.md](docs/frontend.md): struktur folder, konvensi TypeScript, dan aturan fitur.
- [docs/ZENVINUS-workflows-v3.md](docs/ZENVINUS-workflows-v3.md): referensi alur produk antar role.
- [AGENTS.md](AGENTS.md): panduan konvensi halaman dan pengembangan kode.
