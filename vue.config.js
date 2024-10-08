const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/socket.io': {
        target: 'https://www.frtw.ru',
        ws: true
      },
      '/api': {
        target: 'https://www.frtw.ru',
        changeOrigin: true
      }
    }
  }
})
