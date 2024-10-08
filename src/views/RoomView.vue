<template>
  <div class="room"> 
    <AppAlert v-if="alertMessage.visible" @hide="isVisibleAlertMessageHideFunc" :message="alertMessage.message"/>

      <div class="room__inner">
        
        <div class="room__inner-info">
          <div id="video__grid" class="video__grid">

            <AppVideo 
              v-for="video in videos"
              :key="video.user"
              :srcObject="video.stream"
              :muted="video.peerID === user.id"
              :videoID="`${video.peerID}`"
              :name="video.username"
              
              :isMe="video.isMe || false"
              
              :audioActive="!video.audioEnabled"
              :videoActive="!video.videoEnabled"
              :headphoneActive="!video.videoHeadphone"
              :screenShareActive="!video.videoScreenShare"
            />

          </div>
        </div>

        <div class="video__input">
          <!-- Аудио Видео ВКЛ -->
          <template v-if="user.inputEnabled">
            <button  class="btn" :class="{'svg__icon--disabled': !user.audio.enabled}" @click.prevent="toggleAudio"><font-awesome-icon icon="microphone"/></button>
            <button  class="btn" :class="{'svg__icon--disabled': !user.video.enabled}" @click.prevent="toggleVideo"><font-awesome-icon icon="video"/></button>
            <button  class="btn" :class="{'svg__icon--disabled': !user.headphone.enabled}" @click.prevent="toggleheadphone"><font-awesome-icon icon="headphones"/></button>
            <button  class="btn" :class="{'svg__icon--active': !user.screenshare.enabled}" @click.prevent="toggleScreenShare"><font-awesome-icon icon="display"/></button>
          </template>
          <!-- Аудио Видео ВЫКЛ -->
          <template v-else>
            <button  class="btn" @click.prevent="copyKeyRoom">Включить микрофон</button >
            <button  class="btn" :class="{'svg__icon--disabled': input.audioEnabled }" @click.prevent="input.audioEnabled = !input.audioEnabled, videoToggleSound(input.audioEnabled)"><font-awesome-icon icon="headphones"/></button>
          </template>
          <button  class="btn" @click.prevent="copyKeyRoom"><font-awesome-icon icon="copy"/></button >
          <button  class="btn" @click.prevent="router.push('/room-finished')"><font-awesome-icon icon="phone"/></button>
          </div>
      </div>

      <!-- Right Side -->
      <!-- <AppArrow class="room__exit" v-if="room.sideActive" :class="{ 'room__exit--active': room.sideActive }" @click.prevent="room.sideActive = !room.sideActive"/> -->
      <font-awesome-icon class="room__exit" icon="arrow-right" v-if="room.sideActive" @click.prevent="room.sideActive = !room.sideActive"/>
      <div class="room__side" v-if="!room.sideActive">
        <div class="room__chat-container">
          <div class="room__chat-header">
            <!-- <AppArrow class="room__exit" :class="{ 'room__exit--active': room.sideActive }" @click.prevent="room.sideActive = !room.sideActive"/> -->
            <font-awesome-icon class="room__exit" icon="arrow-left" @click.prevent="room.sideActive = !room.sideActive"/>
            <AppLogo :enabled="false"></AppLogo>:
            <h4 class="room__side-name">{{ room.name }}</h4> 
          </div>
          <div class="room__chat-area">
            <div class="room__chat-messages">

              <div v-for="(msg, idx) in room.messages" :key="idx">
                <ChatMessage
                  :message="msg['message']"
                  :username="msg['username']"
                  :my="user.id === msg['peerID']"
                />
              </div>

            </div>
            <div class="room__chat-area__wrapper">
              <div class="room__chat-area__typing">
                <input v-model="room.inputMessage" @keyup.enter="submitMessage" type="text" placeholder="Введите сообщение..." class="input--text" />
                <button class="btn" @click.prevent="submitMessage">
                  <font-awesome-icon icon="message" />
                  <!-- <AppMessage /> -->
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
    <!-- </div> -->
  </div>
</template>

<script setup>
  import AppLogo from "@/components/AppLogo.vue"
  import AppVideo from "@/components/AppVideo.vue" // Видео
  // import AppNoVideo from "@/components/AppNoVideo" // Без видео
  import ChatMessage from "@/components/chat/ChatMessage.vue"
  import AppAlert from "@/components/AppAlert.vue"
  import { onUnmounted, onMounted, ref } from "vue"
  import { useRoute, useRouter } from "vue-router"
  import { v4 as uuidV4 } from "uuid"
  import socketIOClient from "socket.io-client"
  import Peer from "peerjs"
  import { useStore } from "vuex"

  // Глобальные переменные
  const store = useStore()
  // Адрес сервера 
  const WS = store.state.ws
  // Подключение к серверу 
  const ws = socketIOClient(WS)
  // Текущий роут
  const route= useRoute()
  const router = useRouter()
  // Пользователь
  const meID = uuidV4() 
  const user = ref({
    id: meID,
    peerID: new Peer(meID),
    inputEnabled: false, // Показ кнопок
    stream: null,
    audio: { enabled: null, },
    video: { enabled: null, },
    headphone: { enabled: null, },
    screenshare: { enabled: null, stream: null }
  })
  // Комната
  const room = ref({
    id: route.query.roomID,
    name: route.query.name,
    sideActive: false,
    messages: [],
    inputMessage: "",
    interval: {
      enabled: true, 
      size: 2000, 
    }
  })
  // Кнопки
  const input = ref({
    audioEnabled: false,
  })
  // Все видео
  const videos = ref([])
  // const noVideos = ref([])
  // Предупреждение 
  const alertMessage = ref({
    message: "",
    visible: false,
  })
  const oldParticipants = ref([]) // Пользователи которые уже были когда мы зашли


  // ========== ВИДЕО
  // Пользователь без видео
// const createdCard = ({ peerID, username }) => {
  // const findUserNoVideos = noVideos.value.find((e) => e.peerID === peerID);
  // const findUserVideos = videos.value.find((e) => e.peerID === peerID);

  // Если пользователь уже существует в noVideos или videos, то ничего не делаем
  // if (findUserNoVideos || findUserVideos) {
    // return;
  // }

  // Добавляем пользователя в noVideos, если он не найден
  // noVideos.value.push({ peerID, username: username || "Без имени" });
// };
  // ========---------========
  
  // Функция создания пустого видео
  const createEmptyStream = ({ username, peerID }) => {
    // Создаем пустой аудио-контекст и генератор сигнала
    const  audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const dst = audioContext.createMediaStreamDestination();

    oscillator.connect(dst);
    oscillator.start();
    const audioTrack = dst.stream.getAudioTracks()[0];
    // Создаем пустой видеопоток, используя canvas
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const videoStream = canvas.captureStream();
    const videoTrack = videoStream.getVideoTracks()[0];

    // Возвращаем новый MediaStream, состоящий из пустых аудио и видео треков
    return { stream: new MediaStream([audioTrack, videoTrack]), username, peerID }
  }
  // ========---------========
  
  // Создание видео 
// Создание видео для пользователя
const createdVideo = ({ stream, peerID, username, audio, video, headphone, screenshare, isMe }) => {
  const findUserVideos = videos.value.find((e) => e.peerID === peerID);

  // Если пользователь уже существует в videos, обновляем его данные
  if (findUserVideos) {
    findUserVideos.stream = stream || new MediaStream();
    findUserVideos.audioEnabled = audio !== undefined ? audio : true;
    findUserVideos.videoEnabled = video !== undefined ? video : true;
    findUserVideos.videoHeadphone = headphone !== undefined ? headphone : true;
    findUserVideos.videoScreenShare = screenshare !== undefined ? screenshare : true;
    return;
  }

  // Удаляем пользователя из noVideos, если он уже был там
  // noVideos.value = noVideos.value.filter((e) => e.peerID !== peerID);

  let videoObject = {}
  if (!stream) {
    const emptyStream = createEmptyStream({ username, peerID })
    videoObject = {
      isMe: isMe !== undefined ? isMe : false,
      stream: emptyStream.stream,
      peerID,
      username: username || "Без имени",
      audioEnabled: audio !== undefined ? audio : true,
      videoEnabled: video !== undefined ? video : true,
      videoHeadphone: headphone !== undefined ? headphone : true,
      videoScreenShare: screenshare !== undefined ? screenshare : true,
    }
  } else {
    videoObject = {
      isMe: isMe !== undefined ? isMe : false,
      stream: stream,
      peerID,
      username: username || "Без имени",
      audioEnabled: audio !== undefined ? audio : true,
      videoEnabled: video !== undefined ? video : true,
      videoHeadphone: headphone !== undefined ? headphone : true,
      videoScreenShare: screenshare !== undefined ? screenshare : true,
    }
  }
  videos.value.push(videoObject)

  // videos.value.push({
  //   isMe: isMe !== undefined ? isMe : false,
  //   stream: stream || emptyStream,
  //   peerID,
  //   username: username || "Без имени",
  //   audioEnabled: audio !== undefined ? audio : true,
  //   videoEnabled: video !== undefined ? video : true,
  //   videoHeadphone: headphone !== undefined ? headphone : true,
  //   videoScreenShare: screenshare !== undefined ? screenshare : true,
  // });
};
  // ========---------========

  // Функция удаления видео
  // Удаление видео пользователя
// const removeVideo = (peerID) => {
  // Находим и удаляем элемент из массива видео
  // videos.value = videos.value.filter((e) => e.peerID !== peerID);
  // Также удаляем из noVideos, если такой пользователь был
  // noVideos.value = noVideos.value.filter((e) => e.peerID !== peerID);
// };
  
  const removeVideo = (peerID) => {
    const videoElementBox = document.getElementById(peerID)
    if (videoElementBox) {
      videoElementBox.childNodes[0].srcObject.getTracks().forEach(track => track.stop())  // Остановка всех потоков
      videoElementBox.remove()
    }
  }
  // ========---------========
  // ========== END ВИДЕО



  // ========== КНОПКИ ВКЛ\ВЫКЛ (МИКРОФОН КАМЕРА НАУШНИКИ ТД)
  // Отключение звука микрофона
  const toggleAudio = () => {
    const audioEnabled = !user.value.audio.enabled
    user.value.audio.enabled = audioEnabled
    toggleTracks(user.value.stream.getAudioTracks(), audioEnabled)
    ws.emit("toggle-audio-room", { roomID: room.value.id, peerID: user.value.id, enabled: audioEnabled })
  }
  // ========---------========

  // Отключение у определенного элемента
  ws.on("toggle-audio-room", ({ peerID, enabled }) => {
    const userIndex = userFindIndex({ peerID: peerID })
    if (userIndex !== -1) { videos.value[userIndex].audioEnabled = enabled; }
  })
  // ========---------========

  // Отключение видео
  const toggleVideo = () => {
    const videoEnabled = !user.value.video.enabled
    user.value.video.enabled = videoEnabled
    toggleTracks(user.value.stream.getVideoTracks(), videoEnabled);
    ws.emit("toggle-video-room", { roomID: room.value.id, peerID: user.value.id, enabled: videoEnabled })
  }
  // ========---------========

  // Отключение у определенного элемента
  ws.on("toggle-video-room", ({ peerID, enabled }) => {
    const userIndex = userFindIndex({ peerID: peerID })
    if (userIndex !== -1) { videos.value[userIndex].videoEnabled = enabled; }
  })
  // ========---------========

  // Отключить звук
  const toggleheadphone = () => {
    // user.value.headphone.enabled = !user.value.headphone.enabled
    const videoHeadphone = !user.value.headphone.enabled
    user.value.headphone.enabled = videoHeadphone
    // Выкл
    if (!videoHeadphone) {
      if (user.value.audio.enabled) { toggleAudio() }
      videoToggleSound(true)
    } else { // Вкл
      videoToggleSound(false)
    }
    ws.emit("toggle-headphone-room", { roomID: room.value.id, peerID: user.value.id, enabled: videoHeadphone })
  }
  // ========---------========

  // Отключение у определенного элемента
  ws.on("toggle-headphone-room", ({ peerID, enabled }) => {
    const userIndex = userFindIndex({ peerID: peerID })
    if (userIndex !== -1) { videos.value[userIndex].videoHeadphone = enabled; }
  })
  // ========---------========

    // Вкл\Выкл трансляция экрана
  const toggleScreenShare = async () => {
    const videoScreenShare = !user.value.screenshare.enabled
    user.value.screenshare.enabled = videoScreenShare
    if (!videoScreenShare) { // Вкл
      try {
        const streamRes = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        const videoTrack = streamRes.getVideoTracks()[0]
        const audioTracks = user.value.stream.getAudioTracks()
        const combinedStream = new MediaStream([videoTrack, ...audioTracks]);
        user.value.stream = combinedStream;
        document.getElementById(`${user.value.id}--video`).srcObject = user.value.stream
        user.value.screenshare.enabled = false;
      } catch (error) {
        console.error("Error accessing display media:", error);
        user.value.screenshare.enabled = true;
        const streamRes = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoTrack = streamRes.getVideoTracks()[0];
        const audioTracks = user.value.stream.getAudioTracks();
        const combinedStream = new MediaStream([videoTrack, ...audioTracks]);
        user.value.stream = combinedStream;
        // document.querySelector(".video--my").srcObject = user.value.stream;
        // document.getElementById(`${user.value.id}--video`).firstChild.srcObject = user.value.stream
        document.getElementById(`${user.value.id}--video`).srcObject = user.value.stream
      }
    } else { // Выкл
      user.value.stream.getVideoTracks().forEach((e) => e.stop())
      const streamRes = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const videoTrack = streamRes.getVideoTracks()[0];
      const audioTracks = user.value.stream.getAudioTracks();
      const combinedStream = new MediaStream([videoTrack, ...audioTracks]);
      user.value.stream = combinedStream;
      // document.querySelector(".video--my").srcObject = user.value.stream
      // document.getElementById(`${user.value.id}--video`).firstChild.srcObject = user.value.stream
      document.getElementById(`${user.value.id}--video`).srcObject = user.value.stream
      user.value.screenshare.enabled = true
    }

    ws.emit("toggle-screnshare-room", { roomID: room.value.id, peerID: user.value.id, enabled: videoScreenShare })
    // ========---------========

    // Replace video track in existing peer connections
    Object.keys(user.value.peerID?.connections).forEach((connectionKey) => {
      const connection = user.value.peerID.connections[connectionKey]
      if (connection && connection[0] && connection[0].peerConnection) {
        const videoTrack = user.value.stream?.getTracks().find((track) => track.kind === "video");
        if (videoTrack) {
          connection[0].peerConnection.getSenders().forEach((sender) => {
            if (sender.track && sender.track.kind === "video") {
              sender.replaceTrack(videoTrack).catch((err) => {
                console.log("Error replacing video track:", err)
              });
            }
          });
        }
      } else {  
        console.log("Invalid connection:", connection);
      }
    });
    // ========---------========
    
    // Update audio and video track states
    toggleTracks(user.value.stream.getAudioTracks(), user.value.audio.enabled);
    toggleTracks(user.value.stream.getVideoTracks(), user.value.video.enabled);
    // ========---------========
  };
  // ========---------========
  // ========== END КНОПКИ ВКЛ\ВЫКЛ (МИКРОФОН КАМЕРА НАУШНИКИ ТД)



  // ========== СООБЩЕНИЯ
  // Функция отправки сообщений 
  const submitMessage = () => {
    const message = room.value.inputMessage.trim()
    if (!message.length || !room.value.interval.enabled) { return }
    console.log(room.value.interval)
    ws.emit("send-message", { roomID: room.value.id, peerID: user.value.id, message, username: store.state.username })
    room.value.messages.push({ message, peerID: user.value.id, username: store.state.username })
    room.value.inputMessage = ""
    room.value.interval.enabled = false
    setTimeout(() => {
      room.value.interval.enabled = true
    }, room.value.interval.size);
  }
  // ========---------========

  // Получение чужих сообщений
  ws.on("get-message", ({ message, peerID, username }) => {
    console.log("Получение чужого сообщения", message, peerID, username)
    room.value.messages.push({ message, peerID, username })
  })
  // ========---------========
  
  // Получение всех сообщений 
  ws.on("get-messages", ({ messages: oldMessages }) => {
    room.value.messages = [...room.value.messages, ...oldMessages]
  })
  // ========---------========
  // ========== END СООБЩЕНИЯ



  // ========== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ  
  // Отключить сообщение
  const isVisibleAlertMessageHideFunc = () => { 
    alertMessage.value.visible = false
    alertMessage.value.message = ""
  }
  // ========---------========
  // Показать сообщение 
  const isVisibleAlertMessageShowFunc = (message) => {
    alertMessage.value.visible = true
    alertMessage.value.message = message
  }
  // ========---------========
  // Функция копирования url комнаты
  const copyKeyRoom = () => {
    navigator.clipboard.writeText(window.location.href)
    isVisibleAlertMessageShowFunc("Комната скопирована")
  }
  // ========---------========
  // Функция для переключения состояния tracks.en = enabled
  const toggleTracks = (tracks, enabled) => {
    tracks.forEach(track => { track.enabled = enabled; });
  };
  // ========---------========
  // Отключить весь звук на странице 
  const videoToggleSound = (fl) => {
    console.log("fl ", fl)
    document.querySelectorAll("video").forEach((e) => {
      if (`${user.value.peerID._id}--video` === e.id) { return }
      e.muted = fl
    })
  }
  // ========---------========
  // Поиск определенного человека
  const userFindIndex = ({ peerID }) => videos.value.findIndex((user) => user.peerID === peerID)
  // ========---------========
  
    // Получение пользователей
  const getUsers = ({ participants }) => {
    participants.forEach((user) => {
      const userFindVideos = videos.value.findIndex((e) => e.peerID === user.peerID)
      if (userFindVideos !== -1) {
        // Пользователь с видео
        videos.value[userFindVideos].audioEnabled = user.audio;
        videos.value[userFindVideos].videoEnabled = user.video;
        videos.value[userFindVideos].videoHeadphone = user.headphone;
        videos.value[userFindVideos].videoScreenShare = user.screenshare;
      }
      else {
        createdVideo({ username: user.username, audio: user.audio, screenshare: user.screenshare, video: user.video, peerID: user.peerID })
      }
    });
  };
  // ========---------========

  // ========== END ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ  



  // ========== ОБРАЩЕНИЕ К СЕРВЕРУ  
  // Отключение пользователя
  ws.on("user-disconnected", ({ peerID }) => {
    removeVideo(peerID)
    // Удаление пользователя
    videos.value = videos.value.filter((e) => e.peerID !== peerID)
    // noVideos.value = noVideos.value.filter((e) => e.peerID !== peerID)
  })
  // ========---------========

  // Подключение пользователя без камеры
  ws.on("no-broadcast", ({ username, peerID }) => {
    createdVideo({ username, peerID, audio: false, video: false, screenshare: false, })
    // noVideos.value.push({ username, peerID })
  })

  // Транслирование экрана
  ws.on("screen-share", ({ streamID }) => {
    try {
      console.log("server-share client: ", streamID)
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const deviceInfo = devices.find(e => e.deviceId === streamID)
        if (deviceInfo) {
          navigator.mediaDevices.getUserMedia({ video: { deviceId: streamID } }).then((stream) => {
            console.log("video created_4", stream)
          })
        }
      })
    } catch (error) {
      console.log(error)
    }
  })
  // ========---------========

  // Запуск когда присоединяется другой пользователь 
  ws.on("user-joined", ({ peerID, username }) => {
    console.log("userJoined: ", user.value)
    const metadata =  {
      username: store.state.username, 
      audio: user.value.audio.enabled,
      video: user.value.video.enabled,
      headphone: user.value.headphone.enabled,
      screenshare: user.value.screenshare.enabled,
    } 
    if (user.value.inputEnabled) { // Аудио и Видео включено
      const call = user.value.peerID.call(peerID, user.value.stream, { metadata })
      if (call) {
        call.on("stream", (peerStream) => {
          createdVideo({ stream: peerStream, peerID: peerID, username })
          if (!user.value.headphone.enabled) { videoToggleSound(true); }
        })
        call.on("error", (err) => { console.log("Error in call", err); })
        call.on("close", () => { console.log("Call closed"); })
      } else {
        console.warn("Failed to create call")
      } 
    } else { // Аудио и видео заблокировано
      const video = createEmptyStream({ username: store.state.username, peerID: peerID })
      const call = user.value.peerID.call(peerID, video.stream, { metadata })
      if (call) {
        call.on("stream", (peerStream) => {
          createdVideo({ stream: peerStream, peerID: peerID, username, })
        })
      }
    }
  })
  // ========---------========

  // Отключение у определенного элемента
  ws.on("toggle-screnshare-room", ({ peerID, enabled }) => {
    const userIndex = userFindIndex({ peerID: peerID })
    if (userIndex !== -1) { videos.value[userIndex].videoScreenShare = enabled; }
  })
  // ========== END ОБРАЩЕНИЕ К СЕРВЕРУ  

  // ========== ПОДКЛЮЧЕНИЕ 
  onMounted(async () => {    
    ws.on("error-room", ({ message, status }) => {
      router.push({ path: "/404", params: {message: message, status: status, } })
    })
    // ========---------========

    ws.on("room-password", ({ status }) => { // Проверка пароля комнаты
      if (status === 400) { router.push("/404"); }
    })
    // ========---------========
    
    // Функция для запроса камеры и видео
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((streamRes) => {
      console.log("helLOQOWe-iqwe ajijewi fjieajfr")
      user.value.stream = streamRes
      user.value.audio.enabled = true
      user.value.video.enabled = true
      user.value.headphone.enabled = true
      user.value.screenshare.enabled = true
      user.value.inputEnabled = true
      createdVideo({ stream: user.value.stream, streamClass: "video--my", peerID: user.value.id, username: store.state.username, isMe: true, })
      // ========---------========
    })
    .catch((error) => {
      console.log('Пользователь отключил камеру: ', error)
      user.value.stream = null
      user.value.audio.enabled = false
      user.value.video.enabled = false
      user.value.headphone.enabled = true
      user.value.screenshare.enabled = false
      user.value.inputEnabled = false
      createdVideo({ stream: user.value.stream, streamClass: "video--my", peerID: user.value.id, audio: false, video: false, screenshare: false, username: store.state.username, isMe: true })
      ws.emit("no-broadcast", { roomID: room.value.id, peerID: user.value.id, username: store.state.username, })
    })
    .finally(() => {
      // Подключение к серверу после получения разрешений
      if (user.value.inputEnabled) {
        ws.emit("join-room", { roomID: room.value.id, peerID: user.value.id, password: route.query.password, username: store.state.username, audio: true, video: true, screenshare: true, })
      } else {
        ws.emit("join-room", { roomID: room.value.id, peerID: user.value.id, password: route.query.password, username: store.state.username, audio: false, video: false, screenshare: false, })
      }
      // Пользователи которые были уже в комнате 
      ws.on("get-users", ({ participants }) => { 
        console.log("participants", participants)
        oldParticipants.value = participants
      })
      // Сообщение в чате
      room.value.messages.push({ message: `Добро пожаловать в комнату: ${room.value.name}`, peerID: user.value.id, username: store.state.username })
      user.value.peerID.on("call", (call) => {
        call.answer(user.value.stream)
        console.log("call", call)
        // Получение имени пользователя
        call.on("stream", (peerStream) => {
          console.log("test: ", call)
          createdVideo({ stream: peerStream, peerID: call.peer, username: call.metadata?.username || "Без имени", audio: call.metadata?.audio, video: call.metadata?.video, screenshare: call.metadata?.screenshare })
          // Если звук выключен и подключился новый пользователь
          if (!user.value.headphone.enabled) { videoToggleSound(true); } 
        })
        getUsers({ participants: oldParticipants.value }) // Обновление videos
        // ========---------========
        call.on("close", () => { 
          console.log("STREAM_CLOSE")
          removeVideo(call.peer)
        })
        call.on("error", (error) => {
          console.error("STREAM_ERROR: ", error)
          removeVideo(call.peer)
        })
      })  
    })
    console.log("USER: ", user.value)
    // ========---------========
  })
  // ========== END ПОДКЛЮЧЕНИЕ 
  
  // ========== ОТКЛЮЧЕНИЕ С КОМНАТЫ 
  onUnmounted(() => {
    ws.disconnect()
    user.value.peerID.destroy()
    user.value.stream?.getTracks().forEach(track => track.stop())
  })
  // ========== END ОТКЛЮЧЕНИЕ С КОМНАТЫ 

</script>


<style lang="scss">
.footer__inner-bottom { display: none; }
body { overflow: hidden; }
.room {
  width: 100%;
  height: 100%;
  display: flex;
  &__inner-info {
    width: 100%;
    height: calc(100vh - 50px);
  }
  &__inner {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }
  &__side {
    margin-left: auto;
    flex-basis: 400px;
    width: 400px;
    height: 90vh;
    position: relative;
    transition: all 300ms cubic-bezier(0.19, 1, 0.56, 1);
  }
  &__exit {
    display: flex;
    align-items: flex-end;
    justify-content: start;
    transform: rotate(180deg);
    cursor: pointer;
    background: var(--clr-primary);
    padding: 5px;
    color: var(--clr-tertiary);
  }

  &__side.show {
    display: block;
    transform: translateX(0);
  }

  // CHAT 
  &__chat {
    &-container {
      background-color: var(--clr-tertiary);
      box-shadow: 5px 5px 5px 5px var(--clr-secondary);
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    &-header {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px 5px 5px;
    }
    &-area {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      &__wrapper {
        padding: 16px;
      }
      &__typing {
        display: flex;
        border-radius: 4px;
        color: var(--clr-secondary);
        width: 100%;
        & .input--text {
          width: 100%;
          border-radius: var(--border-radius-default);
          border-top-right-radius: 0%;
          border-bottom-right-radius: 0%;
        }
        & .btn {
          border-top-left-radius: 0%;
          border-bottom-left-radius: 0%;
          border-left: 2px solid var(--clr-tertiary);
        }
      }
    }
    &-messages {
      overflow: auto;
    }
    &-send {
      color: var(--clr-tertiary);
      background-color: var(--clr-primary);
      border-radius: 8px;
      border: none;
      width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      & svg {
        width: 20px;
        height: 20px;
      }
    }
  }
}
// ======
.video {
  &__grid {
    width: 100%;
    height: 100%; 
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
    position: relative;
  }
  &__input {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0 10px 0;
    gap: 15px;
    font-size: 20px;
    // margin: 15px 0 0 0;
  }
}
// ======
@media screen and (max-width: 1000px) {
  .room__side {
    position: absolute;
    width: 100%;
  }
}
</style>