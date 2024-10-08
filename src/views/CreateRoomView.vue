<template>
    <div class="create__room">
        <div class="container">
            <div class="create__room-inner">
                <AppLoaded />
                <template v-if="!keyRoom">
                    <h1 class="create__room-title"><span class="span--green">Подождите</span> комната создается...</h1>
                </template>
                <template v-else>
                    <h1><span class="span--green">Комната</span> успешно создана</h1>
                    <!-- <p>{{ keyRoom }}</p> -->
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
    import AppLoaded from "@/components/AppLoaded.vue"
    import { useRouter, useRoute } from "vue-router"
    import { onMounted, ref } from "vue"
    import socketIOClient from "socket.io-client"
    const WS = `http://localhost:3000`
    import { v4 as uuidV4 } from "uuid"
    const keyRoom = ref(null)
    const router = useRouter()
    const route = useRoute()
    const ws = socketIOClient(WS) 
    onMounted(async () => {
        keyRoom.value = await uuidV4()
        const { name: getNameRoom, password: getPasswordRoom } = route.query
        // Обращение на сервер для создания комнаты
        ws.emit("create-room", { roomID: keyRoom.value, name: getNameRoom, password: getPasswordRoom })
        console.log("create-room", route, router)
        setTimeout(() => {
            router.push({
                path: `room/${keyRoom.value}`,
                query: {
                    name: getNameRoom,
                    roomID: keyRoom.value,
                    password: getPasswordRoom,
                },
            })
            // router.push(`room/${keyRoom.value}`)
        }, 200);
    })
</script>

<style lang="scss">
    .create__room {
        &-title {
            text-align: center;
        }
    }
</style>