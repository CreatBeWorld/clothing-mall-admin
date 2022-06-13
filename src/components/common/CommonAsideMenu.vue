<template>
  <div>
    <template v-for="item in menuList">
      <el-submenu v-if="item.children.length!==0&&item.status" :key="item.id" :index="item.id+''" :class="getClass1(item.type)">
        <template slot="title">
          <i :class="item.icon"></i>
          <span>{{item.name}}</span>
        </template>
        <common-aside-menu :menu-list="item.children"/>
      </el-submenu>
      <el-menu-item v-else-if="item.children.length===0&&item.status" :key="item.id" :index="item.path" @click="clickMenu(item)" :class="getClass(item.type)">
        <i :class="item.icon"></i>
        <span slot="title">{{item.name}}</span>
      </el-menu-item>
    </template>

  </div>
</template>
<script>
import CommonAsideMenu from './CommonAsideMenu'
export default {
  name: "CommonAsideMenu",
  components:{
    CommonAsideMenu
  },
  props:{
    menuList:[],
  },
  methods:{
    //监听二级菜单的点击事件
    clickMenu(item){
      this.$store.commit('selectMenu',item)
    },
    getClass(type){
      return {
        setPadding:type!==0
      }
    },
    getClass1(type){
      return {
        setPadding1:type!==0
      }
    },

  }
}
</script>

<style scoped>

</style>
