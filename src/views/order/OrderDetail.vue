<template>
  <div class="order-detail">
    <el-card>
      <!--  步骤条    -->
      <el-steps  align-center :active="orderStatus" finish-status="success">
        <el-step title="提交订单"></el-step>
        <el-step title="支付订单"></el-step>
        <el-step title="平台发货"></el-step>
        <el-step title="确认收货"></el-step>
        <el-step title="完成评价"></el-step>
      </el-steps>
      <div class="content">
        <div class="status-desc">
          <i class="el-icon-warning"></i>
          <span>{{`当前订单状态：`+status}}</span>
        </div>
        <div class="details">
          <!--     基本信息     -->
          <el-descriptions title="基本信息" direction="vertical" :column="4" border class="item">
            <el-descriptions-item label="订单编号">{{id}}</el-descriptions-item>
            <el-descriptions-item label="发货单流水号">暂无</el-descriptions-item>
            <el-descriptions-item label="用户账号">{{order?order.username:''}}</el-descriptions-item>
            <el-descriptions-item label="支付方式">{{order?order.payType:''}}</el-descriptions-item>
            <el-descriptions-item label="订单来源">{{order?order.sourceType:''}}</el-descriptions-item>
            <el-descriptions-item label="配送方式">{{shippingName}}</el-descriptions-item>
            <el-descriptions-item label="物流单号">{{shippingCode}}</el-descriptions-item>
            <el-descriptions-item label="自动确认收货时间">{{takeTimeout+'天'}}</el-descriptions-item>
          </el-descriptions>
          <!--     收货人信息     -->
          <el-descriptions title="收货人信息" direction="vertical" :column="3" border class="item">
            <el-descriptions-item label="收货人">{{order?order.receiverContact:''}}</el-descriptions-item>
            <el-descriptions-item label="收货地址">{{order?order.receiverAddress:''}}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{order?order.receiverMobile:''}}</el-descriptions-item>
          </el-descriptions>
          <!--     商品信息     -->
          <!--  订单列表   -->
          <div class="title">商品信息</div>
          <el-table :data="details" border stripe size="medium" >
            <el-table-column label="商品图片">
              <template slot-scope="scope">
                <img :src="scope.row.image" alt="" class="sku-image">
              </template>
            </el-table-column>
            <el-table-column label="商品名称" width="250px">
              <template slot-scope="scope">
                <div>{{scope.row.name}}</div>
                <div>{{"品牌："+scope.row.brandName}}</div>
              </template>
            </el-table-column>
            <el-table-column label="价格/货号" >
              <template slot-scope="scope">
                <div>{{"价格：￥"+scope.row.price}}</div>
                <div>{{"货号："+scope.row.sn}}</div>
              </template>
            </el-table-column>
            <el-table-column label="属性"  prop="spec" width="250px"></el-table-column>
            <el-table-column label="数量"  prop="num" width="100px"></el-table-column>
            <el-table-column label="小计">
              <template slot-scope="scope">
                <div>{{"￥"+scope.row.money}}</div>
              </template>
            </el-table-column>
          </el-table>
          <div class="total-money">
            <span>合计:</span>
            {{"￥"+(order?order.totalMoney:'')}}
          </div>
          <!--     费用信息     -->
          <el-descriptions title="费用信息" direction="vertical" :column="5" border class="item">
            <el-descriptions-item label="商品合计">{{"￥"+(order?order.totalMoney:'')}}</el-descriptions-item>
            <el-descriptions-item label="运费">{{"￥"+(order?order.postFee/100:'')}}</el-descriptions-item>
            <el-descriptions-item label="优惠金额">{{"￥"+(order?order.preMoney:'')}}</el-descriptions-item>
            <el-descriptions-item label="订单总金额">{{orderMoney}}</el-descriptions-item>
            <el-descriptions-item label="应付金额">{{payMoney}}</el-descriptions-item>

          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "OrderDetail",
  data(){
    return {
      id:'',//订单编号,
      order:null,
      orderStatus:0,
      status:'',
      takeTimeout:0,//自动确认收货时间
      details:[],
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
    }
  },
  created() {
    this.id = this.$route.query.id
    this.getOrder()
    this.getOrderDetail()
  },
  computed:{
    shippingName(){
      if(this.order){
          return !this.order.shippingName?"暂无":this.order.shippingName
      }else{
        return "暂无"
      }
    },
    shippingCode(){
      if(this.order){
        return !this.order.shippingCode?"暂无":this.order.shippingCode
      }else{
        return "暂无"
      }
    },
    orderMoney(){
      return "￥"+(this.order?(this.order.totalMoney+this.order.postFee/100):'')
    },
    payMoney(){
      return "￥"+(this.order?(this.order.totalMoney+this.order.postFee/100-this.order.preMoney):'')
    }
  },
  methods:{
    async getOrder(){
      const {data:res} = await this.$http.get("/order/findById",{params:{id:this.id}})
      if(res.code!==1)return
      this.order = res.data
      this.status = this.getOrderStatus(this.order.orderStatus)
      this.order.payType = this.getPayType(this.order.payType)
      this.order.sourceType = this.getSourceType(this.order.sourceType)
      this.order.totalMoney /=100
      if(this.order.orderStatus==='4'){
        this.orderStatus=1
      }else{
        this.orderStatus = this.order.orderStatus-0+1
        if(this.order.buyerRate){
          this.orderStatus = 5
        }
      }
    },
    async getOrderDetail(){
      const {data:res} = await this.$http.get("/order/orderDetails",{params:{id:this.id}})
      if(res.code!==1)return
      this.takeTimeout = res.data.takeTimeout
      this.details = res.data.orderItemDetailList
      for (let i = 0; i < this.details.length; i++) {
        this.details[i].price/=100
        this.details[i].money/=100
        this.details[i].spec = this.getSpec(this.details[i].spec)
      }
    },
    getOrderStatus(orderStatus){
      for (const option of this.statusOptions) {
        if(option.status===orderStatus){
          return option.label
        }
      }
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
    getSourceType(sourceType){
      let result = ""
      switch (sourceType){
        case "1":result = "pc端网站"
                 break;
        case "2":result = "app"
                 break;
        case "3":result="微信公众号"
                 break;
        case "4":result="微信小程序"
                 break;
        case "5":result ="H5手机页面"
                 break;
      }
      return result
    },
    getSpec(spec){
      spec = spec.replace(/\'/g, '"')
      spec = Object.entries(JSON.parse(spec)).reduce((a,b)=>{
        return a+b[0]+'：'+b[1]+";"
      },'')
      return spec.substring(0,spec.length-1)
    }
  }
}
</script>

<style scoped lang="less">
  .content{
    width: 90%;
    margin: 0 auto;
    border: 1px solid rgba(0,0,0,.1);
    .status-desc{
      height: 80px;
      line-height: 80px;
      padding-left: 20px;
      color: red;
      background-color: #f2f6fc;
      span{
        margin-left: 5px;
      }
    }
    .details{
      padding: 20px;
      .item{
        margin-bottom: 15px;
      }
      .sku-image{
        width: 80px;
        height: 80px;
        object-fit: cover;
      }
      .title{
        font-size: 16px;
        font-weight: 700;
      }
      .total-money{
        margin-top: 15px;
        text-align: right;
        color: red;
        span{
          color: #333;
        }
      }
    }
  }
</style>
