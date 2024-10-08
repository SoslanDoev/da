<template>
    <div class="video__box" :id="`${videoID}--box`">
        <video 
            ref="videoEL"
            class="video"
            :id="`${videoID}--video`"
            :srcObject="srcObject"
            :muted="muted"
            @loadedmetadata="onLoadedMetadata"
            @click.prevent="onActive"
            v-if="srcObject"
        ></video>

        <div v-else>ПУсто</div>
        <p class="video__box-name">{{ name }}</p>
        <div class="video__top" v-if="!isMe">
            <!-- <AppAudio :class="{'svg__icon--disabled': audioActive}"/> -->
            <div class="video__top-box" :class="{'svg__icon--disabled': audioActive}">
                <font-awesome-icon class="svg__icon" icon="microphone"/>
            </div>
            <div class="video__top-box" :class="{'svg__icon--disabled': videoActive}">
                <font-awesome-icon class="svg__icon" icon="video"/>
            </div>
            <div class="video__top-box" :class="{'svg__icon--disabled': headphoneActive}">
                <font-awesome-icon class="svg__icon" icon="headphones"/>
            </div>
            <div class="video__top-box" :class="{'svg__icon--disabled': screenShareActive}">
                <font-awesome-icon class="svg__icon" icon="display"/>
            </div>

            <!-- <AppVideo :class="{'svg__icon--disabled': videoActive}" />  -->
            <!-- <AppHeadphone :class="{'svg__icon--disabled': headphoneActive}" />  -->
            <!-- <AppScreenShare :class="{'svg__icon--disabled': screenShareActive}" />  -->
        </div>
    </div>
</template>

<script setup>
    import { defineProps } from "vue"
    defineProps({
        isMe: { type: Boolean, default: true }, // True - Я \ False - Другой человек
        srcObject: { type: Object, },
        muted: { type: Boolean, },
        videoID: { type: String, },
        name: { type: String }, 
        audioActive: { type: Boolean, default: false },
        headphoneActive: { type: Boolean, default: false },
        screenShareActive: { type: Boolean, default: false },
        videoActive: { type: Boolean, default: false },
    })
    const onLoadedMetadata = (video) => { video.target.play() }
    const onActive = (video) => { video.target.classList.toggle("video--active"); }
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
                width: 15px;
                height: 15px;
                color: var(--clr-secondary);
            }
        }
        &__top-box {
            border: 2px solid var(--clr-tertiary);
            opacity: .5;
            padding: 2px;
            background: var(--clr-tertiary);
            border-radius: var(--border-radius-default);
        }
        &__box {
            width: 33.33333%;
            height: 50%;
            position: relative;
            border: 2px solid var(--clr-tertiary);
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