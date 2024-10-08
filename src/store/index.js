import { createStore } from 'vuex'

export default createStore({
  state: {
    username: localStorage.getItem("VideoChatUserName") || null, // Имя пользователя
    ws: "https://www.frtw.ru", // Веб сокет
  },
  getters: {
  },
  mutations: {
    // Поменять имя пользователю
    setUsername(state, value) {
      state.username = value 
    }
  },
  actions: {
  },
  modules: {
  }
})
