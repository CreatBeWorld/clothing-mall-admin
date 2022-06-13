<template>
  <div>
    <el-card>
      <div class="add-category">
        <el-button type="primary" @click="addCategory">添加分类</el-button>
      </div>
      <!--   分类列表   -->
      <el-table :data="categoryList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="分类名称" prop="name"></el-table-column>
        <el-table-column label="级别" prop="level"></el-table-column>
        <el-table-column label="商品数量" prop="goodsNum"></el-table-column>
        <el-table-column label="是否显示">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.isShow" @change="setIsShow(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="导航栏">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.isMenu" @change="setIsMenu(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="设置">
          <template slot-scope="scope">
            <el-button type="text" :disabled="!scope.row.hasNext" @click="findNext(scope.row.id)">查看下级</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      修改分类     -->
            <el-button type="text" @click="updateCategory(scope.row)">修改</el-button>
            <!--     删除分类      -->
            <el-button type="text" @click="removeCategory(scope.row.id)">删除</el-button>
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
  name: "CategoryManage",
  data(){
    return{
      //获取商品分类列表的参数对象
      queryInfo:{
        parentId:0,
        page:1,//当前页码
        size:5//每页显示条数
      },
      categoryList:[],
      total:0,//总记录数
      parentCategory:[]
    }
  },
  //实现从当前页跳转到当前页数据刷新
  beforeRouteUpdate(to,from,next){
    if(to.fullPath!==from.fullPath){
      next()
      this.refreshTable()
    }
  },
  created() {
    this.queryInfo.parentId = this.$route.query.parentId?this.$route.query.parentId:0
    this.findPage()
  },
  methods:{
    //获取商品分类列表
    async findPage(){
      const {data:res} = await this.$http.get('/category/findPage',{params:this.queryInfo})
      if(res.code!==1)return;
      this.categoryList=res.data.rows
      this.total = res.data.total
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
    //刷新商品分类列表
    refreshTable(){
      this.queryInfo.parentId=this.$route.query.parentId?this.$route.query.parentId:0
      this.queryInfo.page=1;
      this.queryInfo.size =5;
      this.findPage();
    },
    //查看下级
    findNext(parentId){
      this.$router.push({
        path:'/goods/category',
        query:{parentId}
      })
    },
    //设置商品分类是否显示
    async setIsShow(row){
      const {data:res} = await this.$http.post('category/setIsShow',{id:row.id,status:row.isShow})
      if(res.code!==1){
        row.isShow = !row.isShow
        return  this.$msg({
          showClose: true,
          message: res.msg,
          type: 'error',
          duration:2000
        });

      }
      this.refreshTable()
    },
    //设置是否导航
    async setIsMenu(row){
      const {data:res} = await this.$http.post('category/setIsMenu',{id:row.id,status:row.isMenu})
      if(res.code!==1){
        row.isMenu = !row.isMenu
        return  this.$msg({
          showClose: true,
          message: res.msg,
          type: 'error',
          duration:2000
        });

      }
      this.refreshTable()

    },
    //删除商品分类
    async removeCategory(id){
      //验证能否删除商品分类
      const {data:res} = await this.$http.get('/category/canDelete',{params: {id}})
      if(res.code!==1)return;
      if(!res.data){
        return this.$msg({
          showClose: true,
          message: '该商品分类与其他数据有关联,无法删除',
          type: 'error',
          duration:2000
        });
      }
      else{
        //弹框提示用户是否删除数据
        //用户确定删除，返回"confirm",取消删除返回"cancel"
        const confirmRes = await this.$confirm('此操作将永久删除该商品分类, 是否继续?', '提示', {
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
        const {data:res}=await this.$http.get('category/delete',{params:{id}})
        if(res.code!==1){
          return this.$msg({
            showClose: true,
            message: res.msg,
            type: 'error',
            duration:2000
          });
        }
        this.$msg({
          showClose: true,
          message: '删除商品分类成功',
          type: 'success',
          duration:2000
        })
        this.refreshTable()
      }
    },
    getParentCategory(){
      this.parentCategory.push({
        name:'无上级分类',
        parentId:0
      })
      for (const category of this.categoryList) {
        this.parentCategory.push({
          name:category.name,
          parentId:category.id
        })
      }
      console.log("parentCategory",this.parentCategory)
      return this.parentCategory
    },
    //监听添加商品分类按钮的点击
   async addCategory(){
      const dataSend = {
        fnType:'新增商品分类',
        parentId:0,
        oldParentId:this.queryInfo.parentId
      }
      dataSend.parentCategory = this.getParentCategory()
      const {data:res} = await this.$http.get('template/getTemplate')
      if(res.code!==1)return;
      dataSend.template = res.data
      if(parseInt(this.queryInfo.parentId) !==0){
        this.$http.get(`category/parentCategory/${this.queryInfo.parentId}`).then(res=>{
          console.log(res)
          if(res.data.code!==1)return;
          dataSend.parentCategory.unshift({
            name:res.data.data,
            parentId:parseInt(this.queryInfo.parentId)
          })
          dataSend.parentId = parseInt(this.queryInfo.parentId)
          this.$store.commit('setAddOrUpdateCateData',dataSend)
          this.$router.push("/goods/category/addOrUpdateCate")
        })
      }else{
        this.$store.commit('setAddOrUpdateCateData',dataSend)
        this.$router.push("/goods/category/addOrUpdateCate")
      }
    },
    //监听修改商品分类按钮的点击
    async updateCategory(row){
      const dataSend={
        fnType:'修改商品分类',
        ...row,
        oldParentId:this.queryInfo.parentId
      }
      dataSend.parentCategory = this.getParentCategory().filter(p=>{
        return p.name!==dataSend.name
      })
      const {data:res} = await this.$http.get('template/getTemplate')
      if(res.code!==1)return;
      dataSend.template = res.data
      if(parseInt(this.queryInfo.parentId) !==0){
        this.$http.get(`category/parentCategory/${this.queryInfo.parentId}`).then(res=>{
          console.log(res)
          if(res.data.code!==1)return;
          dataSend.parentCategory.unshift({
            name:res.data.data,
            parentId:parseInt(this.queryInfo.parentId)
          })
          this.$store.commit('setAddOrUpdateCateData',dataSend)
          this.$router.push("/goods/category/addOrUpdateCate")
        })
      }else{
        this.$store.commit('setAddOrUpdateCateData',dataSend)
        this.$router.push("/goods/category/addOrUpdateCate")
      }
    }

  }
}
</script>

<style scoped>
.add-category{
  display: flex;
  justify-content: flex-end;
}
</style>
