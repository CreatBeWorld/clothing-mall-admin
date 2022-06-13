<template>
  <div>
    <el-card>
      <div class="add-spec">
        <el-button type="primary" @click="addSpec">添加规格</el-button>
      </div>
      <!--   规格列表   -->
      <el-table :data="specList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="规格名称" prop="name"></el-table-column>
        <el-table-column label="规格选项" prop="options"></el-table-column>
        <el-table-column label="排序" prop="seq"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      修改规格     -->
            <el-button type="text" @click="updateSpec(scope.row)">修改</el-button>
            <!--     删除规格     -->
            <el-button type="text" @click="removeSpec(scope.row.id)">删除</el-button>
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
      <!--   新增或修改规格信息对话框   -->
      <el-dialog
        :title="addOrUpdate?'新增规格':'修改规格'"
        :visible.sync="addOrUpdateDialogVisible"
        width="50%"
        @close="closeDialog">
        <!--        内容主体区域-->
        <el-form :model="addOrUpdateForm" :rules="addOrUpdateFormRules" ref="addOrUpdateFormRef" label-width="80px">
          <el-form-item label="规格名称" prop="name">
            <el-input v-model="addOrUpdateForm.name"></el-input>
          </el-form-item>
          <el-form-item label="规格选项" prop="options">
            <el-input v-model="addOrUpdateForm.options"></el-input>
          </el-form-item>
          <el-form-item label="排序" prop="seq">
            <el-input v-model.number="addOrUpdateForm.seq"></el-input>
          </el-form-item>
          <el-form-item label="模板" prop="templateId">
            <el-select v-model="addOrUpdateForm.templateId" placeholder="请选择模板">
              <el-option :label="item.name" :value="item.templateId" v-for="item in templateList"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="addOrUpdateSpec">确 定</el-button>
          <el-button @click="addOrUpdateDialogVisible = false">取 消</el-button>
  </span>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
export default {
  name: "SpecManage",
  data() {
    return {
      //获取模板列表的参数对象
      queryInfo: {
        templateId: 0,
        page: 1,//当前页码
        size: 10//每页显示条数
      },
      specList: [],
      total: 0,//总记录数
      //新增或修改规格信息
      addOrUpdate:true,//新增或修改规格信息对话框为新增规格对话框
      addOrUpdateDialogVisible:false,//控制新增或修改规格信息对话框的显示与隐藏
      //新增或修改规格信息对话框表单数据
      addOrUpdateForm:{
        name:'',//规格名称
        options:'',//规格选项
        seq:0,//排序
        templateId:''//模板编号
      },
      templateList:[],//模板下拉列表
      id:0,//修改规格时，规格编号
      //新增或修改规格信息的表单验证规则
      addOrUpdateFormRules:{
        name:[
          { required: true, message: '请输入规格名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
        ],
        options:[
          { required: true, message: '请输入规格选项', trigger: 'blur' },
          { min: 1, max: 150, message: '长度为1到150个字符', trigger: 'blur' }
        ],
        seq:[
          { required: true, message: '排序不能为空'},
          { type: 'number', message: '排序必须为数字值'}
        ]
      },
      templateId: [
        { required: true, message: '请选择模板', trigger: 'change' }
      ],
    }
  },
  created() {
    this.queryInfo.templateId = parseInt(this.$route.query.templateId)
    this.findPage()
    this.getTemplateList()
  },
  methods: {
    //获取模板列表
    async findPage() {
      const {data: res} = await this.$http.get('/spec/findPage', {params: this.queryInfo})
      if (res.code !== 1) return;
      this.specList = res.data.rows
      this.total = res.data.total
    },
    async getTemplateList(){
      const {data:res} = await this.$http.get('template/getTemplate')
      if(res.code!==1)return
      this.templateList = res.data
    },
    //监听pageSize改变的事件 每页显示多少条
    handleSizeChange(newSize) {
      this.queryInfo.size = newSize
      this.queryInfo.page = 1;
      this.findPage()
    },
    //监听页码值改变
    handleCurrentChange(newPage) {
      this.queryInfo.page = newPage
      this.findPage()
    },
    //刷新模板列表
    refreshTable() {
      this.queryInfo.page = 1;
      this.queryInfo.size = 10;
      this.findPage();
    },
    //删除规格
    async removeSpec(id) {
      //弹框提示用户是否删除数据
      //用户确定删除，返回"confirm",取消删除返回"cancel"
      const confirmRes = await this.$confirm('此操作将永久删除该规格, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$msg({
          showClose: true,
          message: '已经取消了删除',
          type: 'info',
          duration: 2000
        });
      }
      const {data: res} = await this.$http.get('spec/delete', {params: {id}})
      if (res.code !== 1) {
        return this.$msg({
          showClose: true,
          message: res.msg,
          type: 'error',
          duration: 2000
        });
      }
      this.$msg({
        showClose: true,
        message: '删除规格成功',
        type: 'success',
        duration: 2000
      })
      this.refreshTable()
    },
    //关闭新增或修改模板信息对话框
    closeDialog(){
      this.$refs.addOrUpdateFormRef.resetFields()
    },
    //设置规格表单数据
    setSpecForm(name,options,seq,templateId){
      this.addOrUpdateForm.name=name
      this.addOrUpdateForm.options=options
      this.addOrUpdateForm.seq=seq
      this.addOrUpdateForm.templateId = templateId
    },
    //监听新增规格按钮的点击
    addSpec(){
      this.setSpecForm('','',0,this.queryInfo.templateId)
      this.addOrUpdate = true
      this.addOrUpdateDialogVisible = true
    },
    //监听修改规格按钮的点击
    updateSpec(row){
      this.addOrUpdate = false
      this.id = row.id
      this.setSpecForm(row.name,row.options,row.seq,row.templateId)
      this.addOrUpdateDialogVisible = true
    },
    //新增或修改规格信息
    addOrUpdateSpec(){
      this.$refs.addOrUpdateFormRef.validate(  async valid=>{
        if(!valid) return
        if(this.addOrUpdate){
          //新增规格信息
          const {data:res} = await this.$http.post('spec/add',this.addOrUpdateForm)
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('新增规格成功')
        }
        else{
          //修改规格信息
          const {data:res} = await this.$http.post('spec/update',{id:this.id,...this.addOrUpdateForm})
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('修改规格成功')
        }
        this.addOrUpdateDialogVisible = false
      })

    },
  }
}
</script>

<style scoped>
.add-spec {
  display: flex;
  justify-content: flex-end;
}
</style>
