# Security Policy - arto-mobile

**Cakupan:** Mobile app (Expo + React Native)

## Melaporkan kerentanan

Jangan membuka issue publik untuk laporan kerentanan.

Gunakan GitHub **Security Advisories** pada repo ini
(*Security -> Report a vulnerability*), atau hubungi maintainer repo secara private.

Sertakan:

- Deskripsi kerentanan dan dampaknya.
- Langkah reproduksi, mulai dari environment yang dipakai.
- Indikasi dampak: data mana yang bisa dibaca, dan apakah butuh role tertentu.

Target waktu balas: **7 hari kerja**. Setelah perbaikan siap,
perbaikan dirilis lebih dulu; baru kemudian diproses permintaan disclosure.

## Apa yang dianggap kerentanan

| Kategori | Contoh |
| --- | --- |
| Token di perangkat | Refresh token yang tersimpan tidak terenkripsi. |
| Data lokal ter-cache | Transaksi yang tertinggal di device setelah logout. |
| Deep link dan navigation | Navigasi yang melewati layar autentikasi. |
| Kredensial di binary | API key atau secret yang ikut ter-bundle ke app. |

> **Catatan khusus:** Token sensitif disimpan lewat secure storage, bukan AsyncStorage.

## Yang BUKAN kerentanan

- Laporan dari scanner otomatis tanpa bukti reproduksi.
- Saran best practice tanpa dampak nyata (ditangani sebagai issue biasa).
- Rate limit yang sudah aktif dan tidak bisa di-bypass.
- Aplikasi mobile yang sudah di-root atau di-jailbroken.

## Severitas dan penanganan

| Severitas | Contoh | Tindakan |
| --- | --- | --- |
| Critical | Akses data keuangan user lain, auth bypass | Perbaikan dan advisory segera |
| High | IDOR yang dapat dieksploitasi | Perbaikan dalam 1-2 minggu |
| Medium | Pengungkapan terbatas tanpa akses data | Perbaikan pada rilis berikutnya |
| Low | Hardening dan best practice | Backlog |

## Praktik yang wajib dijaga di repo ini

- Tidak ada secret di dalam kode. Semua lewat environment variable.
- Pengguna hanya boleh mengakses data miliknya sendiri: setiap query wajib memfilter `userId`.
- Admin memakai endpoint agregat, bukan data mentah pengguna.
- Input divalidasi di backend, bukan hanya di client.
- Dependency kerentanan ditutup lewat Dependabot dan `npm audit`.

## Known accepted risk

`npm audit` di repo ini melaporkan 11 advisory `high`. Semuanya berasal dari
tooling build dan tidak satu pun ikut ter-bundle ke aplikasi atau berjalan saat
app dipakai. Ada dua rantai:

### 1. Rantai `node-forge` (5 advisory)

`expo` -> `@expo/cli` -> `@expo/code-signing-certificates` -> `node-forge@1.4.0`,
plus `@react-native-community/datetimepicker` yang juga mewarisi `expo`.

- Advisory GHSA-86w9-cpqp-85rv belum punya versi patched untuk cabang 1.x.
- Fix yang ditawarkan npm adalah downgrade `expo` ke `44.0.6`, jauh lebih lama
  dari `~54.0.36` dan akan merusak build.
- Dipakai hanya saat build, signing, dan prebuild iOS.

### 2. Rantai `image-size` -> `metro` (6 advisory)

`metro` -> `image-size`, plus `@expo/metro`, `@expo/metro-config`,
`metro-config`, dan `metro-transform-worker` yang mewarisinya.

- Advisory GHSA-5p2g-fcmc-qvqq dan GHSA-w3rx-r6r6-pgpr hanya ditutup pada
  `image-size >= 2.0.3`.
- Namun `metro@0.83.3` (bawaan Expo SDK 54) mendeklarasikan `image-size@^1.0.2`
  dan memanggilnya sebagai fungsi (`require('image-size')(buffer)`).
  `image-size@2.x` menghapus default callable tersebut.
- Sudah diuji: dengan `image-size@2.0.4`, `npx expo export --platform android`
  gagal (`The "list" argument must be an instance of SharedArrayBuffer...`).
  Dengan `1.2.1`, bundle berhasil (2.89 MB, 1180 modul).
- Karena tidak ada versi `image-size` yang aman sekaligus kompatibel dengan
  Metro SDK 54, versi 1.x dipertahankan dan advisory diterima.

Konsekuensi praktis: DoS dari `image-size` hanya terpicu bila ada file gambar
JXL/HEIF/ICNS berbahaya yang ikut diproses bundler, artinya penyerang harus bisa
menyisipkan file ke pipeline build. Tidak ada paparan ke pengguna akhir.

Tindak lanjut: pantau kedua rantai tersebut, dan naikkan ke Expo SDK yang
memakai `metro` + `node-forge` versi aman begitu tersedia. Jangan menutupi
laporan ini dengan `npm audit fix --force` atau `--legacy-peer-deps`, karena
terbukti merusak build (`image-size@2.x`) atau menurunkan Expo secara drastis.

Override yang tersisa (`postcss`, `uuid`) dipakai hanya oleh tooling build dan
tidak mengubah API yang dipanggil runtime.

