<template>
  <div>
    <el-card>
      <div class="fnType">{{fnType}}</div>
      <el-form :model="categoryForm" :rules="categoryFormRules" ref="categoryFormRef" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" v-if="fnType==='修改商品分类'" :disabled="!canUpdateName"></el-input>
          <el-input v-model="categoryForm.name" v-else></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goodsNum">
          <el-input v-model.number="categoryForm.goodsNum"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="seq">
          <el-input v-model.number="categoryForm.seq"></el-input>
        </el-form-item>
        <el-form-item label="是否显示">
          <el-radio-group v-model="categoryForm.isShow">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否显示在导航栏" class="isMenu">
          <el-radio-group v-model="categoryForm.isMenu">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="上级分类" prop="parentId">
          <el-select v-model="categoryForm.parentId" placeholder="请选择上级分类">
            <el-option :label="item.name" :value="item.parentId" v-for="item in parentCategory"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板" prop="templateId">
          <el-select v-model="categoryForm.templateId" placeholder="请选择模板">
            <el-option :label="item.name" :value="item.templateId" v-for="item in template"></el-option>
          </el-select>
        </el-form-item>
        <div class="operation">
          <el-button type="primary" @click="submitData">提交</el-button>
          <el-button @click="reset" v-if="fnType==='新增商品分类'">重置</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "AddOrUpdateCate",
  data(){
    // 验证分类名称的规则
    let nameCheck = (rule, value, cb) => {
      if(this.fnType==='新增商品分类'){
        //新增商品分类时，分类名称验证规则
        this.$http.get('category/nameCheck',{params:{name:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('分类名称已存在'))
        })
      }
      else{
        //修改商品分类时，分类名称验证规则
        if(value === this.flag.name){
          //value值没变
          return cb()
        }
        else{
          this.$http.get('category/nameCheck',{params:{name:value}}).then(res=>{
            if(res.data.data===0){
              return cb()
            }
            cb(new Error('分类名称已存在'))
          })
        }

      }
    }
    return {
      oldParentId:0,
      canUpdateName:true,
      //表单数据
      categoryForm:{},
      fnType:'',
      parentCategory:[],
      template:[],
      flag:{
        name:''
      },
      //表单验证规则
      categoryFormRules:{
        name:[
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
          // { validator:nameCheck,trigger: 'blur' }
        ],
        goodsNum:[
          { required: true, message: '商品数量不能为空'},
          { type: 'number', message: '商品数量必须为数字值'}
        ],
        seq:[
          { required: true, message: '排序不能为空'},
          { type: 'number', message: '排序必须为数字值'}
        ],
        parentId: [
          { required: true, message: '请选择上级分类', trigger: 'change' }
        ],
        templateId: [
          { required: true, message: '请选择模板', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.initData()
  },
  methods:{
    async initData(){
      this.oldParentId = this.categoryInfo.oldParentId
      this.fnType = this.categoryInfo.fnType
      this.parentCategory = this.categoryInfo.parentCategory
      this.template = this.categoryInfo.template
      if(this.fnType==='修改商品分类'){
        let {fnType, parentCategory,template,oldParentId,...data} = this.categoryInfo
        this.categoryForm = data
        this.categoryForm.parentId = parseInt(this.categoryForm.parentId)
        this.flag.name = this.categoryForm.name
        const {data:res} = await this.$http.get('category/canUpdateName',{params:{name:this.flag.name}})
        if(res.code!==1)return;
        this.canUpdateName = res.data
      }
      else{
        this.categoryForm = {
          parentId:this.categoryInfo.parentId,
          goodsNum:100,
          isShow:true,
          isMenu:true,
          seq:0,
          templateId:this.categoryInfo.template[0].templateId,
          name:''
        }
      }
    },
    //重置表单
    reset(){
      this.$refs.categoryFormRef.resetFields()
    },
    //提交表单
    submitData(){
      this.$refs.categoryFormRef.validate(valid=>{
        if(!valid)return
        if(this.fnType === '新增商品分类'){
          this.add()
        }else{
          this.update()
        }
      })

    },
    //新增商品分类
    async add(){
      const {data:res} = await this.$http.post('category/add',this.categoryForm)
      if(res.code!==1){
        this.$msg.error(res.msg);
        this.$router.push({
          path:'/goods/category',
          query:{
            parentId:this.oldParentId
          }
        })
      }
      this.$msg.success('新增商品分类成功')
      this.$router.push({
        path:'/goods/category',
        query:{
          parentId:this.oldParentId
        }
      })
    },
    //修改商品分类
    async update(){
      const {data:res} = await this.$http.post('category/update',this.categoryForm)
      if(res.code!==1){
        this.$msg.error(res.msg);
        this.$router.push({
          path:'/goods/category',
          query:{
            parentId:this.oldParentId
          }
        })
      }
      this.$msg.success('修改商品分类成功')
      this.$router.push({
        path:'/goods/category',
        query:{
          parentId:this.oldParentId
        }
      })
    }

  },
  computed:{
    categoryInfo(){
      return this.$store.state.componentsData.categoryInfo
    }
  }

}
</script>

<style scoped lang="less">
.el-card{
  width: 70%;
  margin: 0 auto;
  .fnType{
    margin:15px 0;
    text-align: center;
  }
  .el-form{
    width: 80%;
    margin: 0 auto;
  }
  .operation{
    margin: 15px 0;
    text-align: center;
  }

}
</style>
