<script setup>
import { ref, onMounted } from 'vue';
import { db } from '../firebase'; 
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Menerima data 'isAdmin' dari App.vue
const props = defineProps(['isAdmin']);

const activities = ref([]);
const showForm = ref(false);
const newActivity = ref({ title: '', date: '', desc: '', status: 'On Progress' });
const isLoading = ref(true);

// 1. REALTIME LISTENER (Baca Data - Semua orang boleh baca)
onMounted(() => {
  const q = query(collection(db, "activities"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snapshot) => {
    activities.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    isLoading.value = false;
  });
});

// 2. TAMBAH DATA (Create - Hanya Admin via UI)
const addActivity = async () => {
  if (!newActivity.value.title || !newActivity.value.desc) {
    alert("Judul dan Deskripsi wajib diisi!");
    return;
  }

  try {
    await addDoc(collection(db, "activities"), {
      title: newActivity.value.title,
      date: formatDate(newActivity.value.date || new Date()),
      desc: newActivity.value.desc,
      status: newActivity.value.status,
      createdAt: Date.now()
    });
    
    // Reset Form
    newActivity.value = { title: '', date: '', desc: '', status: 'On Progress' };
    showForm.value = false;
  } catch (e) {
    alert("Gagal: " + e.message);
  }
};

// 3. HAPUS DATA (Delete - Hanya Admin via UI)
const deleteActivity = async (id) => {
  if (confirm("Hapus catatan aktivitas ini?")) {
    await deleteDoc(doc(db, "activities", id));
  }
};

const formatDate = (dateString) => {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};
</script>

<template>
  <div class="page-content">
    <div class="container-narrow">
      <div class="section-header" data-aos="fade-down">
        <h2>Log Aktivitas Kelompok</h2>
        <div class="line"></div>
        <p class="sub-header">Catatan progres pengerjaan tugas Literasi Digital.</p>
      </div>

      <div v-if="isLoading" class="loading-state">
        <i class='bx bx-loader-alt bx-spin'></i> Memuat data...
      </div>

      <div v-if="isAdmin" class="action-area" data-aos="fade-in">
        <button class="btn-add" @click="showForm = !showForm">
          <i class='bx' :class="showForm ? 'bx-x' : 'bx-plus'"></i> 
          {{ showForm ? 'Batal' : 'Tambah Catatan Baru' }}
        </button>
      </div>

      <transition name="slide">
        <div v-if="showForm && isAdmin" class="input-card">
          <h3>Tulis Progres Baru</h3>
          <div class="form-group">
            <label>Judul Kegiatan</label>
            <input v-model="newActivity.title" type="text" placeholder="Contoh: Rapat Koordinasi..." />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Tanggal</label>
              <input v-model="newActivity.date" type="date" />
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="newActivity.status">
                <option>On Progress</option>
                <option>Selesai</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Deskripsi Singkat</label>
            <textarea v-model="newActivity.desc" rows="3" placeholder="Apa yang dikerjakan..."></textarea>
          </div>

          <button class="btn-save" @click="addActivity">Simpan Catatan</button>
        </div>
      </transition>

      <div class="timeline">
        <div v-if="!isLoading && activities.length === 0" class="empty-state">Belum ada aktivitas.</div>

        <div v-for="act in activities" :key="act.id" class="timeline-item" data-aos="fade-left">
          <div class="timeline-dot"></div>
          <div class="timeline-date">{{ act.date }}</div>
          
          <div class="timeline-content">
            <div class="content-header">
              <h3>{{ act.title }} 
                <span class="badge" :class="{
                  'badge-done': act.status === 'Selesai',
                  'badge-progress': act.status === 'On Progress',
                  'badge-pending': act.status === 'Pending'
                }">{{ act.status }}</span>
              </h3>
              
              <button v-if="isAdmin" class="btn-del" @click="deleteActivity(act.id)">
                <i class='bx bx-trash'></i>
              </button>
            </div>
            <p>{{ act.desc }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Layout Dasar */
.page-content { padding-top: 100px; padding-bottom: 50px; min-height: 100vh; color: white; }
.container-narrow { max-width: 800px; margin: 0 auto; padding: 0 20px; }
.section-header { text-align: center; margin-bottom: 40px; }
h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; }
.line { width: 60px; height: 4px; background: #6366f1; margin: 10px auto; border-radius: 2px; }
.sub-header { color: #a1a1aa; }
.loading-state { text-align: center; color: #a1a1aa; margin: 40px 0; font-size: 1.2rem; }

/* Tombol Tambah */
.action-area { text-align: center; margin-bottom: 30px; }
.btn-add { background: #6366f1; color: white; border: none; padding: 12px 25px; border-radius: 30px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.3s; }
.btn-add:hover { transform: scale(1.05); background: #4f46e5; }

/* Form Input Card */
.input-card { background: rgba(255,255,255,0.05); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 40px; }
.input-card h3 { margin-top: 0; margin-bottom: 20px; font-family: 'Space Grotesk', sans-serif; }
.form-group { margin-bottom: 15px; }
.form-row { display: flex; gap: 20px; }
.form-row .form-group { flex: 1; }
label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: #a1a1aa; }
input, select, textarea { width: 100%; background: #18181b; border: 1px solid #3f3f46; color: white; padding: 10px; border-radius: 8px; font-family: 'Inter', sans-serif; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #6366f1; }
.btn-save { background: #10b981; color: white; border: none; width: 100%; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px; }
.btn-save:hover { background: #059669; }

/* Timeline Styles */
/* Timeline Styles Updated */
.timeline { position: relative; border-left: 2px solid rgba(236, 72, 153, 0.3); margin-left: 20px; padding-left: 30px; }
.timeline-item { position: relative; margin-bottom: 40px; }

/* Titik Bulat Timeline */
.timeline-dot { 
  width: 16px; height: 16px; 
  background: #ec4899; /* Pink */
  border-radius: 50%; 
  position: absolute; left: -39px; top: 5px; 
  border: 3px solid white; /* Border putih biar rapi */
  box-shadow: 0 0 10px rgba(236, 72, 153, 0.4); 
}

/* Tanggal */
.timeline-date { 
  font-size: 0.85rem; 
  color: #ec4899; /* Pink */
  margin-bottom: 5px; 
  font-weight: 700; 
}

/* Kotak Konten */
.timeline-content { 
  background: white; /* Background Putih Solid */
  padding: 20px; 
  border-radius: 12px; 
  border: 1px solid #fbcfe8; /* Border Pink Muda */
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.1); /* Bayangan halus */
  transition: 0.3s; 
}

.timeline-content:hover { 
  border-color: #ec4899; 
  transform: translateX(5px); 
}

/* PERBAIKAN UTAMA: Warna Teks Deskripsi */
.timeline-content p {
  color: #4a4a4a; /* Abu Gelap (Jelas Dibaca) */
  line-height: 1.6;
  margin-top: 8px;
}

.content-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.content-header h3 { margin: 0; font-size: 1.1rem; color: #ec4899; /* Judul Pink */ }
.badge { font-size: 0.75rem; padding: 3px 8px; border-radius: 10px; margin-left: 10px; vertical-align: middle; border: 1px solid transparent; }
.badge-done { background: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.2); }
.badge-progress { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }
.badge-pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border-color: rgba(245, 158, 11, 0.2); }

.btn-del { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 1.1rem; opacity: 0.6; transition: 0.2s; }
.btn-del:hover { opacity: 1; transform: scale(1.1); }
.empty-state { color: #52525b; font-style: italic; }

/* Animasi Form */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease; max-height: 500px; opacity: 1; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; padding: 0; margin: 0; }

@media (max-width: 768px) {
  .form-row { flex-direction: column; gap: 0; }
}
</style>