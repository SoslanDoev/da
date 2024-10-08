<template>
    <div class="finish__room">
        <AppAlert v-if="isVisibleAlertMessage" :message="'Спасибо за отзыв'"/>
        <div class="container">
            <div class="finish__room-inner">
                <h1 class="finish__room-title title"><span class="span--green">Оцените </span>качество разговора</h1>
                <div class="stars__list">
                    <div
                        class="star__item"
                        :class="{'star__item--active': item }"
                        v-for="(item, idx) in 5"
                        :key="idx"
                        @click.prevent="starCheck = item"
                    >
                        <font-awesome-icon icon="star"/>
                    </div>

                </div>
                <a href="#" class="start__btn btn" @click.prevent="starSubmit">Отправить</a>
            </div>
        </div>
    </div>
</template>

<script setup>
    import AppAlert from "@/components/AppAlert.vue"
    import { ref, watch, onUnmounted } from "vue"
    import { useRouter } from "vue-router"

    const router = new useRouter()
    const starCheck = ref(5)
    const isVisibleAlertMessage = ref(false)
    const timeout = ref(null)

    watch(starCheck, () => {
        const stars = document.querySelectorAll(".star__item")
        for (let i = 0; i < stars.length; i++) { stars[i].classList.remove("star__item--active") }
        for (let i = 0; i < starCheck.value; i++) {
            stars[i].classList.add("star__item--active")
        }
    })
    
    // Функция отправки звезд разговора на сервер
    const starSubmit = () => {
        isVisibleAlertMessage.value = true
        timeout.value = setTimeout(() => {
            router.push("/")
        }, 200)
    }

    onUnmounted(() => {
        if (timeout.value) {
            clearTimeout(timeout.value)
            timeout.value = null
        }
    })
</script>

<style lang="scss">
    .finish__room {
        // padding: 100px 0 0 0;
        &-title {
            margin: 0 0 15px;
        }
        &-inner {
            display: flex;
  gap: 15px;
  flex-direction: column;
  border-radius: var(--border-radius-default);
  background: var(--clr-tertiary);
  align-items: center;
  padding: 10px 0;
        }
    }
    .stars__list {
        display: flex;
        gap: 15px;
        align-items: center;
        margin: 0 0 15px;
    }
    .star {
        &__item {
            cursor: pointer;
            font-size: 1.25rem;
        }
        &__item--active {
            color: var(--clr-primary);
        }
    }
</style>