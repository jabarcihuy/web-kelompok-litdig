<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';

// Menerima data 'isAdmin' dari App.vue
const props = defineProps(['currentPage', 'isAdmin']);
const emit = defineEmits(['changePage', 'logout']);

const { isDarkMode, toggleTheme } = inject('theme');

const isMenuOpen = ref(false);
const isScrolled = ref(false);

const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value;

const navTo = (page) => {
  emit('changePage', page);
  isMenuOpen.value = false;
  window.scrollTo(0, 0);
};

// Fungsi Logout (Memanggil event ke App.vue)
const logout = () => {
  emit('logout');
  isMenuOpen.value = false;
};

const handleScroll = () => isScrolled.value = window.scrollY > 50;
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
  <nav class="navbar" :class="{ 'scrolled': isScrolled }">
    <div class="nav-container">
      <div class="logo" @click="navTo('home')">NEXUS <span class="highlight">1.0</span></div>
      
      <button class="menu-toggle" @click="toggleMenu">
        <i class='bx' :class="isMenuOpen ? 'bx-x' : 'bx-menu'"></i>
      </button>

      <ul class="nav-links" :class="{ 'show': isMenuOpen }">
        <li><a href="#" :class="{ active: currentPage === 'home' }" @click.prevent="navTo('home')">Home</a></li>
        
        <li v-if="currentPage === 'home'"><a href="#anggota">Anggota</a></li>
        
        <li><a href="#" :class="{ active: currentPage === 'aktivitas' }" @click.prevent="navTo('aktivitas')">Aktivitas</a></li>
        
        <!-- Ruang Literasi Link -->
        <li>
          <a href="#" :class="{ active: currentPage === 'literasi' }" @click.prevent="navTo('literasi')">
             Ruang Literasi
          </a>
        </li>
        
        <!-- Nexus Chat Bot Link -->
        <li>
          <a href="https://nexus-ai-v1.vercel.app/" target="_blank" rel="noopener noreferrer" class="btn-chatbot">
            <i class='bx bx-bot'></i>
          </a>
        </li>
        
        <li>
          <a href="#" class="btn-upload" :class="{ active: currentPage === 'upload' }" @click.prevent="navTo('upload')">
             <i class='bx bx-cloud-upload'></i> Repository
          </a>
        </li>

        <!-- Theme Toggle -->
        <li>
          <button class="btn-theme" @click="toggleTheme" :title="isDarkMode ? 'Mode Terang' : 'Mode Gelap'">
            <i :class="isDarkMode ? 'bx bx-sun' : 'bx bx-moon'"></i>
          </button>
        </li>

        <li v-if="!isAdmin">
          <a href="#" class="btn-login" @click.prevent="navTo('login')">
            <i class='bx bx-user'></i> Login Admin
          </a>
        </li>
        <li v-else>
          <a href="#" class="btn-logout" @click.prevent="logout">
            <i class='bx bx-log-out'></i> Logout
          </a>
        </li>

      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar { position: fixed; top: 0; left: 0; width: 100%; z-index: 100; transition: 0.3s; }
.navbar.scrolled { background: rgba(5,5,7,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); }
.nav-container { display: flex; justify-content: space-between; align-items: center; max-width: 1300px; margin: 0 auto; padding: 20px 40px; }
.logo { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.4rem; cursor: pointer; letter-spacing: 1px; color: white; } 
.highlight { color: #6366f1; }
.nav-links { display: flex; gap: 30px; list-style: none; margin: 0; padding: 0; align-items: center; }
.nav-links a { text-decoration: none; color: #a1a1aa; font-weight: 500; transition: 0.3s; }
.nav-links a:hover, .nav-links a.active { color: #fff; }

/* Tombol Khusus */
.btn-upload { background: #6366f1; color: #fff !important; padding: 8px 20px; border-radius: 30px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.btn-chatbot { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: #fff !important; padding: 8px 20px; border-radius: 30px; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
.btn-chatbot:hover { background: linear-gradient(135deg, #7c3aed, #4f46e5); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4); }
.btn-login { border: 1px solid #6366f1; color: #6366f1 !important; padding: 8px 20px; border-radius: 30px; display: flex; align-items: center; gap: 5px; }
.btn-login:hover { background: #6366f1; color: white !important; }
.btn-logout { background: #ef4444; color: white !important; padding: 8px 20px; border-radius: 30px; display: flex; align-items: center; gap: 5px; }
.btn-logout:hover { background: #dc2626; }

.menu-toggle { display: none; background: none; border: none; color: white; font-size: 1.5rem; }

.btn-theme {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  background: transparent !important;
  color: #6366f1 !important;
  border: 2px solid #6366f1 !important;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0 !important;
}

.btn-theme:hover {
  background: #6366f1 !important;
  color: white !important;
  transform: rotate(30deg);
}

@media (max-width: 768px) {
  .nav-links { position: fixed; top: 70px; left: 0; width: 84%; background: #feeeff; flex-direction: column; padding: 30px; transform: translateY(-150%); transition: 0.4s; z-index: 99; }
  .nav-links.show { transform: translateY(0); } .menu-toggle { display: flex; }
}
</style>