<template>
  <div>
    <el-card>
      <div class="fnType">{{fnType}}</div>
      <el-form :model="menuForm" :rules="menuFormRules" ref="menuFormRef" label-width="80px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name"></el-input>
        </el-form-item>
        <el-form-item label="上级菜单" prop="parentId">
          <el-select v-model="menuForm.parentId" placeholder="请选择上级菜单">
            <el-option :label="item.name" :value="item.parentId" v-for="item in parentMenu"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="menuForm.path"></el-input>
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="menuForm.icon"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input v-model.number="menuForm.orderNum"></el-input>
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="menuForm.status">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">不启用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="授权编码" prop="perms" v-if="fnType==='新增菜单'">
          <el-input v-model="menuForm.perms"></el-input>
        </el-form-item>
        <div class="operation">
          <el-button type="primary" @click="submitData">提交</el-button>
          <el-button @click="reset" v-if="fnType==='新增菜单'">重置</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>

export default {
  name: "AddOrUpdateMenu",
  data(){
    // 验证菜单名称的规则
    let nameCheck = (rule, value, cb) => {
      if(this.fnType==='新增菜单'){
        //新增菜单时，菜单名称验证规则
        this.$http.get('sys/menu/nameCheck',{params:{name:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('菜单名称已存在'))
        })
      }
      else{
        //修改菜单时，菜单名称验证规则
        if(value === this.flag.name){
          //value值没变
          return cb()
        }
        else{
          this.$http.get('sys/menu/nameCheck',{params:{name:value}}).then(res=>{
            if(res.data.data===0){
              return cb()
            }
            cb(new Error('菜单名称已存在'))
          })
        }

      }
    }
    // 验证菜单路径的规则
    let pathCheck = (rule, value, cb) => {
      if(this.fnType==='新增菜单'){
        //新增菜单时，菜单路径验证规则
        this.$http.get('sys/menu/pathCheck',{params:{path:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('菜单路径已存在'))
        })
      }
      else{
        //修改菜单时，菜单路径验证规则
        if(value === this.flag.path){
          //value值没变
          return cb()
        }
        else{
          this.$http.get('sys/menu/pathCheck',{params:{path:value}}).then(res=>{
            if(res.data.data===0){
              return cb()
            }
            cb(new Error('菜单路径已存在'))
          })
        }

      }
    }
    // 验证菜单授权编码的规则
    let permsCheck = (rule, value, cb) => {
      if(this.fnType==='新增菜单'){
        //新增菜单时，菜单授权编码验证规则
        this.$http.get('sys/menu/permsCheck',{params:{perms:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('菜单授权编码已存在'))
        })
      }else{
        return cb()
      }

    }
    return {
      //表单数据
      menuForm:{},
      fnType:'',
      parentMenu:[],
      //表单验证规则
      menuFormRules:{
        name:[
          { required: true, message: '请输入菜单名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' },
          { validator:nameCheck,trigger: 'blur' }
        ],
        path:[
          { required: true, message: '请输入菜单路径', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
          { validator:pathCheck,trigger: 'blur' }

        ],
        icon:[
          { required: true, message: '请输入菜单图标', trigger: 'blur' },
          { min: 5, max: 30, message: '长度在 5 到 30 个字符', trigger: 'blur' },
        ],
        orderNum:[
          { required: true, message: '排序不能为空'},
          { type: 'number', message: '排序必须为数字值'}
        ],
        perms:[
          { required: true, message: '请输入菜单授权编码', trigger: 'blur' },
          { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' },
          { validator:permsCheck,trigger: 'blur' }
        ],
        parentId: [
          { required: true, message: '请选择上级菜单', trigger: 'change' }
        ],
      },
      //记录修改菜单时输入框中的初始值
      flag:{
        name:'',
        path:''
      },
    }
  },
  created() {
    this.initData()
  },
  methods:{
    initData(){
      this.fnType = this.menuInfo.fnType
      this.parentMenu = this.menuInfo.parentMenu
      if(this.fnType==='修改菜单'){
        console.log(this.menuInfo)
        let {fnType, parentMenu,...data} = this.menuInfo
        this.menuForm = data
        console.log('parentId:'+this.menuForm.parentId)
        this.menuForm.parentId = parseInt(this.menuForm.parentId)
        this.menuForm.type = parseInt(this.menuForm.type)
        this.flag.name = this.menuForm.name
        this.flag.path = this.menuForm.path
        console.log(this.menuForm)
      }
      else{
        console.log('parentId:'+this.menuInfo.parentId)
        this.menuForm = {
          parentId:this.menuInfo.parentId,
          icon:'',
          name:'',
          orderNum:0,
          path:'',
          perms:'',
          status:false,
          type:this.menuInfo.type
        }
        console.log(this.menuForm)
      }
    },
    //重置表单
    reset(){
      this.$refs.menuFormRef.resetFields()
    },
    //提交表单
    submitData(){
      this.$refs.menuFormRef.validate(valid=>{
        if(!valid)return
        if(this.fnType === '新增菜单'){
          this.add()
        }else{
          this.update()
        }
      })

    },
    getType(){
      for (const menu of this.parentMenu) {
          if(menu.parentId === this.menuForm.parentId){
            return menu.type+1
          }
      }
    },
    //新增菜单
    async add(){
      this.menuForm.type = this.getType()
      const {data:res} = await this.$http.post('sys/menu/save',this.menuForm)
      if(res.code!==1){
        this.$msg.error(res.msg);
        this.$router.push('/sys/menu')
      }
      this.$msg.success('新增菜单成功')
      this.$store.dispatch("getMenuList",this)
      this.$router.push('/sys/menu')
    },
    //修改菜单
    async update(){
      this.menuForm.type = this.getType()
      const {data:res} = await this.$http.post('sys/menu/update',this.menuForm)
      if(res.code!==1){
        this.$msg.error(res.msg);
        this.$router.push('/sys/menu')
      }
      this.$msg.success('修改菜单成功')
      this.$store.dispatch("getMenuList",this)
      this.$router.push('/sys/menu')
    }
  },

  computed:{
    menuInfo(){
      return this.$store.state.componentsData.menuInfo
    }
  }
}
</script>

<style scoped lang="less">
  .el-card{
    width: 60%;
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
