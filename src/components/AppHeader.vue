<template>
    <header class="header" :class="{'header--active': active}"> 
        <div class="container">
            <div class="header__inner">

                <div class="header__info">
                    <AppLogo class="header__logo" />
                    <li class="header__burger" :class="{'header__burger--active': active}" @click="active = !active"></li>
                </div>

                <nav class="header__menu">
                    <ul class="header__list">
                        <li class="header__item">
                            <router-link to="/" class="header__link link">Главная</router-link>
                        </li>
                        <li class="header__item">
                            <router-link to="/settings" class="header__link link header__item-user">
                                <font-awesome-icon icon="user"/>
                                {{ store.state.username || "Имя не установлено" }}
                            </router-link>
                        </li>
                    </ul>
                </nav>

            </div>
        </div>
    </header>
</template>

<script setup>
    import AppLogo from "@/components/AppLogo.vue"
    import { ref } from "vue"
    import { useStore } from "vuex"
    const store = useStore()
    const active = ref(false) 
</script>

<style lang="scss">
    .header {
        position: relative;
        margin-bottom: 15px;
        &__inner {
            padding: 10px 0 0;
            display: flex;
            justify-content: space-between;
        }
        &__info {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        &__menu {
            width: 100%;
        }
        &__list {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: flex-end;
        }
        &__link {
            font-weight: 600;
        }
        &__item-user {
            display: flex;
            gap: 5px;
            align-items: center;
        }
        // MENU
        &__item-burger {
            display: none;
            cursor: pointer;
        }
    }
    // MEDIA 
    @media screen and (max-width: 500px) {
        .header {
            &__info {
                width: 100%;
                margin: 0 0 15px;
            }
            &__menu {
                display: none;
            }
        }
        .header--active {
            .header {
                &__inner {
                    position: fixed;
                    inset: 0;
                    background: var(--clr-tertiary);
                    height: 100vh;
                    display: flex;
                    z-index: 150;
                    justify-content: flex-start;
                    padding: 10px;
                    flex-direction: column;
                }
                &__link {
                    padding: 10px;
                }
                &__info {
                    margin: 0 0 15px;
                }
                &__menu {
                    display: block;
                    margin-bottom: auto;
                    height: 100%;
                    overflow: auto;
                    background: white;
                    border-top: 2px solid var(--clr-secondary);
                }
                &__list {
                    flex-direction: column;
                    gap: 0;
                }
                &__item {
                    width: 100%;
                    padding: 5px;
                }
                &__item + .header__item {
                    border-top: 2px solid var(--clr-secondary);
                }
                &__link {
                    display: flex;
                }
            }
        }

        
        .header {   
            // BURGER
            &__burger {
                display: block;
                position: relative;
                width: 20px;
                height: 10px;
                background-color: transparent;
                cursor: pointer;
                &::after, &::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    width: 100%;
                    height: 2px;
                    background-color: var(--clr-secondary);
                }
                &::after {
                    top: 1px;
                }
                &::before {
                    bottom: 1px;
                }
                &--active {
                    &::after, &::before {
                        transform: translateY(-50%) rotate(0deg);
                        top: 50%;
                    }
                    &::after {
                        transform: rotate(45deg);
                    }
                    &::before {
                        transform: rotate(-45deg);
                    }
                }
            }
        }
    }
</style>