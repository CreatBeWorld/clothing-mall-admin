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
                退款原因
              </template>
              {{returnOrder.returnCause}}
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                问题描述
              </template>
              {{returnOrder.description}}
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions  :column="1" border >
            <el-descriptions-item>
              <template slot="label">
                订单金额
              </template>
              {{"￥"+details.payMoney}}
            </el-descriptions-item>
            <el-descriptions-item v-if="returnOrder.status!=='2'">
              <template slot="label">
                确认金额
              </template>
              ￥<el-input v-model="money" class="returnContact-input"  size="small" v-if="returnOrder.status==='0'"></el-input>
              <span v-else>{{returnOrder.returnMoney}}</span>
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
            <el-descriptions-item v-if="returnOrder.status!=='1'">
              <template slot="label">
                处理备注
              </template>
              <el-input v-model="returnOrder.remark" class="returnContact-input" v-if="returnOrder.status==='0'" size="small"></el-input>
              <span v-if="returnOrder.status==='2'">{{returnOrder.remark}}</span>
            </el-descriptions-item>
          </el-descriptions>
          <div class="operation" v-if="returnOrder.status==='0'">
            <el-button type="primary" size="medium" @click="confirmRefund">确认退款</el-button>
            <el-button type="danger"  size="medium" @click="rejectRefund">拒绝退款</el-button>
          </div>
        </div>
      </div>

    </el-card>
  </div>
</template>

<script>
export default {
  name: "RefundDetail",
  data(){
    return {
      id:'',//退货申请编号
      details:{},
      returnOrder:{},
      money:0,//确认金额
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
        case '1':status = '已完成'
          break
        case '2':status = '已拒绝'
          break
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
    },
    //确认退款
    async confirmRefund(){
      const d = {
        id:this.id,
        money:this.money*100
      }
      console.log(d)
      const {data:res} = await this.$http.get("returnOrder/agreeRefund",{params:d})
      if(res.code!==1)return;
      this.$msg({
        showClose: true,
        message: '确认退款操作成功',
        type: 'success',
        duration:2000
      });
      this.$router.push("/order/refund")
    },
    //拒绝退款
    async rejectRefund(){
      const {data:res} = await this.$http.get("returnOrder/rejectRefund",{params:{id:this.id,remark:this.returnOrder.remark}})
      if(res.code!==1)return
      this.$msg({
        showClose: true,
        message: '拒绝退款操作成功',
        type: 'success',
        duration:2000
      });
      this.$router.push("/order/refund")
    },

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

