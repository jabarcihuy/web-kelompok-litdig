<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase'; 
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import axios from 'axios'; 

// Props dari App.vue (Login Status)
const props = defineProps(['isAdmin']);

const fileInput = ref(null);
const isUploading = ref(false);
const uploadText = ref('Mengupload...');
const uploadedFiles = ref([]);

// State untuk Nama dan NIM
const uploaderName = ref('');
const uploaderNim = ref('');

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

// --- DELETE MODAL SYSTEM ---
const showDeleteModal = ref(false);
const fileToDelete = ref(null);

const confirmDelete = (id) => {
  fileToDelete.value = id;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  fileToDelete.value = null;
};

const executeDelete = async () => {
  if (!fileToDelete.value) return;
  
  try {
    await deleteDoc(doc(db, "uploads", fileToDelete.value));
    triggerToast("File berhasil dihapus!", "success");
  } catch (error) {
    console.error(error);
    triggerToast("Gagal menghapus file: " + error.message, "error");
  } finally {
    showDeleteModal.value = false;
    fileToDelete.value = null;
  }
};

// --- ISI DATA CLOUDINARY KAMU DI SINI ---
const CLOUD_NAME = 'dzspxxdoa'; // Contoh: dxyz123
const UPLOAD_PRESET = 'preset-tugas'; // Contoh: preset_tugas (HARUS UNSIGNED)
// ----------------------------------------

// 1. LOAD DATA DARI FIREBASE
onMounted(() => {
  const q = query(collection(db, "uploads"), orderBy("uploadedAt", "desc"));
  onSnapshot(q, (snapshot) => {
    uploadedFiles.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

const triggerFileInput = () => {
    if (!uploaderName.value || !uploaderNim.value) {
        triggerToast("Mohon isi Nama dan NIM terlebih dahulu!", "warning");
        return;
    }
    fileInput.value.click();
};

// 2. LOGIKA UPLOAD (Cloudinary + Firebase)
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!uploaderName.value || !uploaderNim.value) {
      triggerToast("Mohon isi Nama dan NIM terlebih dahulu!", "warning");
      event.target.value = null; // Reset input file
      return;
  }

  isUploading.value = true;
  uploadText.value = "Mengirim ke Cloud Storage...";

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('resource_type', 'auto'); 

  try {
    // A. Upload ke Cloudinary
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      formData
    );

    // B. Simpan Link ke Firebase
    uploadText.value = "Menyimpan Data...";
    await addDoc(collection(db, "uploads"), {
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.name.split('.').pop().toLowerCase(),
      url: res.data.secure_url, // Link Aman Cloudinary
      uploadedAt: Date.now(),
      uploaderName: uploaderName.value, // Simpan Nama
      uploaderNim: uploaderNim.value    // Simpan NIM
    });

    triggerToast("Upload Berhasil!", "success");
    
    // Reset form setelah upload berhasil
    uploaderName.value = '';
    uploaderNim.value = '';

  } catch (error) {
    console.error(error);
    triggerToast("Gagal Upload: " + error.message, "error");
  } finally {
    isUploading.value = false;
    event.target.value = null;
  }
};
</script>

<template>
  <div class="section-padding">
    <div class="upload-container" style="max-width: 900px; margin: 0 auto; position: relative;">
      
      <!-- TOAST NOTIFICATION -->
      <transition name="toast">
        <div v-if="showToast" class="toast-notification" :class="toastType">
          <i v-if="toastType === 'success'" class='bx bx-check-circle'></i>
          <i v-if="toastType === 'error'" class='bx bx-x-circle'></i>
          <i v-if="toastType === 'warning'" class='bx bx-error'></i>
          <span>{{ toastMessage }}</span>
        </div>
      </transition>

      <!-- DELETE MODAL -->
      <transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay">
          <div class="modal-content" style="text-align: center;">
            <h3 style="margin-bottom: 10px; color: #ef4444;">Hapus File?</h3>
            <p style="margin-bottom: 20px; color: #d4d4d8;">Apakah Anda yakin ingin menghapus file ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div style="display: flex; justify-content: center; gap: 10px;">
              <button @click="cancelDelete" style="background: #3f3f46; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Batal</button>
              <button @click="executeDelete" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Hapus</button>
            </div>
          </div>
        </div>
      </transition>

      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="font-family: 'Space Grotesk'; font-size: 2.5rem;">Upload Tugas</h2>
        <div style="width: 60px; height: 4px; background: #6366f1; margin: 10px auto;"></div>
      </div>

      <div v-if="isAdmin">
        <div class="input-group">
            <input 
              type="text" 
              v-model="uploaderName" 
              placeholder="Nama Lengkap" 
              class="input-field"
            />
            <input 
              type="text" 
              v-model="uploaderNim" 
              placeholder="NIM" 
              class="input-field"
            />
        </div>

        <div class="upload-zone" :class="{ 'uploading': isUploading }">
          <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" />
          
          <div v-if="!isUploading" @click="triggerFileInput" style="cursor: pointer;">
            <i class='bx bx-cloud-upload' style="font-size: 4rem; color: #6366f1;"></i>
            <h3>Klik untuk Upload File</h3>
            <p style="color: #a1a1aa;">PDF, DOCX, PPT, JPG</p>
          </div>

          <div v-else>
            <i class='bx bx-loader-alt bx-spin' style="font-size: 3rem; color: #6366f1;"></i>
            <h3>{{ uploadText }}</h3>
          </div>
        </div>
      </div>

      <div v-else style="text-align: center; padding: 40px; border: 1px dashed #444; border-radius: 20px; margin-bottom: 40px; color: #a1a1aa;">
        <i class='bx bx-lock-alt' style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>Login sebagai Admin untuk mengupload file.</p>
      </div>

      <div class="file-list">
        <h3>File Tersimpan ({{ uploadedFiles.length }})</h3>
        <ul style="list-style: none; padding: 0;">
          <li v-for="file in uploadedFiles" :key="file.id" style="background: rgba(255,255,255,0.05); padding: 15px; margin-bottom: 10px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <i class='bx bxs-file' style="font-size: 1.5rem; color: #a1a1aa;"></i>
              <div>
                <div style="font-weight: 500;">{{ file.name }}</div>
                <div style="font-size: 0.8rem; color: #a1a1aa;">
                    <span v-if="file.uploaderName || file.uploaderNim">
                        Oleh: {{ file.uploaderName }} ({{ file.uploaderNim }}) | 
                    </span>
                    {{ file.size }}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <a :href="file.url" target="_blank" style="background: #27272a; color: #6366f1; padding: 8px 15px; border-radius: 8px; text-decoration: none; font-weight: 600;">Buka</a>
              <button v-if="isAdmin" @click="confirmDelete(file.id)" style="background: #ef4444; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer;">
                <i class='bx bx-trash'></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-content { 
  padding-top: 150px; 
  padding-bottom: 50px; 
  min-height: 100vh; 
  color: white; 
}

.upload-container { max-width: 900px; margin: 0 auto; padding: 100px; }
.upload-zone { border: 2px dashed #444; padding: 40px; border-radius: 20px; text-align: center; background: rgba(255,255,255,0.02); transition: 0.3s; margin-bottom: 40px; }
.upload-zone:hover, .upload-zone.uploading { border-color: #6366f1; background: rgba(99,102,241,0.05); }

.input-group {
  margin-bottom: 30px; 
  display: flex; 
  gap: 20px; 
  flex-wrap: wrap; 
  justify-content: center;
}

.input-field {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid #444;
    padding: 12px 20px;
    border-radius: 10px;
    color: white;
    font-family: inherit;
    outline: none;
    width: 200px;
}

.input-field:focus {
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
}

/* Toast Notification Styles */
.toast-notification {
  position: fixed;
  top: 100px; /* Adjust based on navbar height */
  right: 20px;
  padding: 15px 25px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 500;
  z-index: 1000;
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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
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

@keyframes modalPop {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .upload-container {
    padding: 100px 20px 40px;
  }
  
  .input-group {
    flex-direction: column;
    gap: 15px;
  }

  .input-field {
    width: 88%;
  }

  .upload-zone {
    padding: 20px;
  }
  
  h2 {
    font-size: 1.8rem !important;
  }
}
</style>