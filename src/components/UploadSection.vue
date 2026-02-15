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

const triggerFileInput = () => fileInput.value.click();

// 2. LOGIKA UPLOAD (Cloudinary + Firebase)
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

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
      uploadedAt: Date.now()
    });

    alert("Upload Berhasil!");
  } catch (error) {
    console.error(error);
    alert("Gagal Upload: " + error.message);
  } finally {
    isUploading.value = false;
    event.target.value = null;
  }
};

const deleteFile = async (id) => {
  if(confirm('Hapus file ini?')) await deleteDoc(doc(db, "uploads", id));
};
</script>

<template>
  <div class="section-padding">
    <div class="upload-container" style="max-width: 900px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="font-family: 'Space Grotesk'; font-size: 2.5rem;">Repository Tugas</h2>
        <div style="width: 60px; height: 4px; background: #6366f1; margin: 10px auto;"></div>
      </div>

      <div v-if="isAdmin">
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
                <div style="font-size: 0.8rem; color: #a1a1aa;">{{ file.size }}</div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <a :href="file.url" target="_blank" style="background: #27272a; color: #6366f1; padding: 8px 15px; border-radius: 8px; text-decoration: none; font-weight: 600;">Buka</a>
              <button v-if="isAdmin" @click="deleteFile(file.id)" style="background: #ef4444; color: white; border: none; padding: 8px; border-radius: 8px; cursor: pointer;">
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
/* PERBAIKAN DI SINI: Ubah padding-top dari 100px jadi 150px */
.page-content { 
  padding-top: 150px; /* <--- INI YANG DIUBAH */
  padding-bottom: 50px; 
  min-height: 100vh; 
  color: white; 
}

/* Sisa CSS di bawah ini biarkan sama */
.upload-container { max-width: 900px; margin: 0 auto; padding: 100px; }
.upload-zone { border: 2px dashed #444; padding: 40px; border-radius: 20px; text-align: center; background: rgba(255,255,255,0.02); transition: 0.3s; margin-bottom: 40px; }
.upload-zone:hover, .upload-zone.uploading { border-color: #6366f1; background: rgba(99,102,241,0.05); }
</style>