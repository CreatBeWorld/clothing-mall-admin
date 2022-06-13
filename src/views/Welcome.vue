<template>
  <div class="welcome">
    服装购物网站后台管理系统
<!--    <el-row :gutter="24">-->
<!--      <el-col :span="6" v-for="item in lastDayDeal">-->
<!--        <el-card>-->
<!--          <div class="el-po">-->
<!--            <div class="order-icon">-->
<!--              <i :class="item.icon" ></i>-->
<!--            </div>-->
<!--            <div class="order-num">-->
<!--              <p class="title">{{item.name}}</p>-->
<!--              <p class="num">{{item.num}}</p>-->
<!--            </div>-->
<!--          </div>-->
<!--        </el-card>-->
<!--      </el-col>-->
<!--    </el-row>-->
<!--    <div class="month-deal">-->
<!--      <el-row>-->
<!--        <el-col :span="24">-->
<!--          <el-card>-->
<!--            <div style="height: 430px" ref="echarts">-->
<!--            </div>-->
<!--          </el-card>-->
<!--        </el-col>-->
<!--      </el-row>-->
<!--    </div>-->

  </div>
</template>

<script>
export default {
  name: "Welcome",
  data(){
    return{
      //昨日交易数据
      lastDayDeal:[
        {
          name:'访问数',
          icon:'el-icon-user',
          num:''
        },
        {
          name:'付款人数',
          icon:'el-icon-star-off',
          num:''
        },
        {
          name:'订单数',
          icon:'el-icon-goods',
          num:''
        },
        {
          name:'付款金额',
          icon:'el-icon-coin',
          num:''
        }
      ],
      dayDeal:{},
      // 上个月交易数据
      lastMonthDeal:[
      ],
      option:{
        title: {
          text: '上个月交易数据'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['浏览人数', '下单人数',  '付款人数', '付款订单数','付款金额']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['第一周', '第二周', '第三周', '第四周']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '浏览人数',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: '下单人数',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: '付款人数',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: '付款订单数',
            type: 'line',
            stack: 'Total',
            data: []
          },
          {
            name: '付款金额',
            type: 'line',
            stack: 'Total',
            data: []
          }
        ]
      },
    }
  },
  methods:{
    async getLastDayDeal(){
      const {data:res} = await this.$http.get('dealReport/getRangeDayDeal?date1=2022-04-04&date2=2022-04-05')
      if(res.code!==1)return;
      this.dayDeal = res.data;
      this.lastDayDeal[0].num =this.dayDeal.pvNum
      this.lastDayDeal[1].num =this.dayDeal.payNum
      this.lastDayDeal[2].num =this.dayDeal.paymentNum
      this.lastDayDeal[3].num =this.dayDeal.payMoney
    },
    async getRangeCategoryReport(){
      const {data:res1} = await this.$http.get('dealReport/getRangeDayDeal?date1=2022-04-01&date2=2022-04-07')
      if(res1.code!==1)return;
      this.lastMonthDeal.push(res1.data)
      const {data:res2} = await this.$http.get('dealReport/getRangeDayDeal?date1=2022-04-08&date2=2022-04-14')
      if(res2.code!==1)return;
      this.lastMonthDeal.push(res2.data)
      const {data:res3} = await this.$http.get('dealReport/getRangeDayDeal?date1=2022-04-15&date2=2022-04-21')
      if(res3.code!==1)return;
      this.lastMonthDeal.push(res3.data)
      const {data:res4} = await this.$http.get('dealReport/getRangeDayDeal?date1=2022-04-22&date2=2022-04-30')
      if(res4.code!==1)return;
      this.lastMonthDeal.push(res4.data)
      for(let i=0;i<this.lastMonthDeal.length;i++){
        let data = this.lastMonthDeal[i]
        this.option.series[0].data.push(data.pvNum)
        this.option.series[1].data.push(data.orderingNum)
        this.option.series[2].data.push(data.payNum)
        this.option.series[3].data.push(data.paymentNum)
        this.option.series[4].data.push(data.payMoney)
      }
      const e = this.$echarts.init(this.$refs.echarts)
      e.setOption(this.option)

    }

  },
  created() {
    // this.getLastDayDeal()
    // this.getRangeCategoryReport()
  }
}
</script>

<style scoped lang="less">
  .el-po{
    display: flex;
    justify-content: space-between;
  }
  .welcome .order-icon{
    width: 60px;
    height: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    i{
      display: block;
      width: 32px;
      height: 32px;
      font-size: 32px;
    }
  }
  .welcome .order-icon:hover{
    background-color: #40c9c6;
    border-radius: 5px;
  }
  .welcome .order-icon:hover i{
    transform: scale(1.3);
  }
  .welcome .order-num{
    margin-top: 5px;
    text-align: center;
    .title{
      color: #8c939d;
    }
    .num{
      margin-top: 5px;
      color: #666;
    }
  }
  .month-deal{
    margin-top: 20px;
  }
</style>
