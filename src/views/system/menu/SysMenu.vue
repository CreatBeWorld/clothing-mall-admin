<template>
  <div>
    <el-card>
      <div class="add-menu">
        <el-button type="primary" @click="addMenu">添加菜单</el-button>
      </div>
      <!--   菜单列表   -->
      <el-table :data="menuList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="菜单名称" prop="name"></el-table-column>
        <el-table-column label="菜单级数" prop="level"></el-table-column>
        <el-table-column label="图标">
          <template slot-scope="scope">
            <i :class="scope.row.icon"></i>
          </template>
        </el-table-column>
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status"@change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="设置">
          <template slot-scope="scope">
            <el-button type="text" :disabled="!scope.row.hasNext" @click="findNext(scope.row.id)">查看下级</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      修改菜单     -->
            <el-button type="text" @click="editMenu(scope.row)">修改</el-button>
            <!--     删除菜单      -->
            <el-button type="text" @click="removeMenu(scope.row)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <!--   分页   -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[1,2, 5, 10]"
        :page-size="queryInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>

export default {
  name: "SysMenu",
  data(){
    return{
      //获取菜单列表的参数对象
      queryInfo:{
        parentId:0,
        page:1,//当前页码
        size:10//每页显示条数
      },
      menuList:[],
      total:0,//总记录数
      perms:['sys:manage',
        'sys:user:manage',
        'sys:role:manage',
        'sys:menu:manage'
      ],
      type:0,
      parentMenu:[]

    }
  },
  //实现从当前页跳转到当前页数据刷新
  beforeRouteUpdate(to,from,next){
    console.log(to,from)
    if(to.fullPath!==from.fullPath){
      next()
      this.queryInfo.parentId = this.$route.query.parentId?this.$route.query.parentId:0
      this.refreshTable()
    }
  },
  created() {
    this.queryInfo.parentId = this.$route.query.parentId?this.$route.query.parentId:0
    this.findPage()
  },
  methods:{
    //获取菜单列表
    async findPage(){
      const {data:res} = await this.$http.get('/sys/menu/findPage',{params:this.queryInfo})
      if(res.code!==1){
        // console.log("findPage列表获取失败")
        return;
      }
      this.menuList=res.data.rows
      this.total = res.data.total
      this.type = this.menuList[0].type
      console.log(this.menuList)
    },
    //监听pageSize改变的事件 每页显示多少条
    handleSizeChange(newSize){
      this.queryInfo.size =newSize
      this.queryInfo.page=1;
      this.findPage()
    },
    //监听页码值改变
    handleCurrentChange(newPage){
      this.queryInfo.page=newPage
      this.findPage()
    },
    //查看下级
    findNext(parentId){
      this.$router.push({
        path:'/sys/menu',
        query:{parentId:parentId}
      })
    },
    //刷新菜单列表
    refreshTable(){
      this.queryInfo.parentId=this.$route.query.parentId?this.$route.query.parentId:0
      this.queryInfo.page=1;
      this.queryInfo.size =10;
      this.findPage();
    },
    //设置菜单状态
    async statusChange(row){
      if(this.perms.includes(row.perms)){
        row.status = !row.status
        return this.$msg.error('该模块功能状态无法设置')
      }
      const {data:res} = await this.$http.post('sys/menu/setStatus',{id:row.id,status:row.status})
      if(res.code!==1){
        row.status = !row.status
        return  this.$msg({
          showClose: true,
          message: res.msg,
          type: 'error',
          duration:2000
        });

      }
      this.$msg({
        showClose: true,
        message: '设置菜单状态成功！',
        type: 'success',
        duration:2000
      });
      this.refreshTable()
      this.$store.dispatch("getMenuList",this)
    },
    //删除菜单
   async  removeMenu(row){
      if(this.perms.includes(row.perms)){
        return this.$msg.error('权限类菜单无法删除');
      }
      else{
        //弹框提示用户是否删除菜单
        //用户确定删除，返回"confirm",取消删除返回"cancel"
        const confirmRes = await this.$confirm('此操作将永久删除该菜单, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmRes!=='confirm'){
          return this.$msg({
            showClose: true,
            message: '已经取消了删除',
            type: 'info',
            duration:2000
          });
        }
        const {data:res}=await this.$http.post(`sys/menu/delete/${row.id}`)
        if(res.code!==1){
          console.log('sssss')
          return this.$msg({
            showClose: true,
            message: res.msg,
            type: 'error',
            duration:2000
          });
        }
        this.$msg({
          showClose: true,
          message: '删除菜单成功',
          type: 'success',
          duration:2000
        })
        this.refreshTable()
        this.$store.dispatch("getMenuList",this)
        this.$router.push('/sys/menu')
      }
    },
   getParentMenu(){
       this.parentMenu.push({
         name:'无上级菜单',
         parentId:0,
         type:-1
       })
       for (const menu of this.menuList) {
         this.parentMenu.push({
           name:menu.name,
           parentId:menu.id,
           type:menu.type
         })
       }
       console.log("parentMenu",this.parentMenu)
      return this.parentMenu
      },
    //修改菜单
    editMenu(row){
      const dataSend={
        fnType:'修改菜单',
        ...row,
      }
      dataSend.parentMenu = this.getParentMenu().filter(p=>{
        return p.name!==dataSend.name
      })
    if(parseInt(this.queryInfo.parentId) !==0){
      this.$http.get(`sys/menu/parentMenu/${this.queryInfo.parentId}`).then(res=>{
        console.log(res)
        if(res.data.code!==1)return;
        dataSend.parentMenu.unshift({
          name:res.data.data,
          parentId:parseInt(this.queryInfo.parentId),
          type:dataSend.type-1
        })
        this.$store.commit('setAddOrUpdateMenuData',dataSend)
        this.$router.push("/sys/menu/addOrUpdateMenu")
      })
    }else{
      this.$store.commit('setAddOrUpdateMenuData',dataSend)
      this.$router.push("/sys/menu/addOrUpdateMenu")
    }


    },
    //新增菜单
    addMenu(){
      const dataSend = {
        fnType:'新增菜单',
        type:this.type,
        parentId:0
      }
      dataSend.parentMenu = this.getParentMenu()
      if(parseInt(this.queryInfo.parentId) !==0){
        this.$http.get(`sys/menu/parentMenu/${this.queryInfo.parentId}`).then(res=>{
          console.log(res)
          if(res.data.code!==1)return;
          dataSend.parentMenu.unshift({
            name:res.data.data,
            parentId:parseInt(this.queryInfo.parentId),
            type:dataSend.type-1
          })
          dataSend.parentId = parseInt(this.queryInfo.parentId)
          this.$store.commit('setAddOrUpdateMenuData',dataSend)
          this.$router.push("/sys/menu/addOrUpdateMenu")
        })
      }else{
        this.$store.commit('setAddOrUpdateMenuData',dataSend)
        this.$router.push("/sys/menu/addOrUpdateMenu")
      }
    }

    },


}
</script>

<style scoped lang="less">
    .add-menu{
      display: flex;
      justify-content: flex-end;
    }
    .cell i{
      font-size: 16px;
    }
</style>
