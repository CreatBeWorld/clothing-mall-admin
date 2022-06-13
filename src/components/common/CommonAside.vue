<template>
  <div class="aside-menu">
    <div class="logo">
      <span>clothing-mall-admin</span>
    </div>
    <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#409eff"
      :collapse="isCollapse"
      :collapse-transition="false"
      router
      :default-active="currentMenuPath"
    >
      <common-aside-menu :menu-list="menuList"/>
    </el-menu>

  </div>

</template>

<script>
import CommonAsideMenu from "./CommonAsideMenu";
export default {
  name: "CommonAside",
  components:{
    CommonAsideMenu
  },
  created() {
    this.$store.dispatch("getMenuList",this)
  },
  computed:{
    isCollapse(){
      return this.$store.state.tab.isCollapse
    },
    currentMenuPath(){
      const path = this.$store.state.tab.currentMenuPath
      return path===this.$route.path?path:''
    },
    menuList:{
      get(){
        return this.$store.state.tab.menuList
      },
      set(v){
        this.$store.dispatch('getMenuList',this)
      }
    }

  }
}
</script>

<style scoped lang="less">
.logo{
  height: 56px;
  line-height: 56px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  background-color: #304156;
}
.logo::before{
  content: "";
  display: inline-block;
  width: 30px;
  height: 30px;
  background: url("../../assets/img/loginLogo.png") no-repeat;
  background-size: 30px 30px;
  vertical-align: -9px;
  margin-right: 10px;
}
.el-menu{
  border-right: none;
}


</style>
