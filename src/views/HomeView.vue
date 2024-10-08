<template>
<!-- <a href="#" @click="goToRouteCreateRoom" style="display: block;">da</a> -->
  <div class="home"> 
    <div class="container">

      <div class="home__buttons">
          <button class="btn" v-if="createRoom['active']" @click.prevent="createRoom['active'] = false">Все комнаты</button>
          <button class="btn" v-else @click="createRoom['active'] = true">Создать комнату</button>
      </div>
      
      <div class="home__inner">

        <!-- <Teleport to=".header__teleport"> -->
        <!-- </Teleport> -->
        
        <div class="home__create-room" v-if="createRoom['active']">
          <div class="home__create-room__inner">
            <h1 class="title home__title"><span class="span--green">Создание</span> комнаты</h1>

            <div class="box">
              <label class="label" for="name">Название комнаты *</label>
              <input type="text" @keyup.enter="goToRouteCreateRoom" id="name" v-model="createRoom['name']" class="input--text" placeholder="Введите название комнаты">
            </div>
            <label for="name" class="error" v-if="errors['name']">{{ errors['name'] }}</label>
            
            <div>
              <button v-if="!createRoom['passwordActive']" class="btn" @click="createRoom['passwordActive'] = true">Поставить пароль</button>
              <button v-else class="btn" @click="createRoom['passwordActive'] = false">Без пароля</button>
            </div>
            
            <template v-if="createRoom['passwordActive']">
              <div class="box">
                <label class="label" for="password">Введите пароль*</label>
                <input id="password" type="text" v-model="createRoom['password']" class="input--text" placeholder="Введите пароль">
              </div>
              <label for="password" class="error" v-if="errors['password']">{{ errors['password'] }}</label>
            </template>

            <button class="btn" @click.prevent="goToRouteCreateRoom">Создать комнату</button>
          </div>

        </div>
        
        <div class="home__info" v-else>
          <h1 class="title home__title" v-if="!rooms.length"><span class="span--green">Все</span> комнаты пусты</h1>
          <h1 class="title home__title" v-else><span class="span--green">Все</span> комнаты</h1>
          <div class="box" v-if="rooms.length">
            <label class="label" for="search">Поиск: </label>
            <input type="text" id="search" class="input--text home__search" placeholder="Поиск..." v-model="search">
          </div>
          <ul class="home__list">
            <li class="home__list-item" v-for="room in roomsComputed" :key="room.key">
              
              <!-- Пароль -->
              <div class="home__list-item--box" v-if="passwordForm['active'] && passwordForm['key'] === room['key']">
                <h3>Вход в комнату</h3>
                <input id="enter__password" type="text" class="input--text" placeholder="Введите пароль" v-model="passwordForm['password']">
                <div class="home__list-item--box--btn">
                  <button class="btn" @click="enterRoom(room)">Войти</button>
                  <button class="btn" @click.prevent="passwordForm['active'] = false, passwordForm['key'] = null">Отмена</button>
                </div>
              </div>

              <!-- Без пароля -->
              <div v-else class="home__list-item--box">
                <div class="home__list-item--btns">
                  <div class="home__list-item--icon">
                    <font-awesome-icon icon="lock" v-if="room.password && room.password.length > 0"/>
                  </div>
                  <div class="home__list-item--icon">
                    <font-awesome-icon icon="eye" />
                    {{ room.sizeUser }}
                  </div>
                </div>

                <div class="home__list-item__info">
                  <div class="home__list-item--name">{{ room["name"] }}</div>
                  <button class="home__list-item--btn btn" @click="enterRoom(room)">Войти</button>
                </div>
              </div>
                  
                
              </li>
          </ul>
          </div>
        </div>        

    </div>
  </div>
</template>

<script setup>
  import { ref, computed, } from "vue"
  import { useRouter } from "vue-router"
  import socketIOClient from "socket.io-client"
  import { useStore } from "vuex"

  const store = useStore()
  const WS = store.state.ws

  const ws = socketIOClient(WS)
  const router = useRouter()
  const rooms = ref([])
  const errors = ref({})
  const search = ref("")
  // Форма создания комнаты
  const createRoom = ref({
    name: "",
    active: false,
    passwordActive: false,
    password: "",
  })
  // Форма для ввода пароля
  
  const passwordForm = ref({
    active: false,
    key: "",
    password: "",
    next: "", // Url для перехода на другую страницу
  })
 
  // Поиск
  const roomsComputed = computed(() => {
    return rooms.value.filter((e) => {
      if (e.sizeUser > 0) { return e.name.toLowerCase().includes(search.value.toLowerCase()); }
    })
  })

  // Войти в комнату
  const enterRoom = (room) => {
    passwordForm.value["next"] = `room/${room['key']}?name=${room['name']}&roomID=${room['key']}`
    if (room.password.length > 0) {
      passwordForm.value['active'] = true
      passwordForm.value["key"] = room.key
      ws.emit("room-check-password", { roomID: room.key, password: passwordForm.value.password })
    } else {
      router.push(passwordForm.value.next + `&password=`)
    }
  }

  ws.on("room-password-correct", () => {
    router.push(passwordForm.value.next + `&password=${passwordForm.value.password}`)
  });

  ws.on("room-password-incorrect", ({ roomID }) => {
    console.log("Пароль не подошел, можно присоединяться к комнате", roomID)
  })

  const goToRouteCreateRoom= () => {
    // visibleCreateRoom.value = true
    errors.value = {}
    const name = createRoom.value["name"].trim()
    if (!name || !name.length) {
      errors.value["name"] = "Ошибка. Название не должно быть пустым"
    } else if (name.length < 3 || name.length > 50) {
      errors.value["name"] = "Ошибка. Название должно быть больше 3 символов и меньше 50"
    }
    const password = createRoom.value["password"].trim()
    if (createRoom.value["passwordActive"]) {
      if (!password || !password.length) {
        errors.value["password"] = "Ошибка. Пароль не должно быть пустым"
      } else if (password.length < 3 || password.length > 50) {
        errors.value["password"] = "Ошибка. Пароль должно быть больше 3 символов и меньше 50"
      }
    }
    if (Object.keys(errors.value).length > 0) {
      return
    }
    router.push({
      path: "/create-room", 
      query: { name: name, password: password},
    })
  }

  // Функция получения всех комнат
  const getRooms = ({ rooms: roomsData }) => {
    console.log("HomeView: ", roomsData)
    for (const room in roomsData) {
      rooms.value.push(roomsData[room])
    }
  }

  // Получение новой комнаты
  const getRoomsNew = ({ key, name, sizeUser, password }) => {
    rooms.value.push({ key, name, sizeUser, password })
  }

  const updateRoom = ({ key, name, sizeUser }) => {
    console.log("update, ", key, name, sizeUser)
    const item = rooms.value.find((e) => e.key === key)
    if (item) {
      item["sizeUser"] = sizeUser
      if (item.sizeUser <= 0) {
        rooms.value = rooms.value.filter((room) => room.key !== item.key)
      }
    }
  }

  ws.on("getRooms", getRooms) // Получение комнат
  ws.on("getRoomsNew", getRoomsNew) // Только что созданная комната
  ws.on("updateRoom", updateRoom) // Обновление 1 комнаты
  
</script>

<style lang="scss">
  .header__teleport {
    font-size: 0.875rem;
  }
  .home {
    &__create-room {
      width: 100%;
    }
    &__create-room__inner {
      display: flex;
      gap: 15px;
      flex-direction: column;
      border-radius: var(--border-radius-default);
      background: var(--clr-tertiary);
      align-items: center;
      padding: 10px 0;
    }
    &__search {
      width: 100%;
      border-radius: 0%;
      border-top-right-radius: var(--border-radius-default);
    }
    &__inner {
      display: flex;
    }
    &__info {
      width: 100%;
      position: relative;
    }
    &__video {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
    &__content {
      cursor: pointer;
      position: absolute;
      top: 0;
      width: 100%;
      color: var(--clr-tertiary);
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.1);
    }
    &__title {
      &-icon {
        width: 40px;
        height: 40px;
        background-color: var(--clr-tertiary);
        padding: 5px;
        border-radius: 4px;
      }
    }
    // List
    &__list {
      padding: 10px 0;
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      &-title {
        margin-bottom: 15px;
      } 
      &-main, &-item {
        width: 100%;
      }
      &-item {
        width: 100%;
        border: 2px solid var(--clr-secondary);
        border-radius: var(--border-radius-default);
        background-color: white;
        min-height: 115px;
      }
      &-item--box {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 10px;
        height: 100%;
        justify-content: space-evenly;
        & input {
          border-radius: var(--border-radius-default);
        }
      }
      &-item--btns {
        border-bottom: 2px solid var(--clr-secondary);
        margin: 0 0 5px;
        padding: 0 0 5px;
      }
      &-item--box--btn {
        display: flex;
        justify-content: space-between;
        gap: 5px;
        & .btn { width: 100%; }
      }
      &-item--input {
        width: 100%;
      }
      &-item--box--form {
        display: flex;
        align-items: center;
        width: 80%;
        gap: 5px;
      }
      &-item--name {
        font-weight: 600;
        margin: 0 0 5px;
      }
      &-item--users {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      &-item--icon {
        margin: 0 5px 0 0;
        border: 2px solid var(--clr-secondary);
        padding: 0 10px;
        border-radius: 4px;
        display: inline-block;
        & > .svg__icon {
          width: 20px;
          height: 20px;
        }
        & svg path {
          stroke: var(--clr-secondary);
        }
      }
      &-item--users {
        border-left: 2px solid var(--clr-secondary);
        padding: 10px;
        margin-left: auto;
      }
    }
  }
  @media screen and (max-width: 900px) {
    .home__list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media screen and (max-width: 600px) {
    .home__list {
      grid-template-columns: repeat(1, 1fr);
    }
  }
</style>