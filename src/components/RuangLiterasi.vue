<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';

const props = defineProps(['isAdmin']);

// Cloudinary Config - GANTI DENGAN PUNYA ANDA
const CLOUD_NAME = 'dzspxxdoa'; // Ganti dengan Cloud Name Anda (contoh: 'dxyz123')
const UPLOAD_PRESET = 'preset-tugas'; // Ganti dengan Unsigned Upload Preset Anda

// State
const articles = ref([]);
const selectedArticle = ref(null);
const showFormModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const isUploading = ref(false); // State untuk loading upload

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
const articleToDelete = ref(null);

const confirmDelete = (id) => {
  articleToDelete.value = id;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  articleToDelete.value = null;
};

const executeDelete = async () => {
  if (!articleToDelete.value) return;
  
  try {
    await deleteDoc(doc(db, 'articles', articleToDelete.value));
    triggerToast('Artikel berhasil dihapus.', 'success');
  } catch (error) {
    console.error("Error deleting article:", error);
    triggerToast('Gagal menghapus artikel.', 'error');
  } finally {
    showDeleteModal.value = false;
    articleToDelete.value = null;
  }
};

// Form State
const formData = ref({
  id: '',
  title: '',
  summary: '',
  author: '',
  date: '',
  image: '',
  content: ''
});

// Real-time listener untuk mengambil artikel
let unsubscribe = null;

onMounted(() => {
  const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
  unsubscribe = onSnapshot(q, (snapshot) => {
    articles.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  document.body.style.overflow = ''; // Reset scroll saat pindah halaman
});

// Actions
const openArticle = (article) => {
  selectedArticle.value = article;
  document.body.style.overflow = 'hidden';
};

const closeArticle = () => {
  selectedArticle.value = null;
  document.body.style.overflow = '';
};

// Cloudinary Upload Function
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validasi tipe file
  if (!file.type.startsWith('image/')) {
    triggerToast('Harap pilih file gambar!', 'warning');
    return;
  }

  // Validasi ukuran (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    triggerToast('Ukuran gambar maksimal 5MB!', 'warning');
    return;
  }

  isUploading.value = true;

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: data
    });

    if (!response.ok) {
      throw new Error('Upload gagal');
    }

    const result = await response.json();
    formData.value.image = result.secure_url; // Set URL gambar dari Cloudinary
    console.log('Upload success:', result.secure_url);
    triggerToast('Gambar berhasil diupload!', 'success');
    
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    triggerToast('Gagal mengupload gambar. Pastikan Cloud Name & Preset benar.', 'error');
  } finally {
    isUploading.value = false;
  }
};

// Admin Actions
const openAddModal = () => {
  isEditing.value = false;
  formData.value = {
    title: '',
    summary: '',
    author: 'Admin', // Default author
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    image: '', // Reset image
    content: ''
  };
  showFormModal.value = true;
};

const openEditModal = (article) => {
  isEditing.value = true;
  formData.value = { ...article };
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
};

const saveArticle = async () => {
  if (!formData.value.title || !formData.value.content) {
    triggerToast('Judul dan Konten wajib diisi!', 'warning');
    return;
  }

  isLoading.value = true;
  try {
    if (isEditing.value) {
      // Update existing
      const articleRef = doc(db, 'articles', formData.value.id);
      await updateDoc(articleRef, {
        title: formData.value.title,
        summary: formData.value.summary,
        author: formData.value.author,
        date: formData.value.date,
        image: formData.value.image,
        content: formData.value.content,
        updatedAt: serverTimestamp()
      });
      triggerToast('Artikel berhasil diperbarui!', 'success');
    } else {
      // Create new
      await addDoc(collection(db, 'articles'), {
        title: formData.value.title,
        summary: formData.value.summary,
        author: formData.value.author,
        date: formData.value.date,
        image: formData.value.image,
        content: formData.value.content,
        createdAt: serverTimestamp()
      });
      triggerToast('Artikel berhasil ditambahkan!', 'success');
    }
    closeFormModal();
  } catch (error) {
    console.error("Error saving article:", error);
    triggerToast('Terjadi kesalahan saat menyimpan artikel.', 'error');
  } finally {
    isLoading.value = false;
  }
};

// Helper
const truncateText = (text, length) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};
</script>

<template>
  <div class="literasi-container">
    
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
        <div class="modal-content delete-modal" style="text-align: center;">
          <h3 style="margin-bottom: 10px; color: #ef4444;">Hapus Artikel?</h3>
          <p style="margin-bottom: 20px; color: #F5D3F3;">Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.</p>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button @click="cancelDelete" style="background: #3f3f46; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Batal</button>
            <button @click="executeDelete" style="background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Hapus</button>
          </div>
        </div>
      </div>
    </transition>
    
    <div class="header-section" data-aos="fade-down">
      <h1>Ruang Literasi</h1>
      <div class="line"></div>
      <p class="subtitle">Jendela ilmu dan wawasan digital untuk masa depan</p>
      
      <!-- Admin Add Button -->
      <button v-if="props.isAdmin" class="btn-add-article" @click="openAddModal">
        <i class='bx bx-plus'></i> Tambah Artikel Baru
      </button>
    </div>

    <!-- Article Grid -->
    <div class="article-grid">
      <div v-if="articles.length === 0" class="empty-state">
        <p>Belum ada artikel yang diterbitkan.</p>
      </div>

      <div 
        v-for="article in articles" 
        :key="article.id" 
        class="article-card" 
        data-aos="fade-up"
      >
        <div class="card-image" @click="openArticle(article)">
          <img :src="article.image" :alt="article.title" loading="lazy" />
          <div class="hover-overlay">
            <span>Baca Artikel</span>
          </div>
        </div>
        <div class="card-content">
          <div class="meta">
            <span class="author"><i class='bx bx-user'></i> {{ article.author }}</span>
            <span class="date"><i class='bx bx-calendar'></i> {{ article.date }}</span>
          </div>
          <h3 @click="openArticle(article)">{{ article.title }}</h3>
          <p>{{ truncateText(article.summary, 80) }}</p>
          
          <div class="card-actions">
            <button class="btn-read" @click="openArticle(article)">
              Read More <i class='bx bx-right-arrow-alt'></i>
            </button>

            <!-- Admin Actions -->
            <div v-if="props.isAdmin" class="admin-controls">
              <button class="btn-edit" @click="openEditModal(article)" title="Edit">
                <i class='bx bx-edit'></i>
              </button>
              <button class="btn-delete" @click="confirmDelete(article.id)" title="Hapus">
                <i class='bx bx-trash'></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Article Detail Modal (Read Only) -->
    <transition name="modal-fade">
      <div v-if="selectedArticle" class="modal-backdrop" @click.self="closeArticle">
        <div class="modal-content">
          <button class="close-btn" @click="closeArticle"><i class='bx bx-x'></i></button>
          
          <div class="article-header">
            <img :src="selectedArticle.image" class="article-cover" />
            <div class="article-title-overlay">
              <h2>{{ selectedArticle.title }}</h2>
              <div class="article-meta-large">
                <span><i class='bx bxs-user-circle'></i> {{ selectedArticle.author }}</span>
                <span><i class='bx bx-time-five'></i> {{ selectedArticle.date }}</span>
              </div>
            </div>
          </div>

          <div class="article-body" v-html="selectedArticle.content"></div>
        </div>
      </div>
    </transition>

    <!-- Admin Form Modal (Add/Edit) -->
    <transition name="modal-fade">
      <div v-if="showFormModal" class="modal-backdrop" @click.self="closeFormModal">
        <div class="modal-content form-modal">
          <div class="form-header">
            <h2>{{ isEditing ? 'Edit Artikel' : 'Tambah Artikel Baru' }}</h2>
            <button class="close-btn-simple" @click="closeFormModal"><i class='bx bx-x'></i></button>
          </div>
          
          <div class="form-body">
            <div class="form-group">
              <label>Judul Artikel</label>
              <input v-model="formData.title" type="text" placeholder="Masukkan judul menarik..." />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Penulis</label>
                <input v-model="formData.author" type="text" />
              </div>
              <div class="form-group">
                <label>Tanggal</label>
                <input v-model="formData.date" type="text" placeholder="Contoh: 17 Feb 2026" />
              </div>
            </div>

            <div class="form-group">
              <label>Gambar Cover</label>
              
              <!-- Preview Gambar -->
              <div v-if="formData.image" class="image-preview">
                <img :src="formData.image" alt="Preview" />
                <button class="btn-remove-img" @click="formData.image = ''"><i class='bx bx-x'></i></button>
              </div>

              <!-- Input File -->
              <div class="file-upload-wrapper">
                <input 
                  type="file" 
                  id="fileInput" 
                  @change="handleFileUpload" 
                  accept="image/*" 
                  :disabled="isUploading"
                />
                <label for="fileInput" class="file-label">
                  <i class='bx bx-cloud-upload'></i> 
                  {{ isUploading ? 'Mengupload...' : 'Pilih Foto dari Galeri' }}
                </label>
                <div v-if="isUploading" class="upload-loader"></div>
              </div>
              <small class="hint">Atau masukkan URL manual jika mau:</small>
              <input v-model="formData.image" type="text" placeholder="https://..." :disabled="isUploading" />
            </div>

            <div class="form-group">
              <label>Ringkasan Singkat</label>
              <textarea v-model="formData.summary" rows="2" placeholder="Muncul di kartu depan..."></textarea>
            </div>

            <div class="form-group">
              <label>Konten Lengkap (Support HTML)</label>
              <textarea v-model="formData.content" rows="10" placeholder="<p>Tulis artikelmu di sini...</p>"></textarea>
              <small class="hint">Gunakan tag HTML seperti &lt;p&gt;, &lt;b&gt;, &lt;ul&gt; untuk formatting.</small>
            </div>

            <div class="form-actions">
              <button class="btn-cancel" @click="closeFormModal">Batal</button>
              <button class="btn-save" @click="saveArticle" :disabled="isLoading">
                {{ isLoading ? 'Menyimpan...' : 'Simpan Artikel' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.literasi-container {
  padding: 120px 20px 60px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 60px;
}

.subtitle {
  color: var(--text-muted);
  margin-top: 10px;
  font-size: 1.1rem;
}

.btn-add-article {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 600;
  margin-top: 20px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: 0.3s;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
}

.btn-add-article:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 50px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.5);
  border-radius: 20px;
}

/* Article Grid */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 0.2fr)); /* Slightly wider card */
  gap: 30px;
}

.article-card {
  background: white; /* Clean white card */
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-image {
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio (9 / 16 * 100) */
  position: relative;
  overflow: hidden;
  background-color: #f3f4f6; /* Placeholder untuk gambar loading */
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.article-card:hover .card-image img {
  transform: scale(1.1);
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(236, 72, 153, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hover-overlay span {
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  border: 2px solid white;
  padding: 8px 20px;
  border-radius: 30px;
}

.article-card:hover .hover-overlay {
  opacity: 1;
}

.card-content {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.article-card h3 {
  font-size: 1.3rem;
  margin: 0 0 10px;
  line-height: 1.4;
  color: var(--text-main);
  cursor: pointer;
  transition: color 0.3s;
}

.article-card p {
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.6;
  flex: 1;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.btn-read {
  background: transparent !important;
  color: var(--primary) !important;
  padding: 0 !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.95rem;
  border: none !important;
  cursor: pointer;
}

.admin-controls {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  color: white;
}

.btn-edit { background: #f59e0b; }
.btn-delete { background: #ef4444; }

.btn-edit:hover, .btn-delete:hover { transform: scale(1.1); }

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 20px;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5);
}

.delete-modal {
  max-width: 400px !important;
  background: #18181b !important;
  border: 1px solid #3f3f46;
  padding: 30px;
  height: auto;
}

.form-modal {
  max-width: 600px;
  padding: 0;
}

.form-header {
  padding: 20px 30px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-body {
  padding: 30px;
}

.form-group { margin-bottom: 20px; }
.form-row { display: flex; gap: 20px; }
.form-row .form-group { flex: 1; }

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-main);
}

input, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
}

.hint { color: #888; font-size: 0.8rem; }

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn-cancel {
  background: #f3f4f6 !important;
  color: #666 !important;
  box-shadow: none !important;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.9) !important;
  color: var(--text-main) !important;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.close-btn:hover {
  background: var(--primary) !important;
  color: white !important;
  transform: rotate(90deg);
}

.close-btn-simple {
  background: none !important;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.article-header {
  height: 350px;
  position: relative;
}

.article-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}

.article-title-overlay h2 {
  font-size: 2.2rem;
  margin: 0 0 15px;
  color: white !important;
  font-family: 'Space Grotesk', sans-serif;
}

.article-meta-large {
  display: flex;
  gap: 20px;
  font-size: 1rem;
  opacity: 0.9;
}

.article-body {
  padding: 40px;
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
}

.article-body :deep(p) { margin-bottom: 20px; }
.article-body :deep(ul) { margin-bottom: 20px; padding-left: 20px; }
.article-body :deep(li) { margin-bottom: 10px; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .literasi-container { padding-top: 100px; }
  .article-header { height: 250px; }
  .article-title-overlay {
    padding: 20px;
  }
  
  .article-title-overlay h2 {
    font-size: 1.5rem;
  }
  
  .article-body {
    padding: 25px;
    font-size: 1rem;
  }
  .form-row { flex-direction: column; gap: 0; }
}

/* File Upload Styles */
.file-upload-wrapper {
  position: relative;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

#fileInput {
  display: none;
}

.file-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px dashed var(--primary);
  border-radius: 8px;
  color: var(--primary);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.file-label:hover {
  background: rgba(236, 72, 153, 0.05);
  transform: translateY(-2px);
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 2px solid #eee;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-img {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.6);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.3s;
}

.btn-remove-img:hover {
  background: #ef4444;
}

.upload-loader {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Toast and Modal Extra Styles */
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
  z-index: 3000; /* Higher than modal */
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  backdrop-filter: blur(10px);
  min-width: 300px;
}

.toast-notification.success { background: rgba(16, 185, 129, 0.9); border: 1px solid #10b981; }
.toast-notification.error { background: rgba(239, 68, 68, 0.9); border: 1px solid #ef4444; }
.toast-notification.warning { background: rgba(245, 158, 11, 0.9); border: 1px solid #f59e0b; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-20px); }

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
  z-index: 2500; /* Higher than normal modal */
  backdrop-filter: blur(5px);
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
