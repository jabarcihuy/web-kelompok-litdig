<script setup>
import { ref, onMounted } from 'vue';
// Import Firebase Auth
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Import Semua Komponen
import Navbar from './components/Navbar.vue';
import Hero from './components/Hero.vue';
import MemberGrid from './components/MemberGrid.vue';
import ActivityLog from './components/ActivityLog.vue';
import UploadSection from './components/UploadSection.vue';
import Login from './components/Login.vue'; // <--- JANGAN LUPA INI
import Footer from './components/Footer.vue';
import MusicPlayer from './components/MusicPlayer.vue'; // Komponen Music Player
import RuangLiterasi from './components/RuangLiterasi.vue'; // Halaman Artikel

// State Halaman
const currentPage = ref('home');
const isAdmin = ref(false); // <--- State untuk menyimpan status Login

// Cek Status Login Saat Web Dibuka (Realtime)
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isAdmin.value = true; // Jika ada user login, set Admin true
    } else {
      isAdmin.value = false; // Jika tidak, set false
    }
  });
});

// Fungsi Pindah Halaman
const handlePageChange = (pageName) => {
  currentPage.value = pageName;
};

// Fungsi Logout (Dipanggil dari Navbar)
const handleLogout = async () => {
  try {
    await signOut(auth);
    isAdmin.value = false;
    currentPage.value = 'home'; // Balik ke home setelah logout
    alert("Berhasil Logout");
  } catch (error) {
    console.error("Error logout:", error);
  }
};
</script>

<template>
  <div class="app-container">
    <div class="premium-bg"></div>

    <Navbar 
      :currentPage="currentPage" 
      :isAdmin="isAdmin"
      @changePage="handlePageChange" 
      @logout="handleLogout"
    />

    <main>
      <div v-if="currentPage === 'home'">
        <Hero />
        <MemberGrid />
      </div>

      <div v-else-if="currentPage === 'aktivitas'">
        <ActivityLog :isAdmin="isAdmin" />
      </div>

      <div v-else-if="currentPage === 'upload'">
        <UploadSection :isAdmin="isAdmin" />
      </div>

      <div v-else-if="currentPage === 'literasi'">
        <RuangLiterasi :isAdmin="isAdmin" />
      </div>
      
      <div v-else-if="currentPage === 'login'">
        <Login @loginSuccess="currentPage = 'upload'" />
      </div>
    </main>

    <Footer />
    
    <!-- Music Player (Floating di kiri bawah) -->
    <MusicPlayer />
  </div>
</template>

<style>
/* STYLE GLOBAL (Berlaku untuk semua) */
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

:root {
  /* --- PALET WARNA BARBIE --- */
  --bg-color: #fff0f5;       /* Lavender Blush (Pink Pucat banget buat background) */
  --card-bg: #ffffff;        /* Kartu jadi Putih bersih */
  --text-main: #4a4a4a;      /* Teks jadi Abu Gelap (JANGAN HITAM PEKAT) */
  --text-muted: #888888;     /* Teks keterangan */
  
  --primary: #ec4899;        /* Hot Pink (Warna Utama) */
  --primary-hover: #db2777;  /* Pink lebih gelap pas di-hover */
  
  --border-color: #fbcfe8;   /* Garis pinggir pink muda */
  --shadow: 0 4px 15px rgba(236, 72, 153, 0.15); /* Bayangan pink soft */
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-color);
  color: var(--text-main);
  /* GANTI FONT DI SINI */
  font-family: 'Quicksand', sans-serif; 
}
</style>