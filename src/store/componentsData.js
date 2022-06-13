export default {
  state:{
    menuInfo:{},//SysMenu与AddOrUpdateMenu之间传递的数据
    categoryInfo:{}//CategoryManage与AddOrUpdateCate之间传递的数据
  },
  mutations:{
    setAddOrUpdateMenuData(state,val){
      state.menuInfo= val;
    },
    setAddOrUpdateCateData(state,val){
      state.categoryInfo = val
    }
  }
}
