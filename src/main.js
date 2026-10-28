import { createApp } from 'vue'
import './scss/style.scss';
import App from './App.vue'
import router from './router'
import { reveal } from './reveal'


const app = createApp(App)

app.use(router)
app.directive('reveal', reveal)

app.mount('#app')
