<template>
  <div>
    <el-card>
      <div class="add-returnCause">
        <el-button type="primary" @click="add">添加退货原因</el-button>
      </div>
      <!--   退货原因列表   -->
      <el-table :data="returnCauseList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="原因类型" prop="cause"></el-table-column>
        <el-table-column label="排序" prop="seq"></el-table-column>
        <el-table-column label="是否可用">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" @change="setStatus(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      修改退货原因     -->
            <el-button type="text" @click="update(scope.row)">修改</el-button>
            <!--     删除退货原因      -->
            <el-button type="text" @click="removeReturnCause(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <!--   分页   -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[1,2, 5, 10]"
        :page-size="queryInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
      <!--   新增或修改退货原因对话框   -->
      <el-dialog
        :title="addOrUpdate?'新增退货原因':'修改退货原因'"
        :visible.sync="addOrUpdateDialogVisible"
        width="55%"
        @close="closeDialog">
        <!--        内容主体区域-->
        <el-form :model="addOrUpdateForm" :rules="addOrUpdateFormRules" ref="addOrUpdateFormRef" label-width="80px">
          <el-form-item label="原因类型" prop="cause">
            <el-input v-model="addOrUpdateForm.cause"></el-input>
          </el-form-item>
          <el-form-item label="排序" prop="seq">
            <el-input v-model.number="addOrUpdateForm.seq"></el-input>
          </el-form-item>
          <el-form-item label="是否启用">
            <el-radio-group v-model="addOrUpdateForm.status">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="addOrUpdateReturnCause">确 定</el-button>
          <el-button @click="addOrUpdateDialogVisible = false">取 消</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "ReturnCauseConfig",
  data(){
    return {
      returnCauseList:[],
      queryInfo:{
        page:1,//当前页码
        size:5//每页显示条数
      },
      total:0,//总记录数
      addOrUpdate:true,//新增或修改退货原因对话框为新增品牌对话框
      addOrUpdateDialogVisible:false,//控制新增或修退货原因对话框的显示与隐藏
      addOrUpdateForm:{
        cause:'',//退货原因
        seq:0,//排序
        status:true//是否启用
      },
      addOrUpdateFormRules:{
        cause:[
          { required: true, message: '请输入退货原因', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        seq:[
          { required: true, message: '排序不能为空'},
          { type: 'number', message: '排序必须为数字值'}
        ]
      },
      id:0,//修改退货原因时，退货原因编号
    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //获取商品退货原因列表
    async findPage(){
      const {data:res} = await this.$http.get('/returnCause/findPage',{params:this.queryInfo})
      if(res.code!==1)return;
      this.returnCauseList=res.data.rows
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
    //刷新退货分类列表
    refreshTable(){
      this.queryInfo.page=1;
      this.queryInfo.size =5;
      this.findPage();
    },
    //设置退货原因是否可用
    async setStatus(row){
      const {data:res} = await this.$http.post('returnCause/setStatus',{id:row.id,status:row.status})
      if(res.code!==1){
        row.status = !row.status
        return  this.$msg({
          showClose: true,
          message: res.msg,
          type: 'error',
          duration:2000
        });
      }
      this.$msg({
        showClose: true,
        message: '退货原因是否可用设置成功',
        type: 'success',
        duration:2000
      });
      this.refreshTable()
    },
    //删除退货原因
    async removeReturnCause(id){
      //弹框提示用户是否删除数据
      //用户确定删除，返回"confirm",取消删除返回"cancel"
      const confirmRes = await this.$confirm('此操作将永久删除该退货原因, 是否继续?', '提示', {
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
      const {data:res}=await this.$http.get('returnCause/delete',{params:{id}})
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
        message: '删除退货原因成功',
        type: 'success',
        duration:2000
      })
      this.refreshTable()
    },
    //关闭新增或修改退货原因对话框
    closeDialog(){
      this.$refs.addOrUpdateFormRef.resetFields()
    },
    //设置退货原因表单数据
    setReturnCauseForm(cause,seq,status){
      this.addOrUpdateForm.cause = cause
      this.addOrUpdateForm.seq = seq
      this.addOrUpdateForm.status = status
    },
    //监听退货原因按钮的点击
    add(){
      this.setReturnCauseForm('',0,true)
      this.addOrUpdate = true
      this.addOrUpdateDialogVisible = true
    },
    // 监听修改退货原因按钮的点击
    update(row){
      this.addOrUpdate = false
      this.id= row.id
      this.setReturnCauseForm(row.cause,row.seq,row.status)
      this.addOrUpdateDialogVisible = true
    },
    // 新增或修改修改退货原因
    addOrUpdateReturnCause(){
      this.$refs.addOrUpdateFormRef.validate(  async valid=>{
        if(!valid) return
        if(this.addOrUpdate){
          //新增退货原因
          const {data:res} = await this.$http.post('returnCause/add',this.addOrUpdateForm)
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('新增退货原因成功')
        }
        else{
          //修改退货原因
          const {data:res} = await this.$http.post('returnCause/update',{id:this.id,...this.addOrUpdateForm})
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('修改退货原因成功')
        }
        this.addOrUpdateDialogVisible = false
      })

    }

  }
}
</script>

<style scoped lang="less">
.add-returnCause{
  display: flex;
  justify-content: flex-end;
}
</style>
