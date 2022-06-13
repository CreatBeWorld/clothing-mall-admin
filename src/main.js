import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugin/element.js'
//导入字体图标
import './assets/fonts/iconfont.css'
import axios from "axios";
import store from './store'

axios.defaults.baseURL = "http://localhost:9100/clothing_mall_backend/"//请求的根路径
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
// import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';


echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer
  // UniversalTransition
]);

Vue.prototype.$echarts = echarts
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  store
}).$mount('#app')
