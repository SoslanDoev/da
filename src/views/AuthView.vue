.<template>
    <div class="auth">
        <div class="auth__inner">
            <div class="auth__form">
                <h1 class="title auth__title"><span class="span--green">Введите</span> свое имя</h1>
                <div class="form--box">
                    <input type="text" @keyup.enter="setName" v-model="username" class="input--text" placeholder="Введите имя">
                    <button class="btn" @click="setName">Продолжить</button>
                </div>
            </div>
            <p class="auth__errors">{{ errors["username"] }}</p>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from "vue"
    import { useRouter, useRoute } from "vue-router"
    import { useStore } from 'vuex'
    const errors = ref({})
    const username = ref("")
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    onMounted(() => {
        const name = localStorage.getItem("VideoChatUserName") || ""
        if (name) { 
            store.commit("setUsername", name)
        }
    })
    const setName = () => {
        const name = username.value.trim()
        if (!name || !name.length) {
            errors.value["username"] = "Имя не может быть пустым"
            return 
        } else if (name.length < 3 || name.length > 50) {
            errors.value["username"] = "Некорректное имя"
            return 
        }
        if (name) { store.commit("setUsername", name); }
        localStorage.setItem("VideoChatUserName", name)
        if (!route.redirectedFrom) {
            router.push("/")
        } else {
            router.push(route.redirectedFrom.fullPath)
        }
    }
</script>

<style lang="scss">
    .auth {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 200;
        background-color: var(--clr-tertiary);
        &__inner {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        &__title {
            margin-bottom: 5px;
            text-align: center
        }
        &__errors {
            max-width: 300px;
        }
    }
</style>