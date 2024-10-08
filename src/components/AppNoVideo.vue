<template>
    <div class="video__box video__box-no" :id="`${videoID}--box`">
        <p class="video__box-name">{{ name }}</p>
    </div>
</template>

<script setup>
console.log("yes")
    import { defineProps } from "vue"
    defineProps({
        isMe: { type: Boolean, default: true }, // True - Я \ False - Другой человек
        videoID: { type: String, },
        name: { type: String }, 
    })
</script>

<style lang="scss">
    .video {
        object-fit: cover;
        background-color: var(--clr-secondary);
        width: 100%;
        height: 100%;
        position: relative;
        &__top {
            position: absolute;
            top: 5px;
            right: 5px;
            display: flex;
            gap: 15px;
            & svg {
                width: 20px;
                height: 20px;
            }
        }
        &__box {
            width: 33.33333%;
            height: 50%;
            position: relative;
            border: 2px solid var(--clr-tertiary);
        }
        &__box-no {
            background-color: var(--clr-primary);
        }
        &__box-name {
            position: absolute;
            bottom: 5px;
            left: 5px;
            color: var(--clr-tertiary);
        }
        &--active {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 5;
            object-fit: contain;
            background: rgba(0, 0, 0, 0.8);
        }
    }
</style>