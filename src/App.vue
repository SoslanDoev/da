<template>
  <AppHeader v-if="route.meta.header"/>
  <main class="main" id="main">

    <router-view v-slot="{ Component }">
      <!-- <transition name="fade"> -->
        <component :is="Component"></component>
      <!-- </transition> -->
    </router-view>

  </main>
  <AppFooter v-if="route.meta.footer"/>
</template>

<script setup>
  import AppHeader from "@/components/AppHeader.vue"
  import AppFooter from "@/components/AppFooter.vue"
  import { useRoute } from "vue-router"
  const route = useRoute()
</script>

<style lang="scss">
  *, *::after, *::before {
    padding :0;
    margin: 0;
    box-sizing: border-box;
    font-family: "Roboto", sans-serif;
  }
  :root {
    --clr-primary: #42b983;
    --clr-secondary: #343434;
    --clr-tertiary: #f7f7f7;

    --transition-default: all 200ms linear;

    --border-radius-default: 4px;
  }
  html, body {
    height: 100%;
  }
  html {
    font-size: 16px;
  }
  .wrapper, #app {
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  body {
    font-size: 1rem;
    color: var(--clr-secondary);
  }
  .container  {
    max-width: 1130px;
    margin: 0 auto;
    padding: 0 15px;
  }
  // .container__right { 
    // padding-left: calc((100% - var(--container-width))/2 + var(--container-padding));
    // margin: 0 auto;
// }
// .container__left {
    // padding-right: calc((100% - var(--container-width))/2 + var(--container-padding));
    // margin: 0 auto;
// }
  ul, ol, li  {
    list-style: none;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  .router-link {
    transition: var(--transition-default);
  }
  .router-link-active {
    color: var(--clr-primary);
    transition: var(--transition-default);
  }
  main {
    flex: 1 1 auto;
    display: grid;
  }
  .span--green {
    color: var(--clr-primary);
  }
  // link
  .link {
    cursor: pointer;
    transition: var(--transition-default);
    opacity: 1;
    &:hover {
      opacity: .5;
      transition: var(--transition-default);
    }
  }
  .link.router-link-active {
    opacity: 1;
    & svg path {
      stroke: var(--clr-primary);
    }
  }
  .title {
    margin: 0 0 10px 0;
  }
  .label {
    display: block;
    background: var(--clr-tertiary);
    color: var(--clr-secondary);
    padding: 5px 10px;
    border-top-left-radius: var(--border-radius-default);
    border-bottom-left-radius: var(--border-radius-default);
  }
  .box {
    display: flex;
    align-items: center;
  }
  // TransitionFade
  .fade {
    &-enter-active, &-leave-active { transition: var(--transition-default); }
    &-enter-from, &-enter-to { opacity: 0; }
  }
  // forms
  .btn {
    font-size: inherit;
    cursor: pointer;
    display: inline-block;
    border-radius: 4px;
    padding: 5px 10px;
    // mix-blend-mode: difference !important;
    background-color: var(--clr-primary);
    color: var(--clr-tertiary);
    transition: var(--transition-default);
    // box-shadow: 5px 5px 5px 5px var(--clr-secondary);
    border: none;
    &:hover {
      transition: var(--transition-default);
      background-color: var(--clr-secondary);
    }
  }
  // SVG_ICON
  .svg__icon {
    width: 24px;
    height: 24px;
    position: relative;
    color: var(--clr-tertiary);
    & svg path {
      stroke: var(--clr-secondary);
    }
    &--active {
      background: var(--clr-secondary);
    }
    &--disabled {
      position: relative;
    }
    &--disabled::after {
      content: "";
      display: block;
      position: absolute;
      width: 2px;
      background-color: var(--clr-secondary);
      transform: translate(-50%) rotate(60deg);
      height: 100%;
      top: 0;
      left: 50%;
      border-radius: 4px;
    }
  }
  .input--text {
    border: none;
    font-size: 1rem;
    outline: none;
    padding: 5px;
    font-weight: 600;
    background: var(--clr-primary);
    color: var(--clr-tertiary);
    // border-radius: var(--border-radius-default);
    border-top-right-radius: var(--border-radius-default);
  }
  .input--text::placeholder {
    color: var(--clr-tertiary);
  }
  .none {
    display: none;
  }

  // FORM
  .form {
    &--box {
      display: flex;
      align-items: baseline;
      gap: 5px;
    }
  }
  @media screen and (max-width: 350px) {
    .box {
      align-items: normal;
      flex-direction: column;
    }
  }
</style>
