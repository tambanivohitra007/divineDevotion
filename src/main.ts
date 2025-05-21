import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css' // Keep this for base styles, or remove if fully custom
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// import './style.css' // Ensure this is imported if it contains global styles

const app = createApp(App)

app.mount('#app')
