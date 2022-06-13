<template>
  <div>
    <el-card>
      <!--   搜索   -->
      <el-row  type="flex" justify="space-between" class="query">
        <el-col :span="6" class="po">
          <span>输入搜索：</span>
          <el-input placeholder="服务单号" v-model="queryInfo.id" size="medium"></el-input>
        </el-col>
        <el-col :span="6" class="po">
          <span>收货人：</span>
          <el-input placeholder="收货人" v-model="queryInfo.receiverContact" size="medium"></el-input>
        </el-col>
        <el-col :span="6" class="po">
          <span>订单状态：</span>
          <el-select v-model="queryInfo.orderStatus" placeholder="全部" clearable size="medium">
            <el-option
              v-for="item in statusOptions"
              :key="item.status"
              :label="item.label"
              :value="item.status">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="findPage" size="medium">查询搜索</el-button>
          <el-button @click="resetQuery" size="medium">重置</el-button>
        </el-col>
      </el-row>
      <!--   操作区   -->
      <div class="operation">
        <span>操作</span>
        <div>
          <el-button type="primary" size="medium" @click="batchSend">批量发货</el-button>
          <el-button type="primary" size="medium" @click="merge">合并订单</el-button>
        </div>
      </div>

      <!--  订单列表   -->
      <el-table :data="dataList" border stripe @selection-change="handleSelectionChange" size="medium" ref="multipleTable">
        <el-table-column
          type="selection"
          width="40">
        </el-table-column>
        <el-table-column label="订单编号" prop="id" width="180"></el-table-column>
        <el-table-column label="提交时间" prop="createTime" width="180"></el-table-column>
        <el-table-column label="用户账号" prop="username" width="180"></el-table-column>
        <el-table-column label="订单金额" prop="orderMoney" width="165"></el-table-column>
        <el-table-column label="支付方式" prop="payType" width="160"></el-table-column>
        <el-table-column label="订单状态" prop="orderStatus" width="180"></el-table-column>
        <el-table-column label="收货地址" prop="receiverAddress" width="250"></el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template slot-scope="scope">
            <!--      查看详情    -->
            <el-button type="text" @click="viewDetail(scope.row.id)">查看详情</el-button>
            <!--     关闭订单    -->
            <el-button type="text" v-if="scope.row.orderStatus==='待付款'" @click="closeOrder(scope.row.id)">关闭订单</el-button>
            <!--     订单发货    -->
            <el-button type="text" v-if="scope.row.orderStatus==='待发货'" @click="send(scope.row)">订单发货</el-button>
            <!--     删除订单    -->
            <el-button type="text" v-if="scope.row.orderStatus==='已关闭'" @click="remove(scope.row.id)">删除订单</el-button>
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
      <!--   合并订单对话框   -->
      <el-dialog
        title="合并订单"
        :visible.sync="mergeDialogVisible"
        width="30%"
        >
          <el-form :model="mergeForm" :rules="mergeFormRule" ref="mergeFormRef">
            <el-form-item label="主订单编号：" prop="masterId">
              <el-select v-model="mergeForm.masterId" placeholder="请选择主订单编号" size="medium">
                <el-option
                  v-for="item in mergeData"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="从订单编号：" prop="slaveId">
              <el-select v-model="mergeForm.slaveId" placeholder="请选择从订单编号" size="medium">
                <el-option
                  v-for="item in mergeData"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="confirmMerge">确 定</el-button>
          <el-button @click="cancelMerge">取消</el-button>
  </span>
      </el-dialog>
      <!--  关闭订单对话框    -->
      <el-dialog
        title="关闭订单"
        :visible.sync="closeOrderDialogVisible"
        width="30%"
      >
        <el-input
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="请输入操作备注"
          v-model="remarks">
        </el-input>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="confirmClose">确 定</el-button>
          <el-button @click="cancelClose">取消</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "OrderList",
  data(){
    return {
      //获取订单列表的参数对象
      queryInfo:{
        id:'',//订单编号
        receiverContact:'',//收货人
        orderStatus:'',//订单状态
        page:1,//当前页码
        size:5//每页显示条数
      },
      statusOptions:[
        {
          status:'0',
          label:'待付款'
        },
        {
          status:'1',
          label:'待发货'
        },
        {
          status:'2',
          label:'已发货'
        },
        {
          status:'3',
          label:'已完成'
        },
        {
          status:'4',
          label:'已关闭'
        },

      ],
      dataList:[],
      total:0,
      multipleSelection:[],//多选
      //合并订单
      mergeData:[],
      mergeDialogVisible:false,
      masterId:'',//主订单编号
      slaveId:'',//从订单编号
      mergeForm:{
        masterId:'',//主订单编号
        slaveId:''//从订单编号
      },
      mergeFormRule:{
        masterId: [
          { required: true, message: '请选择主订单编号', trigger: 'change' }
        ],
        slaveId: [
          { required: true, message: '请选择从订单编号', trigger: 'change' }
        ],
      },
      //关闭订单
      closeOrderDialogVisible:false,
      remarks:'',//关闭订单备注
      closeOrderId:'',//订单编号

    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //重置查询搜索条件
    resetQuery(){
      this.queryInfo.id=''
      this.queryInfo.orderStatus=''
      this.queryInfo.receiverContact=''
    },
    //获取订单列表
    async findPage(){
      const {data:res} = await this.$http.get('/order/findPage',{params:this.queryInfo})
      if(res.code!==1){
        this.dataList = []
        console.log('fail')
        return;
      }
      this.dataList = res.data.rows
      for (let i = 0; i < this.dataList.length; i++) {
        this.dataList[i].orderMoney = "￥"+(this.dataList[i].totalMoney+this.dataList[i].preMoney)/100
        this.dataList[i].payType = this.getPayType(this.dataList[i].payType)
        this.dataList[i].orderStatus = this.getOrderStatus(this.dataList[i].orderStatus)
      }
      this.total = res.data.total
    },
    getPayType(payType){
      let result = ''
      switch (payType){
        case '0':result = '货到付款'
                break;
        case '1':result = '微信支付'
                break;
        case '2':result = '支付宝'
                break;
        case '3':result = '银联支付'
                break;
        case '4':result = '未支付'
                break;
      }
      return result
    },
    getOrderStatus(orderStatus){
      for (const option of this.statusOptions) {
          if(option.status===orderStatus){
              return option.label
          }
      }
    },
    //处理多选
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
    //批量发货
    batchSend(){
      if(this.multipleSelection.length===0){
        return this.$msg.error("请选择待批量发货的订单")
      }
      else{
        const data = this.multipleSelection.filter(order=>{
          return order.orderStatus==='待发货'
        }).map(o=>{
          return {
            id:o.id,
            receiverContact:o.receiverContact,
            receiverMobile:o.receiverMobile,
            receiverAddress:o.receiverAddress,
            shippingName:o.shippingName?o.shippingName:'',
            shippingCode:''
          }
        })
        if(data.length===0){
          this.multipleSelection = []
          return this.$msg.error("所勾选的订单数据中不含待发货的订单")
        }
        else{
          this.$router.push({
            path:'/order/list/sendList',
            query:{
              dataList:data
            }
          })
        }
      }
    },
    //订单发货
    send(row){
      const data ={
        id:row.id,
        receiverContact:row.receiverContact,
        receiverMobile:row.receiverMobile,
        receiverAddress:row.receiverAddress,
        shippingName:row.shippingName?row.shippingName:'',
        shippingCode:''
      }
      this.$router.push({
        path:'/order/list/sendList',
        query:{
          dataList:data
        }
      })
    },
    //订单合并
    merge(){
      this.mergeData = []
      if(this.multipleSelection.length ===0){
        return this.$msg.error("请选择待合并的订单")
      }
      else{
        const data = this.multipleSelection.filter(order=>{
          return order.orderStatus==='待发货'
        }).map(o=>{
          return {
            id:o.id,
            receiverAddress:o.receiverAddress,
            receiverMobile:o.receiverMobile,
            receiverContact:o.receiverContact
          }
        })
        if(data.length!==2){
          return this.$msg.error("所选择的未发货的订单数量必须为2")
        }else{
          if(data[0].receiverAddress===data[1].receiverAddress&&data[0].receiverMobile===data[1].receiverMobile&&data[0].receiverContact===data[1].receiverContact){
            this.mergeData = data.map(d=>{
              return d.id
            })
            this.mergeDialogVisible = true
          }
          else{
            return this.$msg.error("主从订单的收货地址、收货人、联系方式必须相同才能进行订单合并")
          }

        }

      }

    },
    //取消合并订单
    cancelMerge(){
      this.mergeData = []
      this.clearData()
    },
    clearData(){
      this.mergeForm.masterId = ''
      this.mergeForm.slaveId = ''
      this.$refs.multipleTable.clearSelection()//取消表格勾选
      this.mergeDialogVisible = false
    },
    //确定合并订单
    confirmMerge(){
      this.$refs.mergeFormRef.validate(async valid=>{
        if(!valid)return
        if(this.mergeForm.masterId === this.mergeForm.slaveId){
          return this.$msg.error("主从订单编号不能相同")
        }
        else{
          const{data:res} = await this.$http.get("/order/merge",{params:this.mergeForm})
          if(res.code!==1){
            this.clearData()
            return this.$msg.error(res.msg)
          }
          this.$msg.success("合并订单成功")
          this.clearData()
          this.refreshTable()
        }
      })

    },
    //删除订单
    async remove(id){
      //弹框提示用户是否删除数据
      //用户确定删除，返回"confirm",取消删除返回"cancel"
      const confirmRes = await this.$confirm('此操作将逻辑删除该订单, 是否继续?', '提示', {
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
      const {data:res}=await this.$http.get('order/delete',{params:{id}})
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
        message: '逻辑删除订单成功',
        type: 'success',
        duration:2000
      })
      this.refreshTable()
    },
    //关闭订单
    closeOrder(id){
      this.closeOrderId = id
      this.closeOrderDialogVisible = true
    },
    //确定关闭订单
    async confirmClose(){
      const {data:res} =await this.$http.get("/order/closeOrder",{params:{id:this.closeOrderId,remarks:this.remarks}})
      if(res.code!==1){
        this.closeOrderDialogVisible =false
        this.remarks = ''
        return this.$msg.error(res.msg)
      }
      this.$msg.success("关闭订单成功")
      this.closeOrderDialogVisible = false
      this.remarks=''
      this.refreshTable()
    },
    //取消关闭订单
    cancelClose(){
      this.closeOrderDialogVisible = false
      this.remarks=''
    },
    //查看订单详情
    viewDetail(id){
      this.$router.push({
        path:'/order/list/detail',
        query:{
          id
        }
      })
    }

  }
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
