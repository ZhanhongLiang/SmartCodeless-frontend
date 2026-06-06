/*
 * @Author: jean cw252128385@gmail.com
 * @Date: 2026-03-20 13:39:04
 * @LastEditors: jean cw252128385@gmail.com
 * @LastEditTime: 2026-04-05 22:20:17
 * @FilePath: \ai-code-mother-scratch-frontend\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

import '@/access'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd)

app.mount('#app')
