import { createApp } from 'vue'
import {
	createRouter,
	createWebHashHistory
} from "vue-router";

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import * as ElIcons from '@element-plus/icons-vue'

import $ from 'jquery'

import * as echarts from 'echarts'

import axios from 'axios';

import App from './App.vue'
import Index from './pages/Index.vue'
import Memory from './pages/Memory.vue'
import Cpu from './pages/Cpu.vue'
import Database from './pages/Database.vue'
import View from './pages/View.vue'
import Net from './pages/Net.vue'
import Dist from './pages/Dist.vue'
import Alert from './pages/Alert.vue'

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
  { path: '/', component: Index },
  { path: '/Index', component: Index },
  { path: '/Memory', component: Memory },
  { path: '/Cpu', component: Cpu },
  { path: '/Database', component: Database },
  { path: '/View', component: View },
  { path: '/Net', component: Net },
  { path: '/Dist', component: Dist },
  { path: '/Alert', component: Alert }
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
})

const app = createApp(App);

// vue3 给原型上挂载属性
app.config.globalProperties.$echarts = echarts;

for (const name in ElIcons){
	app.component(name, ElIcons[name])
}

//确保 _use_ 路由实例使
//整个应用支持路由。
app.use(router);
app.use(ElementPlus);

app.mount('#app');
