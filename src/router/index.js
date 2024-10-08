import { createRouter, createWebHistory } from 'vue-router'
import store from "@/store"

const routes = [
  {
    path: '/', name: 'HomeView', meta: {
      header: true, footer: true,
    },
    component: () => import("../views/HomeView.vue")
  },
  {
    path: '/create-room', name: 'createRoom', meta: {
      header: true, footer: true,
    },
    component: () => import("../views/CreateRoomView.vue")
  },
  {
    path: '/room/:roomID', name: 'roomView', meta: {
      header: false, footer: true,
    },
    component: () => import("../views/RoomView.vue")
  },
  {
    path: '/room-finished', name: 'roomFinished', meta: {
      header: true, footer: true,
    },
    component: () => import("../views/RoomFinished.vue")
  },
  {
    path: '/settings', name: 'SettingsView', meta: {
      header: true, footer: true,
    },
    component: () => import("../views/SettingsView.vue")
  },
  {
    path: '/auth', name: 'AuthView', meta: {
      header: false, footer: false,
    },
    component: () => import("../views/AuthView.vue")
  },
  {
    path: '/error', name: 'ErrorView', meta: {
      header: true, footer: false,
    },
    component: () => import("../views/ErrorView.vue")
  },
  {
    path: "/:pathMatch(.*)*", name: "notFound", meta: {
      header: true, footer: true,
    },
    component: () => import("../views/404View.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const name = store.state.username
  console.log("to", to, "from", from, "next", next)
  // Если пользователь авторизирован нельзя переходить на авторизацию
  if (name && to.name === "AuthView") { next({ name: "HomeView" }); }
  // Если пользователь не вошел показывать авторизацию
  else if (!name && to.name !== "AuthView") {  next(
    { name: "AuthView", }
  ); } 
  else { next(); }
})

export default router