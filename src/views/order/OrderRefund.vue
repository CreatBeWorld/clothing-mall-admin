<template>
  <div>
    <el-card>
      <!--   搜索与添加区域   -->
      <el-row  type="flex" justify="space-between" class="query">
        <el-col :span="6" class="po">
          <span>输入搜索：</span>
          <el-input placeholder="服务单号" v-model="queryInfo.id"></el-input>
        </el-col>
        <el-col :span="6" class="po">
          <span>处理状态：</span>
          <el-select v-model="queryInfo.status" placeholder="全部" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.status"
              :label="item.label"
              :value="item.status">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="findPage">查询搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-col>
      </el-row>
      <!--  退货申请列表   -->
      <el-table :data="dataList" border stripe>
        <el-table-column label="服务单号" prop="id"></el-table-column>
        <el-table-column label="申请时间" prop="applyTime"></el-table-column>
        <el-table-column label="用户账号" prop="userAccount"></el-table-column>
        <el-table-column label="退款金额" prop="returnMoney"></el-table-column>
        <el-table-column label="申请状态" prop="status"></el-table-column>
        <el-table-column label="处理时间" prop="disposeTime"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      查看详情    -->
            <el-button type="text" @click="viewDetail(scope.row.id)">查看详情</el-button>
            <!--     删除品牌      -->
            <el-button type="text" @click="remove(scope.row)">删除</el-button>
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
  name: "OrderRefund",
  data(){
    return {
      //获取退款申请列表的参数对象
      queryInfo:{
        id:'',//服务单号
        status:'',//处理状态
        type:'2',//申请类型：退货
        page:1,//当前页码
        size:5//每页显示条数
      },
      statusOptions:[
        {
          status:'0',
          label:'待处理'
        },
        {
          status:'1',
          label:'已完成'
        },
        {
          status:'2',
          label:'已拒绝'
        }
      ],
      dataList:[],
      total:0
    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //获取退货申请列表
    async findPage(){
      const {data:res} = await this.$http.get('/returnOrder/findPage',{params:this.queryInfo})
      if(res.code!==1){
        this.dataList = []
        return;
      }
      this.dataList = res.data.rows
      for (let i = 0; i < this.dataList.length; i++) {
        this.dataList[i].returnMoney =  '￥'+this.dataList[i].returnMoney/100
        this.dataList[i].status = this.setStatus(this.dataList[i].status)
      }
      this.total = res.data.total
    },
    setStatus(status){
      return this.statusOptions.find(option =>{
        return option.status === status
      }).label
    },
    //重置查询搜索条件
    resetQuery(){
      this.queryInfo.id=''
      this.queryInfo.status=''
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
    //删除退款申请
    async remove(row){
      //验证能否删除退款申请
      if(row.status!=='已完成'){
        return this.$msg({
          showClose: true,
          message: '该退款申请还未处理完成,无法删除',
          type: 'error',
          duration:2000
        });
      }
      else{
        //弹框提示用户是否删除数据
        //用户确定删除，返回"confirm",取消删除返回"cancel"
        const confirmRes = await this.$confirm('此操作将永久删除该退货申请, 是否继续?', '提示', {
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
        const {data:res}=await this.$http.get('returnOrder/delete',{params:{id:row.id,type:row.type}})
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
          message: '删除退款申请成功',
          type: 'success',
          duration:2000
        })
        this.refreshTable()
      }
    },
    //监听查看详情按钮的点击
    viewDetail(id){
      this.$router.push({
        path:'/order/refund/details',
        query:{
          id
        }
      })
    }

  },

}
</script>

<style scoped lang="less">
.query{
  padding: 20px;
  border: 1px solid rgba(0,0,0,.1);
  .po{
    display: flex;
    span{
      width: 120px;
      margin-top: 8px;
    }
  }
}

</style>


