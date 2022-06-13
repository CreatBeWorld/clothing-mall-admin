<template>
  <div>
    <el-card>
      <!--   搜索与添加区域   -->
      <el-row  type="flex" justify="space-between">
        <el-col :span="8">
          <el-input placeholder="请输入角色名称" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="findPage"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="addRole">添加角色</el-button>
        </el-col>
      </el-row>
      <!--  角色列表   -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="角色名称" prop="name"></el-table-column>
        <el-table-column label="编码" prop="code"></el-table-column>
        <el-table-column label="描述" prop="remark"></el-table-column>
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      修改角色     -->
            <el-button type="text" @click="updateRole(scope.row)">修改</el-button>
            <!--     删除角色       -->
            <el-button type="text" @click="removeRole(scope.row.id)">删除</el-button>
            <!--     分配菜单       -->
            <el-button type="text" @click="assignMenu(scope.row.id)">分配菜单</el-button>
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
      <!--   新增或修改角色信息对话框   -->
      <el-dialog
        :title="addOrUpdate?'新增角色':'修改角色'"
        :visible.sync="addOrUpdateDialogVisible"
        width="50%"
      @close="closeDialog">
        <!--        内容主体区域-->
        <el-form :model="addOrUpdateForm" :rules="addOrUpdateFormRules" ref="addOrUpdateFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="addOrUpdateForm.name"></el-input>
          </el-form-item>
          <el-form-item label="编码" prop="code">
            <el-input v-model="addOrUpdateForm.code"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="remark">
            <el-input v-model="addOrUpdateForm.remark"></el-input>
          </el-form-item>
          <el-form-item label="是否启用">
            <el-radio-group v-model="addOrUpdateForm.status">
              <el-radio :label="true">启用</el-radio>
              <el-radio :label="false">不启用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="addOrUpdateRole">确 定</el-button>
          <el-button @click="addOrUpdateDialogVisible = false">取 消</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>


export default {
  name: "SysRole",
  data(){
    // 验证角色名的规则
    let nameCheck = (rule, value, cb) => {
      if(this.addOrUpdate){
        //新增角色时，角色名验证规则
        this.$http.get('sys/role/nameCheck',{params:{name:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('角色名已存在'))
        })
      }
      else{
        //修改角色信息，角色名验证规则
        if(value === this.flag.name){
          //value值没变
          return cb()
        }
        else{
          this.$http.get('sys/role/nameCheck',{params:{name:value}}).then(res=>{
            if(res.data.data===0){
              return cb()
            }
            cb(new Error('角色名已存在'))
          })
        }

      }
    }
    //验证角色编码的规则
    let codeCheck = (rule, value, cb) => {
      if(this.addOrUpdate){
        //新增角色时，角色编码验证规则
        this.$http.get('sys/role/codeCheck',{params:{code:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('角色编码已存在'))
        })
      }
      else{
        //修改角色信息，角色编码验证规则
        if(value === this.flag.code){
          //value值没变
          return cb()
        }
        else{
          this.$http.get('sys/role/codeCheck',{params:{code:value}}).then(res=>{
            if(res.data.data===0){
              return cb()
            }
            cb(new Error('角色编码已存在'))
          })
        }

      }
    }
    return{
      //角色列表
      //获取角色列表的参数对象
      queryInfo:{
        query:'',
        page:1,//当前页码
        size:10//每页显示条数
      },
      roleList:[],
      total:0,//总记录数,
      //新增或修改角色信息
      addOrUpdate:true,//新增或修改角色对话框为新增角色对话框
      addOrUpdateDialogVisible:false,//控制新增或修改角色信息对话框的显示与隐藏
      //新增或修改角色对话框表单数据
      addOrUpdateForm:{
        name:'',//角色名
        code:'',//角色编码
        remark:'',//描述
        status:false,//是否启用 不启用
      },
      id:0,//修改角色时，角色编号
      //记录修改角色对话框输入框中的初始值
      flag:{
        name:'',
        code:'',
        remark:''
      },
      //新增或修改角色的表单验证规则
      addOrUpdateFormRules:{
        name:[
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
          { validator:nameCheck,trigger: 'blur' }
        ],
        code:[
          { required: true, message: '请输入角色编码', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
          { validator:codeCheck,trigger: 'blur' }

        ],
        remark:[
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 5, max: 64, message: '长度在 5 到 64 个字符', trigger: 'blur' },

        ]
      }

    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //获取角色列表
    async findPage(){
      const {data:res} = await this.$http.get('/sys/role/findPage',{params:this.queryInfo})
      console.log(res)
      if(res.code!==1){
        if(this.queryInfo.query===''){
          return this.$msg({
            showClose: true,
            message: '获取角色列表失败',
            type: 'error',
            duration:2000
          });
        }else{
          return this.$msg({
            showClose: true,
            message: '角色不存在',
            type: 'error',
            duration:2000
          });
        }
      }
      this.roleList = res.data.rows
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
    //刷新角色列表
    refreshTable(){
      this.queryInfo.query=''
      this.queryInfo.page=1;
      this.queryInfo.size =10;
      this.findPage();
    },
    //设置角色表单数据
    setRoleForm(name,code,remark,status){
      this.addOrUpdateForm.name=name
      this.addOrUpdateForm.code=code
      this.addOrUpdateForm.remark=remark
      this.addOrUpdateForm.status =status
    },
    //监听新增角色按钮的点击
    addRole(){
      this.setRoleForm('','','',false)
      this.addOrUpdate =true
      this.addOrUpdateDialogVisible = true
    },
    //监听修改按钮的点击
    updateRole(row){
      this.addOrUpdate = false
      this.id = row.id
      this.setRoleForm(row.name,row.code,row.remark,row.status)
      this.flag.name = row.name
      this.flag.code = row.code
      this.flag.remark = row.remark
      this.addOrUpdateDialogVisible = true
    },
    //新增或修改角色信息
     addOrUpdateRole(){
       console.log(this.addOrUpdateForm)
      this.$refs.addOrUpdateFormRef.validate(  async valid=>{
        if(!valid) return
        console.log(this.addOrUpdateForm)
        if(this.addOrUpdate){
          //新增角色信息
          const {data:res} = await this.$http.post('sys/role/save',this.addOrUpdateForm)
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('新增角色成功')
        }
        else{
          //修改角色信息
          const {data:res} = await this.$http.post('sys/role/update',{id:this.id,...this.addOrUpdateForm})
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('修改角色成功')
        }
        this.addOrUpdateDialogVisible = false

      })

    },
    //关闭新增或修改角色信息对话框
    closeDialog(){
      this.$refs.addOrUpdateFormRef.resetFields()
    },
    //监听角色的状态改变
    async statusChange(row){
      const {data:res} = await this.$http.post('sys/role/setStatus',{id:row.id,status:row.status})
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
        message: '设置角色状态成功！',
        type: 'success',
        duration:2000
      });
    },
    //监听删除按钮的点击
    async removeRole(id){
      //弹框提示用户是否删除数据
      //用户确定删除，返回"confirm",取消删除返回"cancel"
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
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
      let ids = []
      ids.push(id)
      const {data:res}=await this.$http.post('sys/role/delete',ids)
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
        message: '删除角色成功',
        type: 'success',
        duration:2000
      })
      this.refreshTable()
    },
    //监听分配菜单按钮的点击
    assignMenu(roleId){
      this.$router.push({
        path:'/sys/role/assignMenu',
        query:{
          roleId:roleId
        }
      })
    }

  }
}
</script>

<style scoped>

</style>
