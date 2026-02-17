<script setup>
import { ref, onMounted } from 'vue';

const isPlaying = ref(false);
const audio = ref(null);

onMounted(() => {
  // Set volume default (0.3 = 30% volume)
  if (audio.value) {
    audio.value.volume = 0.05;
    
    // Auto-play saat website dibuka
    audio.value.play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch((error) => {
        // Browser mungkin block auto-play, jadi kita handle error
        console.log('Auto-play diblokir oleh browser:', error);
        isPlaying.value = false;
      });
  }
});

const toggleMusic = () => {
  if (!audio.value) return;
  
  if (isPlaying.value) {
    audio.value.pause();
    isPlaying.value = false;
  } else {
    audio.value.play();
    isPlaying.value = true;
  }
};
</script>

<template>
  <!-- Audio Element (Hidden) -->
  <audio ref="audio" loop>
    <!-- Menggunakan musik gratis dari Bensound -->
    <!-- Ganti dengan file lokal /background-music.mp3 jika sudah punya -->
    <source src="/sound.mp3" type="audio/mpeg">
    Browser Anda tidak mendukung audio.
  </audio>

  <!-- Floating Toggle Button (Kiri Bawah) -->
  <button 
    @click="toggleMusic" 
    class="music-toggle"
    :class="{ 'playing': isPlaying }"
    :title="isPlaying ? 'Matikan Musik' : 'Putar Musik'"
  >
    <!-- Icon Music Note -->
    <svg 
      v-if="isPlaying" 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
    
    <!-- Icon Music Off -->
    <svg 
      v-else 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
      <line x1="2" y1="2" x2="22" y2="22"></line>
    </svg>
  </button>
</template>

<style scoped>
.music-toggle {
  position: fixed;
  bottom: 24px;
  left: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  border: 3px solid white;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  z-index: 1000;
  animation: pulse 2s infinite;
}

.music-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(236, 72, 153, 0.5);
}

.music-toggle:active {
  transform: scale(0.95);
}

.music-toggle.playing {
  animation: spin 3s linear infinite;
}

/* Animasi Pulse (saat musik mati) */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
  }
  50% {
    box-shadow: 0 4px 30px rgba(236, 72, 153, 0.6);
  }
}

/* Animasi Spin (saat musik nyala) */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive untuk Mobile */
@media (max-width: 768px) {
  .music-toggle {
    width: 48px;
    height: 48px;
    bottom: 16px;
    left: 16px;
  }
  
  .music-toggle svg {
    width: 20px;
    height: 20px;
  }
}
</style>
