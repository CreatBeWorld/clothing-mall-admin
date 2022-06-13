<template>
  <el-container class="home-container">
    <el-aside :width="$store.state.tab.isCollapse?'64px':'210px'">
      <common-aside/>
    </el-aside>
    <el-container>
      <el-header>
        <common-header/>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import CommonAside from "../components/common/CommonAside";
import CommonHeader from "../components/common/CommonHeader";
export default {
  name: "Home",
  components:{
    CommonAside,
    CommonHeader
  },
  data(){
    return{
    }
  },
  methods:{
  },
  computed:{
    // parentId(){
    //   return this.$route.query.parentId
    // }
  }
}
</script>

<style scoped  lang="less">
  .home-container{
    height: 100%;
  }
  .el-header{
    background-color: #fff;
    height: 56px !important;
    color: #fff;
    font-size: 20px;
  }
  .el-aside{
    background-color: #333744;
  }
  .el-main{
    background-color: #eef0f3;
  }
  .el-aside::-webkit-scrollbar {//滚动条不不显示
    display: none;
  }
</style>
