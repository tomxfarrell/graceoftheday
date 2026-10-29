import { createApp } from 'vue'
import './scss/style.scss';
import App from './App.vue'
import router from './router'
import { reveal } from './reveal'


const app = createApp(App)

app.use(router)
app.directive('reveal', reveal)

// Mount once the first page's code has arrived, so the header and footer never show alone;
// by then the page's own loader is drawn, and the one in index.html can go
router.isReady().then(() => {
  app.mount('#app')
  document.getElementById('boot-loader')?.remove()
})
