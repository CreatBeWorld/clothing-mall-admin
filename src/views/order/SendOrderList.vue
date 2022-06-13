<template>
  <div>
    <el-card>
      <div>发货列表</div>
      <!--  发货列表   -->
      <el-form :model="dataForm" ref="dataFormRef">
        <el-table :data="dataForm.dataList" border stripe class="freight-table">
          <el-table-column label="订单编号" prop="id"></el-table-column>
          <el-table-column label="收货人" prop="receiverContact"></el-table-column>
          <el-table-column label="联系方式" prop="receiverMobile"></el-table-column>
          <el-table-column label="收货地址" prop="receiverAddress"></el-table-column>
          <el-table-column label="配送方式" prop="shippingName">
            <template slot-scope="scope">
              <el-form-item
                :prop="'dataList.'+scope.$index+'.'+'shippingName'"
                :rules="dataFormRule.shippingName"
              >
                <el-select v-model="scope.row.shippingName" placeholder="请选择物流公司" size="small" class="freight-select">
                  <el-option
                    v-for="item in freightOptions"
                    :key="item.name"
                    :label="item.name"
                    :value="item.name">
                  </el-option>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="物流单号">
            <template slot-scope="scope">
              <el-form-item
                :prop="'dataList.'+scope.$index+'.'+'shippingCode'"
                :rules="dataFormRule.shippingCode"
              >
                <el-input
                  class="freight-select"
                  placeholder="请输入物流单号"
                  v-model="scope.row.shippingCode"
                  size="small"
                >
                </el-input>
              </el-form-item>
            </template>
          </el-table-column>

        </el-table>
        <el-form-item class="operation">
          <el-button type="primary" @click="batchSend">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </el-form-item>
      </el-form>


    </el-card>
  </div>
</template>

<script>
export default {
  name: "SendOrderList",
  data(){
    return {
      dataForm:{
        dataList:[]
      },
      freightOptions:[],
      dataFormRule:{
        shippingName:[
          { required: true, message: '请选择配送方式', trigger: 'change' },
        ],
        shippingCode:[
          { required: true, message: '请输入物流单号', trigger: 'blur' },
        ]
      },


    }
  },
  created() {
    this.getData()
  },
  methods:{
    getData(){
      if(Array.isArray(this.$route.query.dataList)){
        this.dataForm.dataList =  this.$route.query.dataList
      }
      else{
        this.dataForm.dataList.push(this.$route.query.dataList)
      }
      this.getFreightOptions()
    },
    async getFreightOptions(){
        const {data:res} =await this.$http.get("/order/freightOptions")
        if(res.code!==1)return
        this.freightOptions = res.data.map(d=>{
          return {
            name:d.name,
            type:d.type
          }
        })
    },
    cancel(){
      this.$router.push("/order/list")
    },
    //批量发货
    batchSend(){
      this.$refs.dataFormRef.validate(async valid=>{
        if(!valid)return
        const {data:res} = await this.$http.post("order/batchSend",this.dataForm.dataList)
        if(res.code!==1){
          return this.$msg.error(res.msg)
        }
        this.$msg({
          showClose: true,
          message: '发货成功',
          type: 'success',
          duration:2000
        })
        this.$router.push("/order/list")
      })
    }
  }
}
</script>

<style scoped lang="less">
  .operation{
    margin-top: 15px;
    text-align: center;
  }
</style>
