import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

// ICON
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { 
    faArrowRight,
    faArrowLeft,
    faMessage,
    faMicrophone,
    faVideo,
    faHeadphones,
    faDisplay,
    faPhone,
    faUser,
    faEye,
    faLock,
    faHouse,
    faCopy,
    faStar,
} from "@fortawesome/free-solid-svg-icons";

const iconList = [
    faArrowRight,
    faArrowLeft,
    faStar,
    faMessage,
    faMicrophone,
    faVideo,
    faHeadphones,
    faDisplay,
    faCopy,
    faPhone,
    faUser,
    faEye,
    faLock,
    faHouse
]

library.add(...iconList)

const app = createApp(App)

app.use(store)
app.use(router)
app.component("font-awesome-icon", FontAwesomeIcon)
app.mount('#app')
