# 🎵 Cara Menambahkan Background Music

## Opsi 1: Menggunakan File Lokal (Recommended)

1. Siapkan file musik dalam format `.mp3` (nama file: `background-music.mp3`)
2. Letakkan file tersebut di folder `public/` 
3. Path lengkap: `d:\orderanOrang\punyaAan\frontend\public\background-music.mp3`

**Tips Mendapatkan Musik Gratis:**
- [Pixabay](https://pixabay.com/music/) - Musik bebas royalti
- [Bensound](https://www.bensound.com/) - Musik gratis untuk web
- [Free Music Archive](https://freemusicarchive.org/) - Koleksi musik bebas

## Opsi 2: Menggunakan URL Online (Alternatif)

Jika belum punya file musik, edit file `src/components/MusicPlayer.vue` baris 47:

**Ganti:**
```vue
<source src="/background-music.mp3" type="audio/mpeg">
```

**Dengan:**
```vue
<source src="https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3" type="audio/mpeg">
```

## Fitur yang Sudah Ditambahkan ✅

- ✅ Auto-play musik saat website dibuka
- ✅ Toggle button mengambang di kiri bawah
- ✅ Animasi spin saat musik diputar
- ✅ Animasi pulse saat musik berhenti
- ✅ Loop musik otomatis
- ✅ Responsive design untuk mobile

## Troubleshooting

**Musik tidak auto-play?**
- Browser modern memblokir auto-play. User harus klik tombol play manual di kunjungan pertama.
- Setelah itu, musik akan auto-play di kunjungan berikutnya.

**File tidak ditemukan?**
- Pastikan file ada di folder `public/`
- Pastikan nama file PERSIS: `background-music.mp3`
- Restart dev server setelah menambahkan file
