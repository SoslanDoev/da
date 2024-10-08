<template>
    <div class="notfound">
        <div class="container">
            <div class="notfound__inner">
                <p class="notfound__title">404</p>
                <h1 class="notfound__descr"><span class="span--green">Запрашиваемая</span> страница не найдена</h1>
                <router-link class="btn" to="/">Вернуться на главную</router-link>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    .notfound {
        padding: 100px 0 0 0;
        display: flex;
        justify-content: center;
        text-align: center;
        &__title {
            font-size: 9.375rem;
        }
        &__title, &__descr {
            margin-bottom: 15px;
        }
    }
</style>