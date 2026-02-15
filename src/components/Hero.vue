<template>
  <header class="hero">
    <div class="hero-content" data-aos="fade-up">
      <span class="tagline">KELOMPOK 1 - LITERASI DIGITAL</span>
      <h1 class="main-title">SOCIETY 5.0 & <br> <span class="gradient-text">HUMANITY</span></h1>
      <p class="description">
        Mengupas tuntas hubungan manusia dengan teknologi di era Revolusi Industri 4.0 menuju Society 5.0.
      </p>
      <div class="scroll-indicator">
        <span>Scroll Down</span>
        <i class='bx bx-down-arrow-alt floating'></i>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* CSS Hero */
.hero { height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 0 20px; color: white; }
.main-title { font-family: 'Space Grotesk', sans-serif; font-size: 4rem; font-weight: 700; line-height: 1.1; margin: 20px 0; }
.gradient-text { background: linear-gradient(to right, #6366f1, #ec4899); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.tagline { color: #6366f1; letter-spacing: 3px; font-weight: 700; font-size: 0.9rem; font-family: 'Space Grotesk', sans-serif; }
.description { font-size: 1.1rem; color: #d4d4d8; max-width: 600px; margin: 0 auto 40px; font-family: 'Inter', sans-serif;}
@media (max-width: 768px) { .main-title { font-size: 2.5rem; } }
</style>