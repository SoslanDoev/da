const cors = require("cors")
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const path = require("path")

const port = process.env.PORT || 3000
const app = express()
app.use(cors())
app.use(express.static("dist"))

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
})

// Перехватываем все маршруты и перенаправляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// База данных не используется поэтому комнаты будут записываться в переменную
const rooms = {}
// const userSocketMap = {}

// Получение всех сообщений
const indexRoomMessages = ({ roomID }) => (rooms[roomID]) ? rooms[roomID].messages : []

const userFindIndex = ({ room, socketID}) => room.data.findIndex((user) => user.socketID === socketID)

// Подключение пользователя
io.on("connection", (socket) => {
  console.log("client connection")
  socket.emit("getRooms", { rooms: rooms })

  // Пользователь без камеры
  socket.on("no-broadcast", ({ peerID, roomID, username }) => {
    socket.to(roomID).emit("no-broadcast", { username, peerID, })
  })

  // Создание комнаты
  socket.on("create-room", ({ roomID, name, password }) => {
    // rooms[roomID] = []
    rooms[roomID] = {
      name: name, // Название комнаты,
      key: roomID, // Ключ комнаты 
      data: [], 
      password: password,
      sizeUser: 0, // Кол-во пользователей в комнате
      messages: [],
    }
    console.log(rooms[roomID])
    io.emit("getRoomsNew", {
      key: roomID, name, sizeUser: 1,
      password: rooms[roomID].password
    })
  })

  // Получение экрана пользователя
  socket.on("screen-share-started", ({ peerID, roomID }) => {
    if (rooms[roomID]) {
      socket.to(roomID).emit("screen-share-started", { roomID: roomID, peerID: peerID })
    }
  })

  socket.on("screen-share-stopped", ({ peerID, roomID }) => {
    if (rooms[roomID]) {
      socket.to(roomID).emit("screen-share-stopped", { roomID: roomID, peerID: peerID })
    }
  })

  // Отключить звук у определенного человека
  socket.on("toggle-audio-room", ({ roomID, peerID, enabled }) => {
    const room = rooms[roomID]
    console.log("start=", room)
    if (room) {
      const userIndex = userFindIndex({ room: room, socketID: socket.id }) 
      if (userIndex !== -1) {
        room.data[userIndex].audio = enabled
        socket.to(roomID).emit("toggle-audio-room", { roomID: roomID, peerID: peerID, enabled: enabled })
      }
    }
    console.log("end=", room)
  })

    // Отключить видео у определенного человека
    socket.on("toggle-video-room", ({ roomID, peerID, enabled }) => {
      const room = rooms[roomID]
      if (room) {
        const userIndex = userFindIndex({ room: room, socketID: socket.id }) 
        if (userIndex !== -1) {
          room.data[userIndex].video = enabled
          socket.to(roomID).emit("toggle-video-room", { roomID: roomID, peerID: peerID, enabled: enabled })
        }
      }
    })

    // Отключить наушники у определенного человека
    socket.on("toggle-headphone-room", ({ roomID, peerID, enabled }) => {
      const room = rooms[roomID]
      if (room) {
        const userIndex = userFindIndex({ room: room, socketID: socket.id }) 
        if (userIndex !== -1) {
          room.data[userIndex].headphone = enabled
          socket.to(roomID).emit("toggle-headphone-room", { roomID: roomID, peerID: peerID, enabled: enabled })
        }
      }
    })

    // Отключение стрима
    socket.on("toggle-screnshare-room", ({ roomID, peerID, enabled }) => {
      const room = rooms[roomID]
      if (room) {
        const userIndex = userFindIndex({ room: room, socketID: socket.id }) 
        if (userIndex !== -1) {
          room.data[userIndex].screenshare = enabled
          socket.to(roomID).emit("toggle-screnshare-room", { roomID: roomID, peerID: peerID, enabled: enabled })
        }
      }
    })

    // Отправка сообщения 
    socket.on("send-message", ({ roomID, peerID, message, username }) => {
      if (rooms[roomID]) {
        console.log("Отправлено сообщение", message)
        socket.to(roomID).emit("get-message", { peerID, message, username })
        rooms[roomID].messages.push({ peerID, message, username })
      }
    })

    // Проверка пароля 
    socket.on("room-check-password", ({ roomID, password }) => {
      console.log("room-check-password", password)
      if (rooms[roomID] && rooms[roomID].password === password) {
        socket.emit("room-password-correct", { roomID });
      } else {
        socket.emit("room-password-incorrect", { roomID });
      }
    })

  // Подключение к комнате
  socket.on("join-room", ({ roomID, peerID, password, username, audio, video, screenshare }) => {
    console.log("Пользователь подключился к комнате")
    let room = rooms[roomID]
    if (room) {
      // Проверка на пароль
      if ( !rooms[roomID].password && !password || rooms[roomID].password === password ) {
        rooms[roomID].data.push({
          socketID: socket.id, peerID, username,
          audio, // Микрофон вкл\выкл
          video, // Видео
          headphone: true, // Наушники
          screenshare, // Стрим
        })
        socket.join(roomID)
        console.log("JOINROOM :", rooms[roomID])
        socket.to(roomID).emit("user-joined", { peerID, username, audio, video, headphone: true, screenshare, })
        socket.emit("get-users", { roomID, participants: rooms[roomID].data })
        
        room.sizeUser += 1
        io.emit("updateRoom", room)
        
        // Сообщение о том что пользователь подключился
        socket.to(roomID).emit("get-message", { peerID, "message": `Пользователь ${username} подключился`, username,  })
        
        // Получение всех сообщений
        const messages = indexRoomMessages({ roomID })
        socket.emit("get-messages", { messages })
        socket.emit("room-password", { status: 200, })
      } else {
        socket.emit("room-password", { status: 400, })
        console.log("Пароли не подходят")
      }
    } else {
      socket.emit("error-room", { message: "Комната не существует", status: 404, })
    }
  })

  // Отключение пользователя
  socket.on("disconnect", () => {
    for (const roomID in rooms) {
      const room = rooms[roomID]
      const userIndex = room.data.findIndex((user) => user.socketID === socket.id)
      if (userIndex !== -1) {
        leaveRoom({ roomID, peerID: room.data[userIndex].peerID, username: room.data[userIndex].username })
        room.data.splice(userIndex, 1)
      }
    }
  })

  // Удаление пользователя который вышел из rooms
  const leaveRoom = ({ roomID, peerID, username }) => {
    console.log(`user left the room: ${roomID}, peerID: ${peerID}`)
    const room = rooms[roomID]
    if (room) {
      room.data = rooms[roomID].data.filter((id) => id !== peerID)
      socket.to(roomID).emit("user-disconnected", { peerID })

      room.sizeUser -= 1
      io.emit("updateRoom", room)

      if (!room['data'].length) {
        delete rooms[roomID]
      }

      // Сообщение о том что пользователь отключился
      socket.to(roomID).emit("get-message", { peerID, "message": `Пользователь ${username || ""} отключился`, username })
    }
  }

})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})