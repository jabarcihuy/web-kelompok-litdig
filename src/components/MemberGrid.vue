<script setup>
import { ref, computed } from 'vue';

// DATA ANGGOTA KELOMPOK (Pastikan urutan Leader di awal)
const members = ref([
  { 
    id: 1, 
    name: 'Ranger Kuning', 
    role: 'Ketua', 
    img: '/ranger1.jpg',
    bio: '"Bisanya cuman ngatur doang, mentang mentang jabatannya ketua."'
  },
  { 
    id: 2, 
    name: 'Ranger Ireng', 
    role: 'Wakil Ketua', 
    img: '/ranger2.jpg',
    bio: '"Ranger ireng asli ngawi, selatan rumah pak amba belakang rumah denny caknan."'
  },
  { 
    id: 3, 
    name: 'Ranger Miaww', 
    role: 'Satwa Liar', 
    img: '/ranger3.jpg',
    bio: '"Kang maling teri, giliran dikasihani berak sembarangan."'
  },
  { 
    id: 4, 
    name: 'Ranger Pinkyy', 
    role: 'My Istri', 
    img: '/ranger4.jpg',
    bio: '"My istri gweh yang selalu cantik, dan imupp."'
  },
  { 
    id: 5, 
    name: 'Ranger Ijo', 
    role: 'Peranakan Buto ijo', 
    img: '/ranger5.jpg',
    bio: '"Tukang maling anak kecil (pedofil)."'
  }
]);

// LOGIKA LAYOUT: Pisah jadi 2 grup
// Grup Atas: 2 Orang Pertama
const topRowMembers = computed(() => members.value.slice(0, 2));
// Grup Bawah: 3 Orang Sisanya
const bottomRowMembers = computed(() => members.value.slice(2));

// MODAL LOGIC
const selectedMember = ref(null);
const openModal = (member) => selectedMember.value = member;
const closeModal = () => selectedMember.value = null;
</script>

<template>
  <div class="section-padding" id="anggota">
    <div class="container-narrow">
      <div class="section-header" data-aos="fade-down">
        <h2>Anggota Kelompok</h2>
        <div class="line"></div>
        <p class="sub-header">Tim solid di balik project Nexus 5.0</p>
      </div>

      <div class="team-layout">
        
        <div class="row-center" data-aos="fade-up">
          <div v-for="m in topRowMembers" :key="m.id" class="card" @click="openModal(m)">
            <div class="card-image">
              <img :src="m.img" :alt="m.name" loading="lazy" />
            </div>
            <div class="card-text">
              <h3>{{ m.name }}</h3>
              <div class="role-text">{{ m.role }}</div>
            </div>
          </div>
        </div>

        <div class="row-center" data-aos="fade-up" data-aos-delay="100">
          <div v-for="m in bottomRowMembers" :key="m.id" class="card" @click="openModal(m)">
            <div class="card-image">
              <img :src="m.img" :alt="m.name" loading="lazy" />
            </div>
            <div class="card-text">
              <h3>{{ m.name }}</h3>
              <div class="role-text">{{ m.role }}</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <transition name="fade">
      <div v-if="selectedMember" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-card" data-aos="zoom-in">
          <button class="close-btn" @click="closeModal"><i class='bx bx-x'></i></button>
          
          <div class="modal-img-col">
            <img :src="selectedMember.img" class="modal-img" />
          </div>
          
          <div class="modal-info-col">
            <span class="modal-role-tag">{{ selectedMember.role }}</span>
            <h2>{{ selectedMember.name }}</h2>
            <div class="separator"></div>
            
            <p class="bio-text">
              {{ selectedMember.bio }}
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.section-padding { padding: 80px 20px; }
.container-narrow { max-width: 1000px; margin: 0 auto; }
.section-header { text-align: center; margin-bottom: 50px; }
h2 { font-family: 'Space Grotesk', sans-serif; font-size: 2.5rem; margin-bottom: 10px; }
.line { width: 60px; height: 4px; background: #6366f1; margin: 0 auto 15px; border-radius: 2px; }
.sub-header { color: #a1a1aa; }

/* --- LAYOUT BARU (FLEXBOX CENTER) --- */
.team-layout {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Jarak antar baris */
}

.row-center {
  display: flex;
  justify-content: center; /* KUNCI: Membuat kartu selalu di tengah */
  gap: 20px; /* Jarak antar kartu */
  flex-wrap: wrap;
}

/* KARTU MEMBER */
.card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: 0.4s;
  width: 200px; /* Lebar fix agar rapi */
  text-align: center;
}

.card:hover { transform: translateY(-5px); border-color: #6366f1; background: rgba(255,255,255,0.05); }

.card-image { width: 100%; height: 200px; overflow: hidden; }
.card-image img { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; filter: grayscale(20%); }
.card:hover img { transform: scale(1.1); filter: grayscale(0%); }

.card-text { padding: 15px; }
.card-text h3 { font-size: 1.1rem; margin: 0 0 5px; font-weight: 600; }
.role-text { color: #6366f1; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }

/* --- MODAL STYLES (DIRAPIKAN) --- */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(8px); z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 20px; }
.modal-card { background: #131316; width: 100%; max-width: 650px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: row; position: relative; border: 1px solid #3f3f46; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

.close-btn { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; z-index: 10; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
.close-btn:hover { background: #ef4444; transform: rotate(90deg); }

.modal-img-col { width: 40%; min-height: 300px; }
.modal-img { width: 100%; height: 100%; object-fit: cover; }

.modal-info-col { width: 60%; padding: 40px 30px; display: flex; flex-direction: column; justify-content: center; text-align: left; }

/* TIPOGRAFI MODAL */
.modal-role-tag { 
  display: inline-block;
  color: #818cf8; 
  font-weight: 700; 
  font-size: 0.8rem; 
  letter-spacing: 1px; 
  text-transform: uppercase; 
  margin-bottom: 10px;
}

.modal-info-col h2 { 
  font-size: 2.2rem; 
  margin: 0 0 15px; 
  font-family: 'Space Grotesk', sans-serif; 
  line-height: 1.1; 
  color: white;
}

.separator { width: 40px; height: 3px; background: #3f3f46; margin-bottom: 20px; }

.bio-text { 
  font-size: 1rem; 
  color: #d4d4d8; 
  line-height: 1.6; 
  font-style: italic; /* Biar kayak quote */
  border-left: 3px solid #6366f1; /* Aksen garis di kiri */
  padding-left: 15px;
  margin: 0;
}

/* RESPONSIVE HP */
@media (max-width: 768px) {
  .modal-card { flex-direction: column; max-height: 85vh; overflow-y: auto; }
  .modal-img-col { width: 100%; height: 250px; }
  .modal-info-col { width: 100%; padding: 25px; }
  .row-center { gap: 15px; }
  .card { width: 45%; } /* Di HP jadi 2 kolom */
}
</style>