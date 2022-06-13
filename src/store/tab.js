export default {
  state:{
    isCollapse:false,//左侧菜单导航栏是否折叠，false-展开
    tabList:[
      {
        path:'/welcome',
        name:'首页',
      }
    ],//面包屑数据
    currentMenuPath:'/welcome',//当前激活菜单
    avatar:'',//用户头像
    menuList:[],
  },
  mutations:{
    collapseMenu(state){
      state.isCollapse = !state.isCollapse
    },
    selectMenu(state,val){
      if(val.name!=='首页'){
        state.currentMenuPath = val.path;
        const result =state.tabList.findIndex(item=>item.path===val.path)
        if(result === -1){
          state.tabList.push(val)
        }
      }
      else{
        state.currentMenuPath='/welcome'
      }

    },
    closeTag(state,val){
      const res = state.tabList.findIndex(item=>item.name===val.name)
      state.tabList.splice(res,1)
    },
    setCurrentMenuPath(state,val){
      state.currentMenuPath = val;
    },
    changeAvatar(state,val){
      state.avatar = val;
    },
    setMenuList(state,val){
      state.menuList = val
    },
  },
  actions:{
    //获取左侧导航菜单列表
    async getMenuList(context,vueObj){
      const {data:res}=await  vueObj.$http.get('sys/menu/list')
      if(res.code!==1){
        return vueObj.$msg({
          showClose: true,
          message: res.msg,
          type: 'error',
          duration:2000
        });
      }
      context.commit('setMenuList',res.data)
    },

  }
}
