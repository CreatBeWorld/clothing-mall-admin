<template>
  <div class="goods-detail">
    <el-card>
      <div class="content">
        <div class="status-desc">
          <span>{{title}}</span>
        </div>
        <div class="details">
          <!--     spu信息    -->
          <el-descriptions title="spu信息" direction="vertical" :column="4" border class="item">
            <el-descriptions-item label="商品编号">{{spu?spu.id:''}}</el-descriptions-item>
            <el-descriptions-item label="商品名称">{{spu?spu.name:''}}</el-descriptions-item>
            <el-descriptions-item label="商品货号">{{spu?spu.sn:''}}</el-descriptions-item>
            <el-descriptions-item label="商品图片">
              <img :src="spu.image" alt="" v-if="spu&&spu.image" class="spu-image">
            </el-descriptions-item>
            <el-descriptions-item label="销量">{{spu?spu.saleNum:0}}</el-descriptions-item>
            <el-descriptions-item label="评论数">{{spu?spu.commentNum:0}}</el-descriptions-item>
            <el-descriptions-item label="是否上架">{{isMarketable}}</el-descriptions-item>
            <el-descriptions-item label="审核状态">{{spu?spu.status:''}}</el-descriptions-item>
          </el-descriptions>
          <!--     sku信息     -->
          <div class="title">sku信息</div>
          <el-table :data="skuList" border stripe size="medium">
            <el-table-column label="商品图片" width="120px">
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
            <el-table-column label="价格/货号" width="160px">
              <template slot-scope="scope">
                <div>{{"价格：￥"+scope.row.price}}</div>
                <div>{{"货号："+scope.row.sn}}</div>
              </template>
            </el-table-column>
            <el-table-column label="属性"  prop="spec" width="200px"></el-table-column>
            <el-table-column label="库存"  prop="num"></el-table-column>
            <el-table-column label="库存预警值"  prop="alertNum" width="105"></el-table-column>
            <el-table-column label="重量">
              <template slot-scope="scope">
                <span>{{scope.row.weight+"克"}}</span>
              </template>
            </el-table-column>
            <el-table-column label="销量/评论数" fixed="right" width="200">
              <template slot-scope="scope">
                <div>{{"销量："+scope.row.saleNum}}</div>
                <div>{{"评论数："+scope.row.commentNum}}</div>
              </template>
            </el-table-column>
          </el-table>
          <!--     商品审核     -->
          <el-form :model="auditForm" :rules="auditFormRule" ref="auditFormRef" v-if="type==='1'" class="audit-form">
            <el-descriptions title="商品审核" :column="1" border>
              <el-descriptions-item>
                <template slot="label">
                  审核结果
                </template>
                <el-form-item  prop="auditResult">
                  <el-select v-model="auditForm.auditResult" placeholder="请选择审核结果" class="auditResult-select">
                    <el-option label="审核通过" value="审核通过"></el-option>
                    <el-option label="审核不通过" value="审核不通过"></el-option>
                  </el-select>
                </el-form-item>
              </el-descriptions-item>
              <el-descriptions-item>
                <template slot="label">
                  反馈详情
                </template>
                <el-form-item  prop="reason">
                  <el-input v-model="auditForm.reason"  placeholder="请输入反馈详情" class="reason-input"></el-input>
                </el-form-item>
              </el-descriptions-item>
              <el-descriptions-item>
                <template slot="label">
                  操作
                </template>
                <el-form-item>
                  <el-button type="primary" class="operation-btn" @click="audit">确定</el-button>
                  <el-button class="operation-btn" @click="reset">重置</el-button>
                </el-form-item>
              </el-descriptions-item>
            </el-descriptions>
          </el-form>
          <!--     审核详情     -->
          <div class="audit-record" v-if="type==='2'">
            <div class="title">审核详情</div>
            <el-timeline>
              <el-timeline-item
                v-for="(item, index) in auditRecord"
                :key="index"
                :color="'#0bbd87'"
                :timestamp="item.auditTime">
                <div>{{"审核结果："+item.auditResult+"。原因："+item.reason}}</div>
                <div>{{"审核员："+item.auditor}}</div>
              </el-timeline-item>
            </el-timeline>
          </div>


        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "AuditDetail",
  data(){
    return {
      id:'',//spu id
      type:'',//'0'-查看商品信息 '1'-商品审核 '2'-查看审核详情
      spu:null,
      skuList:[],
      auditForm:{
        id:'',
        status:'',
        auditResult:'',
        reason:''
      },
      auditFormRule:{
        auditResult:[
          { required: true, message: '请选择审核结果', trigger: 'change' }
        ],
        reason: [
          { required: true, message: '请输入反馈详情', trigger: 'blur' },
        ]

      },
      auditRecord:[]
    }
  },
  computed:{
    title(){
      let result = ''
      switch (this.type){
        case '0':result = '查看商品信息'
                 break;
        case '1':result = '商品审核'
          break;
        case '2':result = '商品审核详情'
          break;
      }
      return result
    },
    isMarketable(){
      return (this.spu)?(this.spu.isMarketable?'已上架':'未上架'):('')
    },
  },
  created() {
    this.id = this.$route.query.id
    this.type=this.$route.query.type
    this.getData()
    if(this.type==="2"){
      this.getAuditRecord()
    }
  },
  methods:{
    async getData(){
      const {data:res} = await this.$http.get("/spu/findGoodsById",{params:{id:this.id}})
      if(res.code!==1)return
      this.spu = res.data.spu
      this.spu.status = this.setStatus(this.spu.status)
      this.skuList = res.data.skuList
      for (let i = 0; i <this.skuList.length; i++) {
        this.skuList[i].price /=100
        this.skuList[i].spec = this.getSpec(this.skuList[i].spec)
      }
    },
    async getAuditRecord(){
      const{data:res} = await this.$http.get("/spu/viewAuditDetail",{params:{spuId:this.id}})
      if(res.code!==1)return
      this.auditRecord = res.data
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
    getSpec(spec){
      spec = spec.replace(/\'/g, '"')
      spec = Object.entries(JSON.parse(spec)).reduce((a,b)=>{
        return a+b[0]+'：'+b[1]+";"
      },'')
      return spec.substring(0,spec.length-1)
    },
    reset(){
      this.$refs.auditFormRef.resetFields()
    },
    //商品审核
    audit(){
      this.$refs.auditFormRef.validate(async valid=>{
        if(!valid)return
        this.auditForm.id = this.id
        this.auditForm.status = this.auditForm.auditResult==="审核通过"?"1":"2"
        const{data:res} = await this.$http.post("/spu/audit",this.auditForm)
        if(res.code!==1){
          this.$msg.error(res.msg)
        }
        else{
          this.$msg.success("商品审核成功")
        }
        this.$router.push("/goods/list")
      })
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
    .spu-image,
    .sku-image{
      width: 80px;
      height: 80px;
      object-fit: cover;
    }
    .title{
      font-size: 16px;
      font-weight: 700;
    }
    .reason-input,.auditResult-select{
     transform: translateY(10px);
      width: 320px!important;
    }
    .operation-btn{
      transform: translateY(10px);
    }
    .audit-form{
      margin-top: 10px;
    }
    .audit-record{
      margin-top: 15px;
      border: 1px solid rgba(0,0,0,.1);
      padding: 20px;
      .title{
        margin-bottom: 10px;
      }
    }

  }
}
</style>
