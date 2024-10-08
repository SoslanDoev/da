<template>
  <div class="room">
    <div class="container">
      <div class="room__inner">
        <div class="room__info">
          <h1><span class="span--green">Приятного</span> общения в комнате</h1>
          <p>Комната <span class="span--green">{{ keyRoom }}</span></p>
        </div>

        <div id="video__grid" class="video__grid">
          <!-- Здесь будут создаваться <div class="video"></div> -->
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import io from 'socket.io-client';
import Peer from 'peerjs';

const route = useRoute();
const keyRoom = ref(null);
const videoGrid = ref(null);
const socket = ref(null);
const peer = ref(null);
const peers = ref({});
const stream = ref(null); // Добавляем реактивную переменную для stream

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => { video.play(); })
  videoGrid.value.appendChild(video)
};

const app = () => {
  // Создание своей камеры
  const myVideo = document.createElement('video');
  myVideo.classList.add('video--my', 'video');
  myVideo.muted = true;

  // Запрашиваем у пользователя доступ к камере и микрофону
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((mediaStream) => {
      stream.value = mediaStream; // Обновляем реактивную переменную
      addVideoStream(myVideo, mediaStream);

      peer.value.on('call', (call) => {
        call.answer(mediaStream);
        const video = document.createElement('video');
        video.classList.add('video');
        call.on('stream', (userVideoStream) => { addVideoStream(video, userVideoStream); });
      });
    })
    .catch((error) => {
      console.error('Ошибка доступа к камере и микрофону', error);
    });

  socket.value.on('user-connected', (userID) => {
    if (stream.value) {
      connectToNewUser(userID, stream.value); // Используем реактивную переменную
    }
  });

  socket.value.on('user-disconnected', (userID) => {
    if (peers.value[userID]) { peers.value[userID].close(); }
    const videoElement = document.getElementById(userID);
    if (videoElement) videoElement.remove();
  });

  peer.value.on('open', (id) => {
    socket.value.emit('join-room', keyRoom.value, id);
  });

  const connectToNewUser = (userID, stream) => {
    const call = peer.value.call(userID, stream);
    const video = document.createElement('video');
    video.classList.add('video');
    video.id = userID;
    call.on('stream', (userVideoStream) => { addVideoStream(video, userVideoStream); });
    call.on('close', () => { video.remove(); });
    peers.value[userID] = call;
  };
};

onMounted(() => {
  socket.value = io(/* Вставьте URL вашего сервера */);
  // socket.value = io("/")
  peer.value = new Peer();
  keyRoom.value = route.params.roomID; // Ключ комнаты
  videoGrid.value = document.getElementById('video__grid'); // Камера пользователей
  app(); // Запуск главного кода 
});

onBeforeMount(() => {
  if (socket.value) socket.value.disconnect();
  if (peer.value) peer.value.destroy();
});
</script>

<style lang="scss">
.video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  background-color: var(--clr-secondary);
}

.video__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 300px);
  grid-auto-rows: 300px;
  gap: 15px;
}
</style>
