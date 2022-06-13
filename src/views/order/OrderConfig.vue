<template>
  <el-card>
    <div class="order-config">
      <el-form :model="orderConfigForm" :rules="orderConfigFormRules" ref="orderConfigFormRef" label-width="160px">
        <el-form-item label="秒杀订单超过：" prop="seckillTimeout">
          <el-input  v-model.number="orderConfigForm.seckillTimeout">
            <template slot="append">分</template>
          </el-input>
          <span class="desc-title">未付款，订单自动关闭</span>
        </el-form-item>
        <el-form-item label="正常订单超过：" prop="orderTimeout" >
          <el-input  v-model.number="orderConfigForm.orderTimeout">
            <template slot="append">分</template>
          </el-input>
          <span class="desc-title">未付款，订单自动关闭</span>
        </el-form-item>
        <el-form-item label="发货超过：" prop="takeTimeout" >
          <el-input  v-model.number="orderConfigForm.takeTimeout">
            <template slot="append">天</template>
          </el-input>
          <span class="desc-title">未收货，订单自动完成</span>
        </el-form-item>
        <el-form-item label="订单完成超过：" prop="serviceTimeout" >
          <el-input  v-model.number="orderConfigForm.serviceTimeout">
            <template slot="append">天</template>
          </el-input>
          <span class="desc-title">自动结束交易，不能申请售后</span>
        </el-form-item>
        <el-form-item label="订单完成超过：" prop="commentTimeout" >
          <el-input  v-model.number="orderConfigForm.commentTimeout">
            <template slot="append">天</template>
          </el-input>
          <span class="desc-title"> 自动五星好评</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="setOrderConfig">提交</el-button>
        </el-form-item>

      </el-form>
    </div>
  </el-card>
</template>

<script>
export default {
  name: "OrderConfig",
  data(){
    return {
      orderConfigForm:{},
      orderConfigFormRules:{
        seckillTimeout:[
          { required: true, message: '秒杀订单超时时间不能为空'},
          { type: 'number', message: '秒杀订单超时时间必须为数字值'}
        ],
        orderTimeout:[
          { required: true, message: '正常订单超时时间不能为空'},
          { type: 'number', message: '正常订单超时时间必须为数字值'}
        ],
        takeTimeout:[
          { required: true, message: '订单自动完成时间不能为空'},
          { type: 'number', message: '订单自动完成时间必须为数字值'}
        ],
        serviceTimeout:[
          { required: true, message: '售后期限不能为空'},
          { type: 'number', message: '售后期限必须为数字值'}
        ],
        commentTimeout:[
          { required: true, message: '自动五星好评期限不能为空'},
          { type: 'number', message: '自动五星好评期限必须为数字值'}
        ]

      }
    }
  },
  created() {
    this.getOrderConfig()
  },
  methods:{
    async getOrderConfig(){
      const{data:res} = await this.$http.get('orderConfig/findById')
      if(res.code!==1)return;
      this.orderConfigForm = res.data
    },
     setOrderConfig(){
      this.$refs.orderConfigFormRef.validate(async valid=>{
        if(!valid)return
        const {data:res} = await this.$http.post('orderConfig/update',this.orderConfigForm)
        if(res.code!==1)return;
        this.$msg({
          showClose: true,
          message: '订单设置数据保存成功',
          type: 'success',
          duration:2000
        });
        this.getOrderConfig()

      })
    }
  }
}
</script>

<style scoped lang="less">
.order-config{
  padding: 20px 0;
  box-shadow: 0 0 2px rgba(0,0,0,.2);
  width: 50%;
  margin: 20px auto;
  .desc-title{
    margin-left: 15px;
  }
}
</style>
