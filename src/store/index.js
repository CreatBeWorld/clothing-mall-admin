import Vue from 'vue'
import Vuex from 'vuex'
import tab from './tab'
import componentsData from "./componentsData";
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)
const store = new Vuex.Store({
  modules:{
    tab,
    componentsData
  },
  plugins: [createPersistedState({//Vuex数据 持久化(页面刷新时，会把数据存储在本地存储中)
    storage: window.sessionStorage
  })]
})
export default store
