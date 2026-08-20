# ARTO Mobile 📱

Aplikasi mobile ARTO — personal financial tracker — dibangun dengan **Expo SDK 54** (React Native + TypeScript + React Navigation).

Ini adalah **mobile companion** dari backend NestJS dan web app React (`arto-web`). Struktur kode sengaja mengikuti pola `arto-web` agar mudah dipelihara lintas platform.

## Fitur

- 🔐 Autentikasi (login, register, logout, ganti password, sesi otomatis + refresh token)
- 🏠 Dashboard: saldo total, **batas pengeluaran harian**, tren 14 hari, ringkasan budget, transaksi terakhir
- 🧾 Transaksi: pencatatan cepat (FAB), daftar + cari + filter jenis, ubah, hapus
- 🎯 Budget per kategori per periode + **dynamic daily spending limit**
- 💰 Financial goals dengan estimasi target tabungan harian
- 📊 Analisis: ringkasan, tren harian, pengeluaran per kategori (donut chart)
- 🩺 Skor & faktor kesehatan finansial
- 👛 Akun (tunai/bank/e-wallet), pengaturan tema (light/dark/system)
- 🌓 Dark mode penuh mengikuti sistem

## Tech Stack

| Bagian      | Teknologi |
|-------------|-----------|
| Framework   | Expo SDK 54 (React Native 0.81) |
| Bahasa      | TypeScript (strict) |
| Navigasi    | React Navigation 7 (native-stack + bottom-tabs) |
| State HTTP  | Vanilla `fetch` + `expo-secure-store` (token) |
| Storage     | `expo-secure-store` (token), `@react-native-async-storage/async-storage` (tema) |
| Grafik      | `react-native-svg` (donut) + layout murni (bar chart ringan) |
| Test        | Vitest (domain logic murni) |
| Lint        | oxlint |

## Menjalankan Aplikasi

### 1. Prasyarat

- Backend ARTO berjalan (lihat `arto-backend`), default `http://localhost:3000`
- Node.js ≥ 20.19
- Expo Go di perangkat fisik / Android emulator / iOS simulator

### 2. Instalasi

```bash
npm install
```

### 3. Konfigurasi API URL

Salin `.env.example` menjadi `.env` lalu sesuaikan:

```env
# Android emulator:
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# Perangkat fisik (IP LAN mesin, bukan localhost):
EXPO_PUBLIC_API_URL=http://192.168.1.5:3000/api

# Web/desktop:
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

> ⚠️ Pastikan perangkat dan mesin berada di jaringan yang sama. Untuk perangkat fisik,
> gunakan IP LAN mesin (cek dengan `ipconfig` di Windows / `ifconfig` di macOS-Linux).

### 4. Jalankan

```bash
npm start        # lalu scan QR dengan Expo Go, atau tekan 'a' (Android) / 'i' (iOS)
```

### 5. Akun demo

Isi dari seed backend: `demo@arto.id` / `demopass123`

## Struktur Proyek

```
arto-mobile/
├── App.tsx                     # Entry: providers + navigasi
├── app.json                    # Konfigurasi Expo
└── src/
    ├── api/                    # HTTP client + modul per resource (mirror arto-web)
    ├── components/
    │   ├── accounts/           # kartu & form akun
    │   ├── budgets/            # kartu budget, form, daily limit card
    │   ├── charts/             # donut + bar chart ringan
    │   ├── dashboard/          # stat card
    │   ├── goals/              # kartu & form goal
    │   ├── transactions/       # baris & form transaksi
    │   └── ui/                 # Button, Input, Select, Badge, dsb.
    ├── context/                # AuthContext, ThemeContext
    ├── domain/                 # logika murni: budget, dailyLimit, goals (+ unit test)
    ├── hooks/                  # useAsync
    ├── lib/                    # currency, date, errorMessage (pure, bisa diuji)
    ├── navigation/             # types & RootNavigator (tabs + stack modal)
    ├── screens/                # layar per fitur (auth/, dashboard, dll.)
    ├── theme/                  # design tokens (mirror DESIGN-SYSTEM.md)
    └── types/                  # kontrak tipe (mirror arto-web)
```

## Skrip

| Command              | Fungsi                        |
|----------------------|-------------------------------|
| `npm start`          | Jalankan Expo dev server      |
| `npm run android`    | Buka di emulator Android      |
| `npm run ios`        | Buka di simulator iOS (macOS) |
| `npm run web`        | Jalankan versi web            |
| `npm run typecheck`  | Cek tipe TypeScript           |
| `npm run lint`       | Lint dengan oxlint            |
| `npm test`           | Jalankan unit test (Vitest)   |

## Catatan Keputusan Teknis

1. **Tanpa custom font (Plus Jakarta Sans)** — memakai system font demi keandalan
   (tidak ada satu titik gagal pemuatan font) dan ukuran bundle lebih kecil untuk
   perangkat entry-level. Hierarchy tetap dibentuk dengan `fontWeight`.
2. **Token di SecureStore** — `accessToken` & `refreshToken` disimpan terenkripsi;
   refresh-on-401 otomatis satu kali per request.
3. **Bar chart murni View/SVG ringan** — bukan library chart berat, demi performa
   perangkat entry-level.
4. **Timezone** — konversi tanggal memakai timezone lokal perangkat, hasil konsisten
   di semua platform (tanpa ketergantungan `Intl` untuk format Rupiah/Indonesia).

## Keamanan

- Tidak ada secret/API key di kode; semua melalui env `EXPO_PUBLIC_*`.
- Data finansial hanya diambil sesuai kebutuhan layar (pagination untuk daftar transaksi).
- Logout membersihkan token lokal dan memanggil *server-side logout*.