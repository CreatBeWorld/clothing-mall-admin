<template>
  <div class="assign-menu">
    <el-card>
      <div class="content">
        <el-tree
          :data="menuList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="menuIds"
          default-expand-all
          ref="treeRef"
        >
        </el-tree>
        <div class="operation">
          <el-button type="success" @click="assignPerms">保存</el-button>
          <el-button type="primary" @click="clearCheckedMenus">清空</el-button>
          <el-button @click="cancelBtn">取消</el-button>
        </div>
      </div>

    </el-card>
  </div>
</template>

<script>
export default {
  name: "AssignMenu",
  data(){
    return {
      menuList:[],//菜单列表
      menuIds:[],//角色拥有的菜单,
      treeProps:{//树形控件的属性绑定对象
        label:'name',
        children:'children'

      },
      roleId:0,
    }
  },
  created() {
    this.getMenuList()
  },
  methods:{
    async getMenuList(){
      this.roleId = this.$route.query.roleId
      console.log(this.roleId)
      const {data:res} = await this.$http.get('sys/menu/list')
      const {data:res1} = await this.$http.get('sys/role/getMenuIdsByRoleId',{params:{roleId:this.roleId}})
      if(res.code!==1)return this.$msg.error(res.msg)
      if(res1.code!==1)return this.$msg.error(res1.msg)
      this.menuList = res.data.slice(1)
      this.menuIds = res1.data
      console.log(this.menuList)
      console.log(this.menuIds)

    },
    //监听保存按钮的点击
    async assignPerms(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const {data:res} = await this.$http.post(`sys/role/perm/${this.roleId}`,keys)
      if(res.code!==1)return this.$msg.error(res.msg)
      this.$msg.success('分配成功')
      this.$router.push('/sys/role')
    },
    //监听清空按钮的点击
    clearCheckedMenus(){
     this.$refs.treeRef.setCheckedKeys([])
    },
    //监听取消按钮的点击
    cancelBtn(){
      this.$router.push('/sys/role')
    }

  }
}
</script>

<style scoped lang="less">
  .content{
    width: 60%;
    margin: 0 auto;
    padding: 40px;
    box-shadow: 0 0 2px rgba(0,0,0,.2);
  }
  .operation{
   padding-top: 30px;
    display: flex;
    justify-content: center;
  }
</style>
