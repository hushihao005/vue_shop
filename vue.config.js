module.exports = {
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')
      config.set('externals', {
        vue: 'vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        loadsh: '_',
        echarts: 'echarts',
        nprogress: 'Nprogress',
        'vue-quill-editor': 'vueQuillEditor'
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')
    })
  }
}