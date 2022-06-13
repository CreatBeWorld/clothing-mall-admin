<template>
<div>
  <el-card>
    <div class="content">
      <!--  步骤条    -->
      <el-steps  align-center :active="activeIndex-0" finish-status="success">
        <el-step title="填写商品信息"></el-step>
        <el-step title="填写商品规格与属性"></el-step>
        <el-step title="填写sku信息"></el-step>
        <el-step title="上传商品图片"></el-step>
        <el-step title="保存商品信息"></el-step>
      </el-steps>
      <!--  tab栏区域    -->
        <!--  :before-leave="beforeTabLeave"    -->
        <el-tabs :tab-position="'left'"  v-model="activeIndex" @tab-click="tabClick" :before-leave="beforeTabLeave">
          <el-tab-pane label="填写商品信息" name="0">
            <el-form :model="addFrom" :rules="addFormRules" ref="addFormRef" label-width="100px">
              <el-form-item label="商品名称" prop="name">
                <el-input v-model="addFrom.name"></el-input>
              </el-form-item>
              <!--    商品分类     -->
              <el-form-item label="商品分类" prop="goodsCate">
                <el-cascader
                  v-model="addFrom.goodsCate"
                  :options=" threeCate"
                  :props="cateProps"
                  @change="handleChange">
                </el-cascader>
              </el-form-item>
            <!--    商品品牌        -->
              <el-form-item label="商品品牌" prop="brandId">
                <el-select v-model="addFrom.brandId" placeholder="请选择品牌">
                  <el-option :label="item.name" :value="item.id" v-for="item in brandList"></el-option>
                </el-select>
              </el-form-item>

            <el-form-item label="商品货号" prop="sn">
              <el-input v-model="addFrom.sn"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="weight">
              <el-input v-model.number="addFrom.weight">
                <template slot="append">克</template>
              </el-input>
            </el-form-item>
              <el-form-item label="所属区域" prop="area">
                <el-select v-model="addFrom.area" placeholder="请选择城市">
                  <el-option :label="item" :value="item" v-for="item in province"></el-option>
                </el-select>
              </el-form-item>
            <!--    商品模板信息        -->
              <el-form-item label="模板" prop="templateId">
                <el-select v-model="addFrom.templateId" placeholder="请选择模板" @change="templateIdHasChange=true">
                  <el-option :label="item.name" :value="item.templateId" v-for="item in templateList"></el-option>
                </el-select>
              </el-form-item>
            <!--      主图片      -->
              <el-form-item label="主图片">
                <el-upload
                  class="upload-demo"
                  :action="uploadUrl"
                  :headers="headerObj"
                  :limit="1"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-success="handleSuccess"
                  list-type="text">
                  <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
              </el-form-item>
            <el-form-item label="图片列表">
              <el-upload
                class="upload-demo img-4"
                :action="uploadUrl"
                :headers="headerObj"
                :on-preview="handlePreview"
                :on-remove="handleIntroductionRemove"
                :on-success="handleIntroductionSuccess"
                list-type="text">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item label="商品排序" prop="seq">
              <el-input v-model.number="addFrom.seq"></el-input>
            </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="填写商品规格与属性" name="1">
            <el-form :model="specParaForm"
                     class="specPara"
                     ref="specParaFormRef"
                     label-position="top"
                     label-width="100px">
              <div class="spec-title">商品规格:</div>
              <div class="form-items">
                <el-form-item :label="item.name+':'"  v-for="(item,index) in specList">
                  <el-checkbox-group v-model="specParaForm.spec[index].options">
                    <el-checkbox :label="option" :name="index+''" v-for="option in item.options"></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-input placeholder="请输入商品规格属性值" v-model="specParaForm.addContent" class="input-with-select">
                  <el-select v-model="specParaForm.index" slot="prepend" placeholder="请选择">
                    <el-option :label="item.name" :value="index" v-for="(item,index) in specList"></el-option>
                  </el-select>
                  <el-button slot="append" icon="el-icon-circle-plus-outline" type="primary" @click="addSpecValue">新增</el-button>
                </el-input>
              </div>
              <div class="spec-title">商品参数:</div>
              <div class="form-items">
                <el-form-item :label="item.name+':'"  v-for="(item,index) in paraList">
                  <el-select v-model="specParaForm.para[index].options" :placeholder="'请选择'+item.name">
                    <el-option :label="i" :value="i" v-for="i in item.options"></el-option>
                  </el-select>
                </el-form-item>
              </div>


            </el-form>
          </el-tab-pane>
          <el-tab-pane label="填写sku信息" name="2">
            <el-button type="primary" @click="createSku">生成sku列表</el-button>
            <!-- sku组合可视化显示 -->
            <el-form :model="skuForm" ref="skuListFormRef" class="skuForm">
              <el-table  :data="skuForm.skuListForm" border stripe>
                <el-table-column type="index" label="编号"></el-table-column>
                <el-table-column
                  align="center"
                  :label="item"
                  v-for="(item,index) in specName"
                  :key="index"
                  :prop="item"
                ></el-table-column>
                <el-table-column label="价格(分)" align="center">
                  <template slot-scope="scope">
                    <el-form-item
                      :prop="'skuListForm.'+scope.$index+'.'+'price'"
                      :rules="skuRule.price"
                    >
                      <el-input
                        style="margin-top:15px"
                        placeholder="请输入"
                        v-model.number="scope.row.price"
                      ></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="商品货号" align="center">
                  <template slot-scope="scope">
                    <el-form-item
                      :prop="'skuListForm.'+scope.$index+'.'+'sn'"
                      :rules="skuRule.sn"
                    >
                      <el-input
                        style="margin-top:15px"
                        placeholder="请输入"
                        v-model="scope.row.sn"
                      ></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="库存" align="center">
                  <template slot-scope="scope">
                    <el-form-item
                      :prop="'skuListForm.'+scope.$index+'.'+'num'"
                      :rules="skuRule.num"
                    >
                      <el-input
                        style="margin-top:15px"
                        placeholder="请输入"
                        v-model.number="scope.row.num"
                      ></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="库存预警值" align="center">
                  <template slot-scope="scope">
                    <el-form-item
                      :prop="'skuListForm.'+scope.$index+'.'+'alertNum'"
                      :rules="skuRule.alertNum"
                    >
                      <el-input
                        style="margin-top:15px"
                        placeholder="请输入"
                        v-model.number="scope.row.alertNum"
                      ></el-input>
                    </el-form-item>
                  </template>
                </el-table-column>
              </el-table>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="上传商品图片" name="3">
            <div class="sku-upload" v-for="item in skuForm.skuListForm">
              <div class="title">{{Object.values(item.spec).join(' ')}}</div>
              <div class="img-up">
                <div class="img-layout">
                  <div class="goods-images-title">主图片:</div>
                  <el-upload
                    class="upload-demo img-4"
                    :action="uploadUrl"
                    :headers="headerObj"
                    :limit="1"
                    :on-preview="handlePreview"
                    :on-remove="handleRemoveSkuImg.bind(null,item)"
                    :on-success="handleSuccessSkuImg.bind(null,item)"
                    list-type="text">
                    <el-button size="small" type="primary">点击上传</el-button>
                  </el-upload>
                </div>
                <div class="img-layout">
                  <div class="goods-images-title">商品相册:</div>
                  <el-upload
                    class="upload-demo img-4"
                    :action="uploadUrl"
                    :headers="headerObj"
                    :on-preview="handlePreview"
                    :on-remove="handleSkuMultiRemove.bind(null,item)"
                    :on-success="handleSkuMultiSuccess.bind(null,item)"
                    list-type="text">
                    <el-button size="small" type="primary">点击上传</el-button>
                  </el-upload>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="保存商品信息" name="4">
            <el-button type="primary" class="save" @click="saveGoods">保存</el-button>
          </el-tab-pane>
        </el-tabs>
    </div>

  </el-card>
  <!-- 图片预览 -->
  <el-dialog
    title="图片预览"
    :visible.sync="previewVisible"
    width="50%"
    >
    <img :src="previewPath" alt="" class="previewImg">
  </el-dialog>
</div>
</template>

<script>
import province from "../../utils/province";

export default {
  name: "AddGoods",
  data(){
    return {
      activeIndex:'0',
      finalData:{
        spu:{},//spu信息
        skuList:[]//sku列表
      },
      province:[],
      //商品信息的表单数据对象
      addFrom:{
        name:'',//商品名称
        brandId:'',//品牌id
        category1Id:0,//一级分类id,
        category2Id:0,//二级分类id,
        category3Id:0,//三级分类id,
        images:'',//图片列表
        image:'',
        area:'',//所属区域
        sn:'',//商品货号,
        templateId:'',//模板编号
        paraItems:'',
        specItems:'',
        seq:0,//排序
        weight:0,//商品重量   最后提交数据时，spu不提交该数据,
        goodsCate:[],//商品分类id  最后提交数据时，只提取首项
      },
      addFormRules:{
        goodsCate:[
          { required: true, message: '请选择商品分类', trigger: 'change' },
        ],
        name:[
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        sn: [
          { required: true, message: '请输入商品货号', trigger: 'blur' },
        ],
        seq:[
          { required: true, message: '排序不能为空'},
          { type: 'number', message: '排序必须为数字值'}
        ],
        weight:[
          { required: true, message: '商品重量不能为空'},
          { type: 'number', message: '商品重量必须为数字值'}
        ],
        brandId: [
          { required: true, message: '请选择品牌', trigger: 'change' }
        ],
        area: [
          { required: true, message: '请选择城市', trigger: 'change' }
        ],
        templateId: [
          { required: true, message: '请选择模板', trigger: 'change' }
        ]
      },
      introductionImg:[],
      //商品分类列表
      threeCate:[],//三级分类下拉列表
      cateProps:{
        label:'name',
        value:'id',
        children:'children',
        expandTrigger: 'hover'
      },
      brandList:[],//品牌下拉列表
      templateList:[],//模板下拉列表,
      formRefs:[],
      uploadUrl:'http://localhost:9100/clothing_mall_backend/upload/oss?folderName=goods',
      headerObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
    //  图片预览
      previewPath:'',
      previewVisible:false,
      templateIdHasChange:false,
      //商品规格与属性
      specPara:null,
      specList:[],
      paraList:[],
      //表单对象
      specParaForm:{
        spec:[],
        para:[],
        addContent:'',//待新增的规格值
        index:'',//下拉列表索引
      },
      //sku信息
      specName:[],
      skuArray: [],
      skuList: [],
      skuForm:{
        skuListForm:[],
      },
      skuListFormRef:{},
      skuRule:{
        price:[
          { required: true, message: '价格不能为空', trigger: 'blur' },
          { type: 'number', message: '价格为数字值'}
        ],
        sn:[
          { required: true, message: '商品货号不能为空', trigger: 'blur' }
        ],
        num:[
          { required: true, message: '库存不能为空', trigger: 'blur' },
          { type: 'number', message: '库存为数字值'}
        ],
        alertNum:[
          { required: true, message: '库存预警值不能为空', trigger: 'blur' },
          { type: 'number', message: '库存预警值为数字值'}
        ]
      },

    }
  },
  created() {
    this.province = province
    this.getThreeCate()
    this.getBrand()
    this.getTemplateList()
  },
  mounted() {
    this.formRefs.push(this.$refs.addFormRef)
    this.formRefs.push(null)
    this.formRefs.push(this.$refs.skuListFormRef)
  },
  methods:{
    //获取三级分类下拉列表数据
    async getThreeCate(){
        const {data:res} = await this.$http.get('category/threeCate')
        if(res.code!==1)return;
        var t = res.data;
        for (let  i = 0; i < t.length; i++) {
          if(t[i].children.length===0){
            delete t[i].children
          }
          else{
              for(let j=0;j<t[i].children.length;j++){
                if(t[i].children[j].children.length===0){
                  delete t[i].children[j].children
                }else{
                  for(let k=0;k<t[i].children[j].children.length;k++){
                    delete t[i].children[j].children[k].children
                  }
                }
              }
          }
        }
        this.threeCate = t
    },
    //获取品牌下拉列表数据
    async getBrand(){
      const {data:res} = await this.$http.get('brand/getBrand')
      if(res.code!==1)return;
      this.brandList = res.data
    },
    //获取模板下拉列表数据
    async getTemplateList(){
      const {data:res} = await this.$http.get('template/getTemplate')
      if(res.code!==1)return
      this.templateList = res.data
    },
    //商品列表级联选择器 选中项变化时，触发该函数,控制只选择三级分类
    handleChange(){
      if(this.addFrom.goodsCate.length!==3){
        this.addFrom.goodsCate=[]
      }
    },
    beforeTabLeave(activeName,oldActiveName){
      let canTab = true
      const index = parseInt(oldActiveName)
      if(index===0||index===2)
      this.formRefs[index].validate(valid=>{
        if(!valid){
         canTab = false
        }
      })
      return canTab
    },
    //图片预览
    handlePreview(file){
      this.previewPath = file.response.data
      this.previewVisible = true
    },
    handleIntroductionRemove(file){
      const path = file.response.data
      const index = this.introductionImg.findIndex(x=>x===path)
      this.introductionImg.splice(index,1)
    },
    handleIntroductionSuccess(response){
      this.introductionImg.push(response.data)
    },
    handleRemove(file){
      this.addFrom.image=''
    },
    //监听图片上传成功的事件
    handleSuccess(response,file){
      console.log(file)
      this.addFrom.image = response.data
    },
    //处理sku 多图片上传
    handleSkuMultiSuccess(obj,response,file){
      obj.images.push(response.data)
    },
    //处理sku 多图片 删除
    handleSkuMultiRemove(obj,file){
      const path = file.response.data
      const index = obj.images.findIndex(x=>x===path)
      obj.images.splice(index,1)
    },
    async tabClick(){
      if(this.activeIndex==='1'&&this.templateIdHasChange){
        //访问商品规格与属性面板,请求数据
        const {data:res} = await this.$http.get('template/getSpecPara',{params:{templateId:this.addFrom.templateId}})
        if(res.code!==1)return;
        this.specPara = res.data
        this.specParaForm.spec = this.initSpecParaForm(this.specPara.spec,true)
        this.specParaForm.para = this.initSpecParaForm( this.specPara.para,false)
        this.specList = this.initSpecParaList(this.specPara.spec)
        this.specName = this.specList.map(s=>{
          return s.name
        })
        this.paraList = this.initSpecParaList(this.specPara.para)
        this.templateIdHasChange = false;
      }
    },
    initSpecParaForm(data,type){
      return data.map(d=>{
        return {
          name:d.name,
          options:type?[]:''
        }
      })
    },
    initSpecParaList(data){
      return data.map(d=>{
        return {
          name:d.name,
          options:d.options.split(',')
        }
      })
    },
    //新增规格属性值
    addSpecValue(){
      this.specList[this.specParaForm.index].options.push(this.specParaForm.addContent)
      this.specParaForm.index=''
      this.specParaForm.addContent=''
    },
    //监听生成sku列表按钮的点击
    createSku(){
      // 先清空数据，保证连续点击按钮，数据不会重复
      this.skuArray = []
      this.skuList = []
      // 将选中的规格组合成一个大数组 [[1, 2], [a, b]...]
      this.specParaForm.spec.forEach(element => {
        element.options.length > 0 ? this.skuArray.push(element.options) : ''
      })
      if(this.skuArray.length>0){
        this.getSkuData([], 0, this.skuArray)
        this.skuForm.skuListForm = this.skuList.map(sku=>{
          const spec = {}
          for(let i=0;i<sku.length;i++){
            spec[this.specName[i]] = sku[i]
          }
          return {
            num:'',
            alertNum:'',
            sn:'',
            price:'',
            image:'',
            images:[],
            weight:this.addFrom.weight,
            spec,
            ...spec
          }
        })
        console.log(this.skuList)
        console.log( this.skuForm.skuListForm)
      }

      this.initSpu()
    },
    // 递归获取每条SKU数据
    getSkuData(skuArr = [], i, list) {
      for (let j = 0; j < list[i].length; j++) {
        if (i < list.length - 1) {
          skuArr[i] = list[i][j]
          this.getSkuData(skuArr, i + 1, list) // 递归循环
        } else {
          this.skuList.push([...skuArr, list[i][j]]) // 扩展运算符，连接两个数组
        }
      }
    },
    initSpu(){
      this.addFrom.images = this.introductionImg.join(',')
      const {weight,goodsCate,...spu} =this.addFrom
      spu.category1Id = goodsCate[0]
      spu.category2Id = goodsCate[1]
      spu.category3Id = goodsCate[2]
      const paraItems = {}
      this.specParaForm.para.forEach(p=>{
        paraItems[p.name] = p.options
      })
      const specItems = {}
      this.specParaForm.spec.forEach(s=>{
        specItems[s.name] = s.options
      })
      spu.paraItems = JSON.stringify(paraItems)
      spu.specItems = JSON.stringify(specItems)
      this.finalData.spu = spu
    },
    //sku 主图片 移除图片
    handleRemoveSkuImg(obj,file){
      obj.image=''
    },
    //sku 主图片 监听图片上传成功的事件
    handleSuccessSkuImg(obj,response,file){
      obj.image = response.data
    },
    setGoodsData(){
      this.initSpu()
      //sku信息
      this.finalData.skuList = this.skuForm.skuListForm.map(s=>{
        return  {
          alertNum:s.alertNum,
          image:s.image,
          images:s.images.join(','),
          num:s.num,
          price:s.price,
          sn:s.sn,
          spec:JSON.stringify(s.spec),
          weight:this.addFrom.weight
        }
      })
    },
    //保存商品信息
    async saveGoods(){
      const confirmRes =  await this.$confirm('此操作将新增商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)
      if(confirmRes!=='confirm'){
        return this.$msg({
          showClose: true,
          message: '已经取消了新增商品',
          type: 'info',
          duration:2000
        });
      }
      this.setGoodsData()
      const {data:res} = await this.$http.post('spu/save',this.finalData)
      if(res.code!==1)return;
      this.$msg({
        showClose: true,
        message: '新增商品成功',
        type: 'success',
        duration:2000
      });
      this.$router.push("/goods/list")
    },
  }
}
</script>

<style scoped lang="less">
  .content{
    width: 90%;
    height: 100%;
    margin: 10px auto;
    padding: 10px;
    border: 1px solid #eee;
  }
  .previewImg{
    width: 100%;
    object-fit: cover;
  }
  .spec-title{
    margin-top: 10px;
  }
  .specPara{
    margin-left: 20px;
    display: grid;
    grid-template-columns: 80px 1fr;
    column-gap: 20px;
  }
  .form-items{
      background-color: #f8f9fc;
      border-radius: 5px;
      padding-left: 15px;
      border: 1px solid rgba(0,0,0,.1);
    margin-bottom: 20px;
    .input-with-select{
      margin: 0 0 10px;
      width: 80%;
    }
  }
  .img-layout{
    display: flex;
    margin-bottom: 15px;
    .goods-images-title{
      margin-right: 40px;
      margin-top: 5px;
      width: 100px;
    }
    .img-4{
      flex: 1;
    }

  }
  .save{
    margin-left: 20px;
  }
  .sku-upload{
    display: flex;
    margin-left: 10px;
    margin-bottom: 15px;
    .title{
      margin-right: 40px;
      margin-top: 10px;
      height: 40px;
      border: 1px solid rgba(0,0,0,0.2);
      padding: 8px 10px 10px;
      border-radius: 3px;
      background-color: #67c23a;
    }
    .img-up{
      padding-top: 5px;
      flex: 1;
      background-color: #f8f9fc;
      border-radius: 5px;
      padding-left: 15px;
      border: 1px solid rgba(0,0,0,.1);
      margin-bottom: 20px;
    }
  }
</style>
