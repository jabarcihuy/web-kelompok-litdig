<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';

// Menerima data 'isAdmin' dari App.vue
const props = defineProps(['currentPage', 'isAdmin']);
const emit = defineEmits(['changePage', 'logout']);

const { isDarkMode, toggleTheme } = inject('theme');

const isMenuOpen = ref(false);
const isScrolled = ref(false);

// --- NOTIFICATION SYSTEM ---
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success'); // success, error, warning

const triggerToast = (msg, type = 'success') => {
  toastMessage.value = msg;
  toastType.value = type;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// --- LOGOUT MODAL SYSTEM ---
const showLogoutModal = ref(false);

const confirmLogout = () => {
  showLogoutModal.value = true;
  isMenuOpen.value = false; // Close menu if open
};

const cancelLogout = () => {
  showLogoutModal.value = false;
};

const executeLogout = () => {
  showLogoutModal.value = false;
  emit('logout'); // Emit logout event to App.vue
  triggerToast('Berhasil Logout!', 'success');
};

const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value;

const navTo = (page) => {
  emit('changePage', page);
  isMenuOpen.value = false;
  window.scrollTo(0, 0);
};

const handleScroll = () => isScrolled.value = window.scrollY > 50;
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));
</script>

<template>
  <nav class="navbar" :class="{ 'scrolled': isScrolled }">
    
    <!-- TOAST NOTIFICATION -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification" :class="toastType">
        <i v-if="toastType === 'success'" class='bx bx-check-circle'></i>
        <i v-if="toastType === 'error'" class='bx bx-x-circle'></i>
        <i v-if="toastType === 'warning'" class='bx bx-error'></i>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- LOGOUT CONFIRMATION MODAL -->
    <transition name="modal">
      <div v-if="showLogoutModal" class="modal-overlay">
        <div class="modal-content logout-modal" style="text-align: center;">
          <h3 style="margin-bottom: 10px; color: #ef4444;">Konfirmasi Logout</h3>
          <p style="margin-bottom: 20px; color: #e4e4e7;">Apakah Anda yakin ingin keluar dari halaman admin?</p>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button @click="cancelLogout" style="background: #3f3f46; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Batal</button>
            <button @click="executeLogout" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Ya, Keluar</button>
          </div>
        </div>
      </div>
    </transition>

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
             <i class='bx bx-cloud-upload'></i> Upload Tugas
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
          <a href="#" class="btn-logout" @click.prevent="confirmLogout">
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

/* Toast Notification Styles */
.toast-notification {
  position: fixed;
  top: 100px;
  right: 20px;
  padding: 15px 25px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  min-width: 300px;
}

.toast-notification.success { background: rgba(16, 185, 129, 0.9); border: 1px solid #10b981; }
.toast-notification.error { background: rgba(239, 68, 68, 0.9); border: 1px solid #ef4444; }
.toast-notification.warning { background: rgba(245, 158, 11, 0.9); border: 1px solid #f59e0b; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-20px); }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #18181b;
  padding: 30px;
  border-radius: 15px;
  width: 90%;
  max-width: 400px;
  border: 1px solid #3f3f46;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  animation: modalPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.logout-modal {
  border: 1px solid #ef4444;
}

@keyframes modalPop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>