<template>
    <AppAlert :message="alertMessage" @hide="hideAlert" v-if="alertVisible"/>
    <div class="settings">
        <div class="container">
            <div class="settings__inner">
                <h1 class="settings__title"><span class="span--green">Настройки</span> ваше профиля</h1>

                <div class="settings__list">
                    <div class="form--box">
                        <label for="username">Ваше имя</label>              
                        <input type="text" @keyup.enter="updateName" class="input--text" placeholder="Введите имя" v-model="username">
                    </div>
                    <p v-if="errors['username']" class="settings__error">{{ errors["username"] }}</p>
                </div>
                <button class="btn" @click="updateName">Обновить</button>

            </div>
        </div>
    </div>
</template>

<script setup>
    import { useStore } from "vuex"
    import AppAlert from "@/components/AppAlert.vue"
    import { ref } from "vue"
    const errors = ref({})
    const alertMessage = ref("")
    const alertVisible = ref(false)
    const store = useStore()
    const username = ref(store.state.username || "")

    // const 
    const hideAlert = () => {
        alertMessage.value = ""
        alertVisible.value = false
    }

    const updateName = () => {
        let localUsername = ""
        if (!username.value || !username.value.length) {
            errors.value["username"] = "Ошибка. Имя не должно быть пустым"
            alertMessage.value = "Ошибка"
            return 
        } else if (username.value.length < 3 || username.value.length > 50) {
            errors.value["username"] = "Ошибка. Имя должно быть больше 3 символов и меньше 50"
            alertMessage.value = "Ошибка"
            return 
        } else {
            localUsername = username.value || "Без имени"
            localStorage.setItem("VideoChatUserName", localUsername)
            store.commit("setUsername", localUsername)
            alertMessage.value = "Имя успешно обновлено"
            alertVisible.value = true
        }
        
    }
</script>

<style lang="scss">
    .settings {
        &__error {
            margin: 15px 0;  
        }
        &__inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            background: var(--clr-tertiary);
            border-radius: var(--border-radius-default);
            padding: 10px 0;
        }
        &__list {
            display: flex;
            align-items: center;
            flex-direction: column;
        }
    }
</style>