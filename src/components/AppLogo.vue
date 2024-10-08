<template>
    <div class="logo">
        <!-- <router-link to="/" class="logo__link link"><span class="logo__span">Video</span>Chat</router-link> -->
        <a 
            @click.prevent="routeLinkMiddleware"
            class="logo__link"
            :class="{'link': enabled === true}"
        ><span class="logo__span">Video</span>Chat</a>
    </div>
</template>

<script setup>
    import { defineProps } from "vue"
    import { useRouter } from "vue-router" 
    const router = useRouter()
    const props = defineProps({ enabled: { type: Boolean, default: true, }, })
    const routeLinkMiddleware = () => {
        if (props.enabled === true) { router.push("/")} 
    }
</script>

<style lang="scss">
    .logo {
        &__link {
            color: var(--clr-secondary) !important;
            font-size: 1.2rem;
            font-weight: 800;
        }
        &__span {
            color: var(--clr-primary);
        }
    }
</style>