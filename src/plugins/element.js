import Vue from 'vue'
// 挂载对应的组件
import { Button, Form, FormItem, Input, Message } from 'element-ui'
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 进行全局挂载
Vue.prototype.$message = Message
