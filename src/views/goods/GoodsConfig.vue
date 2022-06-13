<template>
  <div>
    <el-card>
      <div class="add-template">
        <el-button type="primary" @click="addTemplate">添加模板</el-button>
      </div>
      <!--   模板列表   -->
      <el-table :data="templateList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="模板名称" prop="name"></el-table-column>
        <el-table-column label="规格数量" prop="specNum"></el-table-column>
        <el-table-column label="参数数量" prop="paraNum"></el-table-column>
        <el-table-column label="设置">
          <template slot-scope="scope">
            <el-button type="text" @click="specList(scope.row.id)">规格列表</el-button>
            <el-button type="text" @click="paraList(scope.row.id)">参数列表</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      修改模板     -->
            <el-button type="text" @click="updateTemplate(scope.row)">修改</el-button>
            <!--     删除模板     -->
            <el-button type="text" @click="removeTemplate(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <!--   分页   -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[1,2, 4, 10]"
        :page-size="queryInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--   新增或修改模板信息对话框   -->
      <el-dialog
        :title="addOrUpdate?'新增模板':'修改模板'"
        :visible.sync="addOrUpdateDialogVisible"
        width="35%"
        @close="closeDialog">
        <!--        内容主体区域-->
        <el-form :model="addOrUpdateForm" :rules="addOrUpdateFormRules" ref="addOrUpdateFormRef" label-width="80px">
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="addOrUpdateForm.name"></el-input>
          </el-form-item>
        </el-form>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="addOrUpdateTemplate">确 定</el-button>
          <el-button @click="addOrUpdateDialogVisible = false">取 消</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "GoodsConfig",
  data(){
    // 验证模板名的规则
    let nameCheck = (rule, value, cb) => {
      if(this.addOrUpdate){
        //新增模板时，模板名称验证规则
        this.$http.get('template/nameCheck',{params:{name:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('模板名称已存在'))
        })
      }
      else{
        //修改模板信息，模板名称验证规则
        if(value === this.flag.name){
          //value值没变
          return cb()
        }
        else{
          this.$http.get('template/nameCheck',{params:{name:value}}).then(res=>{
            if(res.data.data===0){
              return cb()
            }
            cb(new Error('模板名称已存在'))
          })
        }

      }
    }
    return{
      //获取模板列表的参数对象
      queryInfo:{
        page:1,//当前页码
        size:10//每页显示条数
      },
      templateList:[],
      total:0,//总记录数
      //新增或修改模板信息
      addOrUpdate:true,//新增或修改模板信息对话框为新增模板对话框
      addOrUpdateDialogVisible:false,//控制新增或修改模板信息对话框的显示与隐藏
      //新增或修改模板信息对话框表单数据
      addOrUpdateForm:{
        name:'',//模板名称
      },
      id:0,//修改模板时，模板编号
      //记录修改模板信息对话框输入框中的初始值
      flag:{
        name:'',
      },
      //新增或修改模板信息的表单验证规则
      addOrUpdateFormRules:{
        name:[
          { required: true, message: '请输入模板名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
          { validator:nameCheck,trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //获取模板列表
    async findPage(){
      const {data:res} = await this.$http.get('/template/findPage',{params:this.queryInfo})
      if(res.code!==1)return;
      this.templateList=res.data.rows
      this.total = res.data.total
    },
    //监听pageSize改变的事件 每页显示多少条
    handleSizeChange(newSize){
      this.queryInfo.size =newSize
      this.queryInfo.page=1;
      this.findPage()
    },
    //监听页码值改变
    handleCurrentChange(newPage){
      this.queryInfo.page=newPage
      this.findPage()
    },
    //刷新模板列表
    refreshTable(){
      this.queryInfo.page=1;
      this.queryInfo.size =10;
      this.findPage();
    },
    //删除模板
    async removeTemplate(id){
      //验证能否删除模板
      const {data:res} = await this.$http.get('/template/canDelete',{params:{id}})
      if(res.code!==1)return;
      if(!res.data){
        return this.$msg({
          showClose: true,
          message: '该模板与其他数据有关联,无法删除',
          type: 'error',
          duration:2000
        });
      }
      else{
        //弹框提示用户是否删除数据
        //用户确定删除，返回"confirm",取消删除返回"cancel"
        const confirmRes = await this.$confirm('此操作将永久删除该模板, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(confirmRes!=='confirm'){
          return this.$msg({
            showClose: true,
            message: '已经取消了删除',
            type: 'info',
            duration:2000
          });
        }
        const {data:res}=await this.$http.get('template/delete',{params:{id}})
        if(res.code!==1){
          return this.$msg({
            showClose: true,
            message: res.msg,
            type: 'error',
            duration:2000
          });
        }
        this.$msg({
          showClose: true,
          message: '删除模板成功',
          type: 'success',
          duration:2000
        })
        this.refreshTable()
      }
    },
    //关闭新增或修改模板信息对话框
    closeDialog(){
      this.$refs.addOrUpdateFormRef.resetFields()
    },
    //监听新增模板按钮的点击
    addTemplate(){
      this.addOrUpdateForm.name = ""
      this.addOrUpdate = true
      this.addOrUpdateDialogVisible = true
    },
    //监听修改模板按钮的点击
    updateTemplate(row){
      this.addOrUpdate = false
      this.id = row.id
      this.addOrUpdateForm.name = row.name
      this.flag.name = row.name
      this.addOrUpdateDialogVisible = true
    },
    //新增或修改模板信息
    addOrUpdateTemplate(){
      this.$refs.addOrUpdateFormRef.validate(  async valid=>{
        if(!valid) return
        if(this.addOrUpdate){
          //新增模板信息
          const {data:res} = await this.$http.post('template/add',this.addOrUpdateForm)
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('新增模板成功')
        }
        else{
          //修改模板信息
          const {data:res} = await this.$http.post('template/update',{id:this.id,...this.addOrUpdateForm})
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('修改模板成功')
        }
        this.addOrUpdateDialogVisible = false
      })
    },
    specList(templateId){
      this.$router.push({
        path:'/spec/list',
        query:{
          templateId
        }
      })
    },
    paraList(templateId){
      this.$router.push({
        path:'/para/list',
        query:{
          templateId
        }
      })
    }

  }
}
</script>

<style scoped>
.add-template{
  display: flex;
  justify-content: flex-end;
}
</style>
