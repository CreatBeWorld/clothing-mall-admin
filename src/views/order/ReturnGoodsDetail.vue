<template>
  <div class="return">
    <el-card>
      <div class="content">
        <div class="border">
          <!--   退货商品信息   -->
          <el-descriptions title="退货商品" direction="vertical" :column="6" border class="goods">
            <el-descriptions-item label="商品图片">
              <img :src="details.image" alt=""class="img">
            </el-descriptions-item>
            <el-descriptions-item label="商品名称">
              <div>{{details.name}}</div>
              <div>{{"品牌："+details.branName}}</div>
            </el-descriptions-item>
            <el-descriptions-item label="价格/货号">
              <div>{{"价格：￥"+details.price}}</div>
              <div>{{"货号："+details.sn}}</div>
            </el-descriptions-item>
            <el-descriptions-item label="属性">{{details.spec}}</el-descriptions-item>
            <el-descriptions-item label="数量">{{details.num}}</el-descriptions-item>
            <el-descriptions-item label="合计">{{"￥"+details.payMoney}}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="border desc">
          <!--   服务单信息   -->
          <el-descriptions title="服务单信息" :column="1" border>
            <el-descriptions-item>
              <template slot="label">
                服务单号
              </template>
              {{id}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                申请状态
              </template>
              {{status}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                订单明细编号
              </template>
              {{returnOrder.orderItemId}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                申请时间
              </template>
              {{returnOrder.applyTime}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                用户账号
              </template>
              {{returnOrder.userAccount}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                联系人
              </template>
              {{returnOrder.linkman}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                联系电话
              </template>
              {{returnOrder.linkmanMobile}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                退货原因
              </template>
              {{returnOrder.returnCause}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                问题描述
              </template>
              {{returnOrder.description}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                凭证图片
              </template>
              <img :src="item" alt="" v-for="item in returnOrder.evidence" class="img">
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions  :column="1" border >
            <el-descriptions-item>
              <template slot="label">
                订单金额
              </template>
              {{"￥"+returnOrder.returnMoney}}
            </el-descriptions-item>
            <el-descriptions-item v-if="returnOrder.status!=='2'">
              <template slot="label">
                收货人姓名
              </template>
              <el-input v-model="returnContact.name" class="returnContact-input" v-if="returnOrder.status==='0'" size="small"></el-input>
              <span v-else>{{returnContact.name}}</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="returnOrder.status!=='2'">
              <template slot="label">
                收货地址
              </template>
              <el-input v-model="returnContact.address" class="returnContact-input" v-if="returnOrder.status==='0'" size="small"></el-input>
              <span v-else>{{returnContact.address}}</span>
            </el-descriptions-item>
            <el-descriptions-item v-if="returnOrder.status!=='2'">
              <template slot="label">
                联系电话
              </template>
              <el-input v-model="returnContact.phone" class="returnContact-input" v-if="returnOrder.status==='0'" size="small"></el-input>
              <span v-else>{{returnContact.phone}}</span>
            </el-descriptions-item>

          </el-descriptions>
          <el-descriptions  :column="1" border >
            <el-descriptions-item v-if="returnOrder.status!=='0'">
              <template slot="label">
                处理人员
              </template>
              {{returnOrder.adminName}}
            </el-descriptions-item>
            <el-descriptions-item v-if="returnOrder.status!=='0'">
              <template slot="label">
                处理时间
              </template>
              {{returnOrder.disposeTime}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                处理备注
              </template>
              <el-input v-model="returnOrder.remark" class="returnContact-input" v-if="returnOrder.status==='0'" size="small"></el-input>
              <span v-else>{{returnOrder.remark}}</span>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions  :column="1" border  v-if="returnOrder.status==='1'||returnOrder.status==='3'">
            <el-descriptions-item v-if="returnOrder.status==='3'">
              <template slot="label">
               收货人员
              </template>
              {{returnOrder.receiverName}}
            </el-descriptions-item>
            <el-descriptions-item v-if="returnOrder.status==='3'">
              <template slot="label">
                收货时间
              </template>
              {{returnOrder.receiveTime}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                收货备注
              </template>
              <el-input v-model="returnOrder.receiverRemark" class="returnContact-input"  size="small" v-if="returnOrder.status==='1'"></el-input>
              <span v-else>{{returnOrder.receiverRemark}}</span>
            </el-descriptions-item>

          </el-descriptions>
          <div class="operation" v-if="returnOrder.status==='0'||returnOrder.status==='1'">
            <el-button type="primary" v-if="returnOrder.status==='0'" size="medium" @click="confirmReturnGoods">确认退货</el-button>
            <el-button type="danger" v-if="returnOrder.status==='0'" size="medium" @click="rejectReturnGoods">拒绝退货</el-button>
            <el-button type="primary" v-if="returnOrder.status==='1'" size="medium" @click="confirmReceipt">确认收货</el-button>
          </div>
        </div>
      </div>

    </el-card>
  </div>
</template>

<script>
export default {
  name: "ReturnGoodsDetail",
  data(){
    return {
      id:'',//退货申请编号
      details:{},
      returnOrder:{},
      returnContact:{//同意退款收货人信息
        name:'',
        phone:'',
        address:''
      }
    }
  },
  created() {
    this.id = this.$route.query.id
    this.viewDetail()
    this.getInfoById()
  },
  computed:{
    status(){
      let status = ''
      switch (this.returnOrder.status){
        case '0':status ='待处理'
                  break;
        case '1':status = '退货中'
                 break
        case '2':status = '已拒绝'
                  break
        case '3':status = '已完成'
                 break;
      }
      return status
    }
  },
  methods:{
    async viewDetail(){
      const {data:res} = await this.$http.get('returnOrder/viewDetail',{params:{id:this.id}})
      if(res.code!==1)return
      this.details = res.data
      this.details.name = this.details.name.substring(0 ,this.details.name.indexOf(' '))
      this.details.price /=100
      this.details.payMoney /=100
      this.details.spec = this.details.spec.replace(/\'/g, '"')
      this.details.spec = Object.entries(JSON.parse(this.details.spec)).reduce((a,b)=>{
        return a+b[0]+'：'+b[1]+";"
      },'')
      this.details.spec = this.details.spec.substring(0,this.details.spec.length-1)
    },
    //获取returnOrder信息
    async getInfoById(){
      const {data:res} = await this.$http.get('returnOrder/getInfoById',{params:{id:this.id}})
      if(res.code!==1)return
      this.returnOrder = res.data
      this.returnOrder.returnMoney/=100
      this.returnOrder.evidence = this.returnOrder.evidence.split(',')
      this.getReturnContact()
    },
    //获取同意退货联系人信息
    async getReturnContact(){
        if(this.returnOrder.status==='1'||this.returnOrder.status==='3'){
          const{data:res} = await this.$http.get("returnOrder/getReturnContact",{params:{returnOrderId:this.id}})
          if(res.code!==1){
            return
          }
          this.returnContact.name = res.data.name
          this.returnContact.phone = res.data.phone
          this.returnContact.address = res.data.address
        }
    },
    //确认退货
    async confirmReturnGoods(){
      const d = {
        id:this.id,
        remark:this.returnOrder.remark,
        ...this.returnContact
      }
      console.log(d)
      const {data:res} = await this.$http.get("returnOrder/agreeReturnGoods",{params:d})
      if(res.code!==1)return;
      this.$msg({
        showClose: true,
        message: '确认退货操作成功',
        type: 'success',
        duration:2000
      });
      this.$router.push("/order/returnGoods")
    },
    //拒绝退货
    async rejectReturnGoods(){
      const {data:res} = await this.$http.get("returnOrder/rejectReturnGoods",{params:{id:this.id,remark:this.returnOrder.remark}})
      if(res.code!==1)return
      this.$msg({
        showClose: true,
        message: '拒绝退货操作成功',
        type: 'success',
        duration:2000
      });
      this.$router.push("/order/returnGoods")
    },
    //确认收货
    async confirmReceipt(){
      const {data:res} = await this.$http.get("returnOrder/confirmReceipt",{params:{id:this.id,receiverRemark:this.returnOrder.receiverRemark}})
      if(res.code!==1)return
      this.$msg({
        showClose: true,
        message: '确认收货操作成功',
        type: 'success',
        duration:2000
      });
      this.$router.push("/order/returnGoods")


    }
  }
}
</script>

<style scoped lang="less">
.content{
  width: 80%;
  margin: 0 auto;
  .border{
    margin-bottom: 20px;
    padding: 20px;
    border: 1px solid rgba(0,0,0,.1);
    border-radius: 5px;
    .returnContact-input{
      width: 250px;
    }
    .operation{
      display: flex;
      justify-content: center;
    }
  }
}
  .img{
    height: 80px;
    width: 80px;
    object-fit: cover;
  }
</style>
