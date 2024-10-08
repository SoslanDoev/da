<template>
    <div class="message__wrapper" :class="{'reverse': my === true}">
        <div class="message__picture">
            <font-awesome-icon icon="user"/>
        </div>
        <div class="message__content">
            <p class="message__name" v-if="my === true">Вы</p>
            <p class="message__name" v-else>{{ username || "" }}</p>
            <div class="message">{{ message }}</div>
        </div>
    </div>
</template>

<script setup>
    import { defineProps } from "vue"
    defineProps({
        "username": {
            type: String,
            required: true,
        },
        "message": {
            type: String,
            required: true,
        },
        "my": {
            type: Boolean,
            default: false,
        }
    })
</script>

<style lang="scss">
    .message {
        margin-top: 8px;
        background: var(--clr-secondary);
        padding: 8px 16px;
        border-radius: 0 12px 12px 12px;
        font-size: 12px;
        line-height: 16px;
        max-width: 100%;
        color: var(--clr-tertiary);
        &__wrapper {
            display: flex;
            padding: 16px 0;
            &.reverse {
                flex-direction: row-reverse;
            }
        }
        &__wrapper.reverse .message {
            margin-left: auto;
            border-radius: 16px 0 16px 16px;
            max-width: 100%;
        }
        &__picture {
            border-radius: 8px;
            width: 32px;
            height: 32px;
            overflow: hidden;
            margin-right: 12px;
            flex-shrink: 0;
        }
        &__picture img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        } 
        &__wrapper.reverse .message__picture {
            margin-left: 12px;
            margin-right: 0;
        } 
        &__wrapper.reverse .message__name {
            text-align: right;
        }
        &__message-file {
            border: 1px solid var(--clr-primary);
            width: 100%;
            margin-top: 16px;
            border-radius: 4px;
            padding: 8px;
            display: flex;
        }
    }
</style>