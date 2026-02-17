<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const isPlaying = ref(false);
const audio = ref(null);
const currentTrackIndex = ref(0);
const isExpanded = ref(false); // State untuk expand/collapse controls

// Playlist dengan 6 lagu
const playlist = ref([
  { title: 'Background Sound', src: '/sound.mp3' },
  { title: '33x', src: '/33x.mp3' },
  { title: 'Kota Ini', src: '/kotaini.mp3' },
  { title: 'Nina', src: '/nina.mp3' },
  { title: 'Spontan', src: '/spontan.mp3' },
  { title: 'The Man', src: '/theman.mp3' }
]);

// Current track yang sedang dimainkan
const currentTrack = computed(() => playlist.value[currentTrackIndex.value]);

// Toggle expand/collapse controls
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// Fungsi untuk pindah ke track berikutnya
const nextTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.value.length;
  loadAndPlayTrack();
};

// Fungsi untuk pindah ke track sebelumnya
const prevTrack = () => {
  currentTrackIndex.value = currentTrackIndex.value === 0 
    ? playlist.value.length - 1 
    : currentTrackIndex.value - 1;
  loadAndPlayTrack();
};

// Fungsi untuk load dan play track baru
const loadAndPlayTrack = () => {
  if (!audio.value) return;
  
  const wasPlaying = isPlaying.value;
  audio.value.src = currentTrack.value.src;
  
  if (wasPlaying) {
    audio.value.play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch((error) => {
        console.log('Error playing track:', error);
        isPlaying.value = false;
      });
  }
};

// Event listener untuk auto-advance ke track berikutnya
const handleTrackEnd = () => {
  nextTrack();
};

onMounted(() => {
  // Set volume default
  if (audio.value) {
    audio.value.volume = 0.05;
    
    // Set initial track
    audio.value.src = currentTrack.value.src;
    
    // Add event listener untuk auto-advance
    audio.value.addEventListener('ended', handleTrackEnd);
    
    // Auto-play saat website dibuka
    audio.value.play()
      .then(() => {
        isPlaying.value = true;
      })
      .catch((error) => {
        console.log('Auto-play diblokir oleh browser:', error);
        isPlaying.value = false;
      });
  }
});

onUnmounted(() => {
  // Cleanup event listener
  if (audio.value) {
    audio.value.removeEventListener('ended', handleTrackEnd);
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
  <audio ref="audio">
    Browser Anda tidak mendukung audio.
  </audio>

  <!-- Music Controls Container -->
  <div class="music-controls" :class="{ 'expanded': isExpanded }">
    <!-- Previous Button (Only show when expanded) -->
    <transition name="slide-fade">
      <button 
        v-show="isExpanded"
        @click="prevTrack" 
        class="nav-btn prev-btn"
        title="Previous Track"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="19 20 9 12 19 4 19 20"></polygon>
          <line x1="5" y1="19" x2="5" y2="5"></line>
        </svg>
      </button>
    </transition>

    <!-- Main Play/Pause Button -->
    <button 
      @click="isExpanded ? toggleMusic() : toggleExpand()" 
      class="music-toggle"
      :class="{ 'playing': isPlaying }"
      :title="isExpanded ? (isPlaying ? 'Pause' : 'Play') : 'Open Music Player'"
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

    <!-- Next Button (Only show when expanded) -->
    <transition name="slide-fade">
      <button 
        v-show="isExpanded"
        @click="nextTrack" 
        class="nav-btn next-btn"
        title="Next Track"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 4 15 12 5 20 5 4"></polygon>
          <line x1="19" y1="5" x2="19" y2="19"></line>
        </svg>
      </button>
    </transition>

    <!-- Close/Minimize Button (Only show when expanded) -->
    <transition name="fade">
      <button 
        v-show="isExpanded"
        @click="toggleExpand" 
        class="minimize-btn"
        title="Minimize"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </transition>

    <!-- Track Info Tooltip (Only show when expanded) -->
    <transition name="fade">
      <div v-show="isExpanded" class="track-info">
        {{ currentTrack.title }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Close/Minimize Button */
.minimize-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  position: absolute;
  top: -10px;
  right: -10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  z-index: 1002;
}

.minimize-btn:hover {
  background: white;
  color: var(--primary);
  transform: scale(1.1);
}

/* Music Controls Container */
.music-controls {
  position: fixed;
  bottom: 24px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 15px; /* Jarak lebih lega */
  z-index: 1000;
  padding: 10px;
  border-radius: 50px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.music-controls.expanded {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding-right: 20px; /* Space ekstra untuk tombol minimize */
}

/* Main Play/Pause Button */
.music-toggle {
  width: 60px; /* Sedikit lebih besar */
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #d946ef); /* Gradient lebih rich */
  border: 3px solid rgba(255,255,255,0.8);
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  animation: pulse 2s infinite;
  order: 2;
  z-index: 1001;
}

.music-toggle:hover {
  transform: scale(1.1) rotate(5deg); /* Sedikit rotasi */
  box-shadow: 0 8px 30px rgba(236, 72, 153, 0.6);
  border-color: white;
}

.music-toggle:active {
  transform: scale(0.95);
}

.music-toggle.playing {
  animation: spin 4s linear infinite; /* Spin lebih santai */
  background: linear-gradient(135deg, #db2777, var(--primary)); /* Ganti warna pas playing */
}

/* Navigation Buttons (Prev & Next) */
.nav-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 1; /* Selalu visible saat mounted */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover {
  transform: translateY(-3px) scale(1.1);
  background: white;
  color: #db2777;
  box-shadow: 0 8px 20px rgba(236, 72, 153, 0.25);
}

.nav-btn:active {
  transform: scale(0.9);
}

.prev-btn { order: 1; }
.next-btn { order: 3; }

/* Track Info Tooltip */
.track-info {
  position: absolute;
  bottom: 85px; /* Naik dikit */
  left: 50%;
  transform: translateX(-50%); /* Center based tooltip */
  background: rgba(19, 19, 21, 0.9); /* Hampir hitam pekat */
  backdrop-filter: blur(4px);
  color: white;
  padding: 8px 20px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.3s ease;
  pointer-events: none;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255,255,255,0.1);
}

.music-controls:hover .track-info, 
.music-controls.expanded .track-info { /* Tampil saat expanded juga */
  opacity: 1;
  bottom: 95px; /* Slide up effect */
}

/* ANIMATIONS */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(236, 72, 153, 0); }
  100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* VUE TRANSITIONS */
/* Fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Slide Fade for Buttons */
.slide-fade-enter-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.slide-fade-leave-active { transition: all 0.3s ease-in; }
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: scale(0.5); /* Efek pop out */
  width: 0; /* Biar collapse width-nya */
  margin: 0;
}

/* Responsive untuk Mobile */
@media (max-width: 768px) {
  .music-controls {
    bottom: 20px;
    left: 20px;
    gap: 10px;
  }
  
  .music-controls.expanded {
    padding: 8px 15px; /* Compact padding */
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%); /* Tengahin di mobile kalau expanded */
    width: auto;
  }
  
  .music-toggle { width: 50px; height: 50px; }
  .music-toggle svg { width: 22px; height: 22px; }
  
  .nav-btn { width: 38px; height: 38px; }
  .nav-btn svg { width: 16px; height: 16px; }

  .track-info {
    font-size: 0.8rem;
    padding: 6px 16px;
    bottom: 80px !important; /* Force position */
  }
}
</style>
