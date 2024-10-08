<template>
    <div class="error">
        <div class="container">
            <div class="error__inner">
                <p class="error__title">400</p>
                <h1 class="error__descr"><span class="span--green">Вы</span> уже находитесь в другой комнате</h1>
                <button class="btn">Перейти в комнату</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import socketIOClient from "socket.io-client"
    import { useStore } from "vuex"

    const store = useStore()
    const ws = socketIOClient(store.state.ws)

    ws.emit("test")
    
</script>

<style lang="scss">
    .error {
        padding: 100px 0 0 0;
        display: flex;
        justify-content: center;
        text-align: center;
        &__title {
            font-size: 9.375rem;
        }
        &__title, &__descr {
            margin-bottom: 15px;
        }
    }
</style>