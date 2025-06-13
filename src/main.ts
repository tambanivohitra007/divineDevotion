import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import 'bootstrap/dist/css/bootstrap.min.css' // Keep this for base styles, or remove if fully custom
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// import './style.css' // Ensure this is imported if it contains global styles

const app = createApp(App)

app.use(i18n)
app.mount('#app')
