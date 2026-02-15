<script setup>
import { ref } from 'vue';
import { auth } from '../firebase'; // Pastikan path ini benar
import { signInWithEmailAndPassword } from 'firebase/auth';

const email = ref('');
const password = ref('');
const errMsg = ref('');
const isLoading = ref(false);

// Event untuk memberi tahu App.vue kalau login berhasil
const emit = defineEmits(['loginSuccess']);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errMsg.value = "Email dan Password wajib diisi!";
    return;
  }

  isLoading.value = true;
  errMsg.value = '';

  try {
    // Fungsi bawaan Firebase untuk login
    await signInWithEmailAndPassword(auth, email.value, password.value);
    
    // Jika berhasil, kirim sinyal ke App.vue
    // "Hei App.vue, user sudah login nih, tolong pindahkan ke halaman Upload"
    emit('loginSuccess'); 
    
  } catch (error) {
    // Tangani error umum
    switch (error.code) {
      case 'auth/invalid-email':
        errMsg.value = "Format email salah.";
        break;
      case 'auth/user-not-found':
        errMsg.value = "Akun tidak ditemukan.";
        break;
      case 'auth/wrong-password':
        errMsg.value = "Password salah.";
        break;
      default:
        errMsg.value = "Email atau Password salah!";
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box" data-aos="zoom-in">
      <div class="icon-area">
        <i class='bx bxs-user-circle'></i>
      </div>
      <h2>Admin Login</h2>
      <p class="subtitle">Masuk untuk mengelola data kelompok.</p>
      
      <div class="form-group">
        <label>Email</label>
        <input 
          v-model="email" 
          type="email" 
          placeholder="admin@nexus.com" 
          @keyup.enter="handleLogin"
        />
      </div>
      
      <div class="form-group">
        <label>Password</label>
        <input 
          v-model="password" 
          type="password" 
          placeholder="••••••••" 
          @keyup.enter="handleLogin"
        />
      </div>
      
      <div v-if="errMsg" class="error-msg">
        <i class='bx bx-error-circle'></i> {{ errMsg }}
      </div>
      
      <button @click="handleLogin" class="btn-login" :disabled="isLoading">
        <span v-if="isLoading">Memproses...</span>
        <span v-else>Masuk Dashboard</span>
      </button>

      <p class="footer-text">Hanya untuk anggota kelompok.</p>
    </div>
  </div>
</template>

<style scoped>
/* Layout Tengah */
.login-container {
  /* Ganti min-height jadi 100vh agar memenuhi satu layar penuh */
  min-height: 100vh; 
  
  display: flex;
  justify-content: center;
  align-items: center;
  
  padding: 20px;
  /* Tambahkan ini agar tidak ketutupan Navbar di atas */
  padding-top: 80px; 
  
  color: white;
}

/* Kotak Login */
.login-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  /* Tambahkan animasi masuk agar smooth */
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ... (SISA CSS KE BAWAH BIARKAN SAMA SEPERTI SEBELUMNYA) ... */
.icon-area { font-size: 4rem; color: #6366f1; margin-bottom: 10px; }
h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2rem; margin: 0; }
.subtitle { color: #a1a1aa; margin-bottom: 30px; font-size: 0.9rem; }
.form-group { text-align: left; margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; font-size: 0.85rem; color: #a1a1aa; }
input { width: 100%; padding: 12px 15px; background: #18181b; border: 1px solid #3f3f46; border-radius: 10px; color: white; font-family: 'Inter', sans-serif; transition: 0.3s; font-size: 1rem; box-sizing: border-box; } /* Tambah box-sizing biar rapi */
input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
.btn-login { width: 100%; padding: 14px; background: linear-gradient(to right, #6366f1, #4f46e5); color: white; border: none; border-radius: 10px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: 0.3s; margin-top: 10px; }
.btn-login:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4); }
.btn-login:disabled { background: #3f3f46; cursor: not-allowed; transform: none; }
.error-msg { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 10px; border-radius: 8px; font-size: 0.9rem; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.footer-text { margin-top: 20px; font-size: 0.8rem; color: #52525b; }
</style>