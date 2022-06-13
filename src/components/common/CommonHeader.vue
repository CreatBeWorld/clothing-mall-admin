<template>
  <div class="common-header">
    <div class="l-content">
      <div class="toggle-button" @click="toggleCollapse">
        <i :class="isCollapse?'el-icon-s-fold':'el-icon-s-unfold'"></i>
      </div>
    </div>
    <common-tag/>
    <div class="r-content">
      <el-dropdown trigger="hover" size="mini" @command="handleClick">
          <img :src="avatar" alt="" class="userImg">
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="user-info">个人中心</el-dropdown-item>
          <el-dropdown-item command="logout">退出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import CommonTag from "./CommonTag";
export default {
  name: "CommonHeader",
  components: {CommonTag},
  methods: {
    //退出登录
    logout() {
      console.log("........")
      this.$http.post('/logout').then(res=>{
        sessionStorage.clear();
        this.$router.push('/login');
        window.location.reload();
      })
    },
    //点击按钮切换菜单的折叠与展开
    toggleCollapse() {
      this.$store.commit('collapseMenu')
    },
    //获取登录用户信息
    async userInfo(){
      const {data:res} =await this.$http.get('sys/user/userInfo')
      if(res.code!==1)return this.$msg.error('用户头像获取失败')
      this.$store.commit('changeAvatar',res.data.avatar)
    },
    //处理下拉菜单列表的点击事件
    handleClick(command){
      if(command==="logout"){
        console.log("commandClick")
        this.logout();
      }else{
        this.$router.push('/userCenter')
      }
    }
  },
  computed:{
    isCollapse() {
      return this.$store.state.tab.isCollapse
    },
    avatar(){
      return this.$store.state.tab.avatar
    }
  },
  created(){
    this.userInfo()
  }

}
</script>

<style scoped lang="less">
.common-header{
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .l-content{
    width: 60px;
  }
  .r-content{
    width: 60px;
    text-align: center;
    cursor: pointer;
    img{
      width: 32px;
      height: 32px;
      object-fit: cover;
    }
  }
}
.toggle-button {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  cursor: pointer;
  margin-left: -13px;

  i {
    color: #333;
  }
}

.toggle-button:hover {
  background-color: #eef0f3;
}
</style>
