import { createStore } from 'vuex'

export default createStore({
  state: {
    username: localStorage.getItem("VideoChatUserName") || null, // Имя пользователя
    ws: "http://localhost:3000", // Веб сокет
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
