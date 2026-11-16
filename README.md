# Zenvinus UI

Frontend workspace untuk **eksplorasi dan revamp UI/UX** platform Zenvinus (Next.js 16 Pages Router, React 19, TypeScript 7).

> **Catatan:** Repository ini difokuskan **khusus untuk pengembangan UI/UX**. Seluruh koneksi ke backend/API live sudah dinonaktifkan dan diganti dengan **data dummy lokal** (auth, blog & news, catalog datasets/models, tasks & workspaces, dataset studio, serta support tickets).

## Tech Stack

- **Framework:** Next.js 16.4 (Pages Router), React 19.3, TypeScript 7 (strict)
- **Package Manager:** Bun (`bun.lock`)
- **State & Data:** Redux Toolkit 2 + TanStack Query 5 (terhubung ke data dummy in-memory / `sessionStorage`)
- **Styling:** Bootstrap 5 + Sass (`public/assets/scss`, `src/styles/index.scss`)
- **Linter:** Oxlint

## Menjalankan di Lokal

Pastikan **Node.js 20.9+** dan **Bun** sudah terpasang:

```bash
bun install
bun run next dev --webpack   # http://localhost:3000 (direkomendasikan di Windows)
# atau di macOS / Linux:
bun run dev                  # http://localhost:3000
```

> Di Windows, gunakan `--webpack` agar kompilasi SCSS Bootstrap berjalan lancar tanpa terkendala bug path resolution Turbopack.

## Preview Auth & Role Dashboard

- **Bypass Login Lokal:** Buka `/login` lalu langsung klik **Send Verification Code** (email boleh kosong) atau klik tombol **Google / GitHub** untuk langsung masuk ke `/dashboard` dengan sesi dummy lokal.
- **Role Switcher:** Di `/dashboard`, kamu bisa berpindah tampilan antar 4 role:
  - **Enterprise** (`/dashboard`) — pengajuan proyek, order, billing, team, settings
  - **Community** (`/dashboard?as=community`) — task marketplace, qualification, annotation studio, rewards
  - **Internal** (`/dashboard?as=internal` & `/lab`) — review queue, proposal/quotation, manajemen tiket support
  - **Expert** (`/dashboard?as=expert`) — review queue & quality verdict

## Scripts

| Script | Kegunaan |
| --- | --- |
| `bun run dev` | Menjalankan dev server (Turbopack) |
| `bun run next dev --webpack` | Menjalankan dev server dengan Webpack (stabil di Windows) |
| `bun run next build --webpack` | Production build dengan Webpack |
| `bun run typecheck` | Pengecekan TypeScript (`tsc --noEmit`) |
| `bun run lint` | Pengecekan linter dengan Oxlint |

## Dokumentasi

- [docs/frontend.md](docs/frontend.md): struktur folder, konvensi TypeScript, dan aturan fitur.
- [docs/ZENVINUS-workflows-v3.md](docs/ZENVINUS-workflows-v3.md): referensi alur produk antar role.
- [AGENTS.md](AGENTS.md): panduan konvensi halaman dan kode.
