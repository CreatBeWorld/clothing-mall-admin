<template>
  <div>
    <el-card>
      <!--   搜索   -->
      <div class="query">
        <el-row   class="row" :gutter="20" type="flex" justify="space-around">
          <el-col :span="8" class="po">
            <span>输入搜索：</span>
            <el-input placeholder="商品名称" v-model="queryInfo.name" size="medium"></el-input>
          </el-col>
          <el-col :span="8" class="po">
            <span>商品货号：</span>
            <el-input placeholder="商品货号" v-model="queryInfo.sn" size="medium"></el-input>
          </el-col>
          <el-col :span="4">
            <el-button @click="resetQuery" size="medium">重置</el-button>
          </el-col>
        </el-row>
        <el-row :gutter="20" type="flex" justify="space-around">
          <el-col :span="8" class="po">
            <span>上架状态：</span>
            <el-select v-model="queryInfo.isMarketable" placeholder="全部" clearable size="medium">
              <el-option :label="'上架'" :value="true"></el-option>
              <el-option :label="'下架'" :value="false"></el-option>
            </el-select>
          </el-col>
          <el-col :span="8" class="po">
            <span>审核状态：</span>
            <el-select v-model="queryInfo.status" placeholder="全部" clearable size="medium">
              <el-option :label="'审核通过'" :value="'1'"></el-option>
              <el-option :label="'审核不通过'" :value="'2'"></el-option>
              <el-option :label="'未审核'" :value="'0'"></el-option>
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-button type="primary"  size="medium" @click="findPage">查询搜索</el-button>
          </el-col>
        </el-row>
      </div>
      <!--   操作区   -->
      <div class="operation">
        <span>批量操作</span>
        <div>
          <el-button type="primary" size="medium" @click="pushMany">批量上架</el-button>
          <el-button type="primary" size="medium" @click="pullMany">批量下架</el-button>
        </div>
      </div>
      <!--  订单列表   -->
      <el-table :data="dataList" border stripe @selection-change="handleSelectionChange" size="medium" ref="multipleTable">
        <el-table-column
          type="selection"
          width="40">
        </el-table-column>
        <el-table-column type="index" label="编号" width="80px"></el-table-column>
        <el-table-column label="商品图片">
          <template slot-scope="scope">
            <img :src="scope.row.image" alt="" v-if="scope.row.image" class="table-img">
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="name" width="200"></el-table-column>
        <el-table-column label="货号" prop="sn"></el-table-column>
        <el-table-column label="是否上架" width="120">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.isMarketable" @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="销量" prop="saleNum"></el-table-column>
        <el-table-column label="审核状态">
          <template slot-scope="scope">
            <div>{{scope.row.status}}</div>
            <el-button type="text" @click="viewAuditDetail(scope.row.id)" v-if="scope.row.status!=='未审核'">审核详情</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <!--      查看商品信息    -->
            <el-button type="text" @click="viewDetail(scope.row.id)">查看</el-button>
            <!--      修改商品信息    -->
            <el-button type="text" @click="update(scope.row.id)">修改</el-button>
            <!--     商品审核   -->
            <el-button type="text" v-if="scope.row.status!=='审核通过'" @click="audit(scope.row.id)">商品审核</el-button>
            <!--     逻辑删除    -->
            <el-button type="text" v-if="scope.row.isDelete==='0'" @click="logicDelete(scope.row.id)">加入回收站</el-button>
            <!--    还原    -->
            <el-button type="text" v-if="scope.row.isDelete==='1'" @click="restore(scope.row.id)">还原</el-button>
            <!--    物理删除   -->
            <el-button type="text" v-if="scope.row.isDelete==='1'" @click="remove(scope.row.id)">永久删除</el-button>
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
  name: "GoodsList",
  data(){
    return {
      //获取商品列表的参数对象
      queryInfo:{
        name:'',//商品名称
        sn:'',//商品货号
        isMarketable:null,//是否上架
        status:'',//审核状态
        page:1,//当前页码
        size:5//每页显示条数
      },
      dataList:[],
      total:0,
      multipleSelection:[],


    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //重置查询搜索条件
    resetQuery(){
      this.queryInfo.name=''
      this.queryInfo.sn=''
      this.queryInfo.isMarketable=null
      this.queryInfo.status=''
    },
    //获取商品列表
    async findPage(){
      if(this.queryInfo.isMarketable===''){
        this.queryInfo.isMarketable = null
      }
      const {data:res} = await this.$http.get('/spu/findPage',{params:this.queryInfo})
      if(res.code!==1){
        this.dataList = []
        console.log('fail')
        return;
      }
      console.log(res)
      this.dataList = res.data.rows
      for (let i = 0; i < this.dataList.length; i++) {
        this.dataList[i].status = this.setStatus(this.dataList[i].status)
      }
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
    //刷新列表
    refreshTable(){
      this.queryInfo.page=1;
      this.queryInfo.size =5;
      this.findPage();
    },
    //处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    setStatus(status){
      let result = ""
      switch (status) {
        case "1":result="审核通过"
                 break;
        case "2":result="审核不通过"
          break;
        case "0":result="未审核"
          break;
      }
      return result
    },
    //批量上架
    async pushMany(){
      if(this.multipleSelection.length===0){
        this.$msg.error("请选择批量上架的商品")
      }
      else{
        //未上架商品
        const pullGoods = this.multipleSelection.filter(item=>{
          return !item.isMarketable
        })
        if(pullGoods.length===0){
          this.$msg.error("待批量上架的商品的上架状态已为上架状态，无需上架")
        }
        else{
          const auditSuccessGoods =pullGoods.filter(item=>{
            return item.status ==="审核通过"
          })
          if(auditSuccessGoods.length===0){
            this.$msg.error("商品需审核通过，才可以上架")
          }
          else{
            //弹框提示用户是否删除数据
            //用户确定，返回"confirm",取消返回"cancel"
            const confirmRes = await this.$confirm('是否要进行批量上架?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err=>err)
            if(confirmRes!=='confirm'){
              this.$refs.multipleTable.clearSelection()//取消表格勾选
              return this.$msg({
                showClose: true,
                message: '已经取消了批量上架',
                type: 'info',
                duration:2000
              });
            }
            const ids = auditSuccessGoods.map(item=>{
              return item.id
            })
            const {data:res} = await this.$http.post("/spu/pushMany",ids)
            if(res.code!==1){this.$msg.error(res.msg)}
            else{
              this.$msg.success(res.msg)
              this.refreshTable()
            }
          }
        }
      }
      this.$refs.multipleTable.clearSelection()//取消表格勾选

    },
    //批量下架
    async pullMany(){
      if(this.multipleSelection.length===0){
        this.$msg.error("请选择批量下架的商品")
      }
      else{
        //已上架商品
        const pushGoods = this.multipleSelection.filter(item=>{
          return item.isMarketable
        })
        if(pushGoods.length===0){
          this.$msg.error("待批量下架的商品的上架状态均为已下架状态，无需下架")
        }
        else{
          //弹框提示用户
          //用户确定，返回"confirm",取消返回"cancel"
          const confirmRes = await this.$confirm('是否要进行批量下架?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).catch(err=>err)
          if(confirmRes!=='confirm'){
            this.$refs.multipleTable.clearSelection()//取消表格勾选
            return this.$msg({
              showClose: true,
              message: '已经取消了批量下架',
              type: 'info',
              duration:2000
            });
          }
          const ids = pushGoods.map(item=>{
            return item.id
          })
          const {data:res} = await this.$http.post("/spu/pullMany",ids)
          if(res.code!==1){this.$msg.error(res.msg)}
          else{
            this.$msg.success(res.msg)
            this.refreshTable()
          }

        }
      }
      this.$refs.multipleTable.clearSelection()//取消表格勾选
    },
    //监听上下架状态改变
    async statusChange(row){
      if(row.isMarketable){
        //商品上架
        if(row.status!=="审核通过"){
          row.isMarketable=!row.isMarketable
          return this.$msg.error("商品需审核通过才可以上架")
        }
        const {data:res} = await this.$http.get("/spu/push",{params:{id:row.id}})
        if(res.code!==1){
          row.isMarketable=!row.isMarketable
          return  this.$msg.error(res.$msg)
        }
        this.$msg.success("商品上架成功")
        this.refreshTable()
      }
      else {
        const {data:res} = await this.$http.get("/spu/pull",{params:{id:row.id}})
        if(res.code!==1){
          row.isMarketable=!row.isMarketable
          return  this.$msg.error(res.$msg)
        }
        this.$msg.success("商品下架成功")
        this.refreshTable()
      }
    },
    //逻辑删除商品
    async logicDelete(id){
      //弹框提示用户
      //用户确定，返回"confirm",取消返回"cancel"
      const confirmRes = await this.$confirm('是否将该商品加入回收站?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      if(confirmRes!=='confirm'){
        return this.$msg({
          showClose: true,
          message: '已经取消了加入回收站',
          type: 'info',
          duration:2000
        });
      }
      const {data:res} = await this.$http.get("/spu/logicDelete",{params:{id}})
      if(res.code!==1){this.$msg.error(res.msg)}
      else{
        this.$msg.success("商品已加入回收站")
        this.refreshTable()
      }
    },
    //还原商品
    async restore(id){
      //弹框提示用户
      //用户确定，返回"confirm",取消返回"cancel"
      const confirmRes = await this.$confirm('是否将该商品从回收站回收?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      if(confirmRes!=='confirm'){
        return this.$msg({
          showClose: true,
          message: '已经取消了商品回收',
          type: 'info',
          duration:2000
        });
      }
      const {data:res} = await this.$http.get("/spu/restore",{params:{id}})
      if(res.code!==1){this.$msg.error(res.msg)}
      else{
        this.$msg.success("商品从回收站回收成功")
        this.refreshTable()
      }
    },
    //删除商品
    async remove(id){
      //弹框提示用户
      //用户确定，返回"confirm",取消返回"cancel"
      const confirmRes = await this.$confirm('是否将该商品永久删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      if(confirmRes!=='confirm'){
        return this.$msg({
          showClose: true,
          message: '已经取消删除商品',
          type: 'info',
          duration:2000
        });
      }
      const {data:res} = await this.$http.get("/spu/remove",{params:{id}})
      if(res.code!==1){this.$msg.error(res.msg)}
      else{
        this.$msg.success("删除商品成功")
        this.refreshTable()
      }
    },
    //查看商品信息
    viewDetail(id){
      this.$router.push({
        path:'/goods/detail',
        query:{
          id,
          type:'0'
        }
      })
    },
    //商品审核
    audit(id){
      this.$router.push({
        path:'/goods/detail',
        query:{
          id,
          type:'1'
        }
      })
    },
    //查看商品审核详情
    viewAuditDetail(id){
      this.$router.push({
        path:'/goods/detail',
        query:{
          id,
          type:'2'
        }
      })
    },
    // 修改商品信息
    update(id){
      this.$router.push({
        path:'/goods/update',
        query:{
          id
        }
      })
    },



  }
}
</script>

<style scoped lang="less">
.query{
  padding: 20px;
  border: 1px solid rgba(0,0,0,.1);
  .row{
    margin-bottom: 15px;
  }
  .po{
    display: flex;
    span{
      width: 120px;
      margin-top: 8px;
    }
    .el-input,.el-select{
      flex: 1;
    }
  }
}
.table-img{
  width: 80px;
  height: 80px;
  object-fit: cover;
}
.operation{
  margin-top: 10px;
  border: 1px solid rgba(0,0,0,.1);
  display: flex;
  padding: 10px;
  justify-content: space-between;
  span{
    margin-top: 8px;
  }

}
</style>
