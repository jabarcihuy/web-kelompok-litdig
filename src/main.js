import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Import Animasi AOS
import AOS from 'aos'
import 'aos/dist/aos.css'

const app = createApp(App)

// Setting Animasi
AOS.init({
    duration: 800, // Kecepatan animasi
    once: true,    // Animasi cuma sekali biar ga pusing
    offset: 50
})

app.mount('#app')