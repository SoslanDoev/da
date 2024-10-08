<template>
    <Transition name="fade" @click.prevent="hide">
        <div class="alert" v-if="isVisible">
            {{ message }}
        </div>
    </Transition>
</template>

<script setup>
    import { defineEmits, defineProps, onMounted, onUnmounted, ref } from "vue"
    const emit = defineEmits(["hide"])
    defineProps({ message: String, })
    const isVisible = ref(false)
    const myTimeout = ref(null)
    // Отключить
    const hide = () => {
        isVisible.value = false 
        clearTimeout(myTimeout.value)
        myTimeout.value = null
        emit("hide", false)
    }
    // Активировать
    const show = () => {
        isVisible.value = true
        myTimeout.value = setTimeout(() => {
            hide()
        }, 2500);
    }
    onMounted(() => { show() })
    onUnmounted(() => { clearTimeout(myTimeout.value) })
</script>

<style lang="scss">
    .alert {
        max-width: 250px;
        cursor: pointer;
        position: fixed;
        z-index: 100;
        top: 10px;
        right: 10px;
        padding: 10px;
        background-color: var(--clr-primary);
        color: var(--clr-tertiary);
        border-radius: var(--border-radius-default);
    }
</style>