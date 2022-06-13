<template>
  <div>
    <!-- 卡片视图区域   -->
    <el-card>
    <!--   搜索与添加区域   -->
      <el-row   type="flex" justify="space-between">
        <el-col :span="8">
          <el-input placeholder="请输入管理员用户名" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search" @click="getSysUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    <!--   用户列表区域   -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="用户名" prop="username"></el-table-column>
        <el-table-column label="角色" prop="role"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="手机" prop="phone"></el-table-column>
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.ea" @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
          <!--      修改用户      -->
            <el-button type="text" @click="showEditDialog(scope.row.id)">修改</el-button>
          <!--     删除用户       -->
            <el-button type="text" @click="removeUserById(scope.row.id)">删除</el-button>
          <!--     分配角色       -->
            <el-button type="text" @click="permRole(scope.row)">分配角色</el-button>
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
      <!--  添加用户的对话框    -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
      <!--        内容主体区域-->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input v-model="addForm.phone"></el-input>
          </el-form-item>
        </el-form>
      <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click="addSysUser">确 定</el-button>
          <el-button @click="addDialogVisible = false">取 消</el-button>
  </span>
      </el-dialog>
      <!--   修改用户的对话框   -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
      @close="editDialogClosed">
        <el-form :model="editForm" status-icon :rules="editFormRules"
                 ref="editFormRef" label-width="80px">
          <el-form-item label="用户名">
            <el-input type="text" v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input type="text" v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input type="text" v-model="editForm.phone"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
           <el-button type="primary" @click="editSysUserInfo">确 定</el-button>
            <el-button @click="editDialogVisible = false">取 消</el-button>
        </span>
      </el-dialog>
      <!--   分配角色的对话框   -->
      <el-dialog
        title="分配角色"
        :visible.sync="permRoleDialogVisible"
        width="30%">
        <el-select v-model="permRoleSelect" multiple placeholder="请选择"
        @change="change=true">
          <el-option
            v-for="item in permRoleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="permRoleConfirm">确 定</el-button>
    <el-button @click="permRoleDialogVisible = false">取 消</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Users",
  data(){
    // 验证手机号的规则
    let checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    //验证用户名是否唯一
    let usernameUniqueCheck=(rule,value,cb)=>{
      this.$http.get('sys/user/usernameCheck',{params:{username:value}}).then(res=>{
        if(res.data.data===0){
          return cb();
        }
        cb(new Error('用户名已存在!'))
      })
    }
    return{
      //获取SysUser列表的参数对象
      queryInfo:{
        query:'',
        page:1,//当前页码
        size:10//每页显示条数
      },
      userList:[],
      total:0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible:false,
      //添加用户的表单数据
      addForm:{
        username:'',
        email:'',
        phone:''
      },
      //添加用户的表单验证规则对象
      addFormRules:{
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
          { validator:usernameUniqueCheck,trigger: 'blur' }

        ],
        email:[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur','change'] }
        ],
        phone:[
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator:checkMobile,trigger: ['blur','change'] }
        ]
      },
      //控制修改用户信息对话框的显示与隐藏
      editDialogVisible:false,
      //查询到的用户信息
      editForm:{},
      //修改用户信息的表单验证规则对象
      editFormRules:{
        email:[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur','change'] }
        ],
        phone:[
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator:checkMobile,trigger: ['blur','change'] }
        ]
      },
      //分配角色
      //控制分配角色的对话框的显示与隐藏
      permRoleDialogVisible:false,
      //分配角色的表单数据
      permRoleSelect:[],
      permRoleOptions:[],
      change:false,//判断select选中的值是否发生变化,
      permRoleUserId:null
    }
  },
  created() {
    this.getSysUserList()
  },
  methods:{
    //获取SysUser列表
    async getSysUserList(){
      const {data:res}=await this.$http.get('/sys/user/findPage',{params:this.queryInfo})
      if(res.code!==1){
        if(this.queryInfo.query===''){
          return this.$msg({
            showClose: true,
            message: '获取用户列表失败',
            type: 'error',
            duration:2000
          });
        }else{
          return this.$msg({
            showClose: true,
            message: '用户不存在',
            type: 'error',
            duration:2000
          });
        }
      }
      this.userList = res.data.rows;
      this.total = res.data.total;
      for (let i=0;i<this.userList.length;i++){
        this.userList[i].role = '';
        let sysRoles = this.userList[i].sysRoles;
        for(let j=0;j<sysRoles.length;j++){
          this.userList[i].role+=sysRoles[j].name+" ";
        }
        this.userList[i].role = this.userList[i].role.trim();
      }
    },
    //刷新数据列表
    refreshTable(){
      this.queryInfo.query=''
      this.queryInfo.page=1;
      this.queryInfo.size =10;
      this.getSysUserList();
    },
    //监听pageSize改变的事件 每页显示多少条
    handleSizeChange(newSize){
      this.queryInfo.size =newSize
      this.queryInfo.page=1;
      this.getSysUserList()
    },
    //监听页码值改变
    handleCurrentChange(newPage){
      this.queryInfo.page=newPage
      this.getSysUserList()
    },
    //监听switch开关状态的改变
    async statusChange(userInfo){
      const {data:res}=await this.$http.post('/sys/user/setStatus',{
        userId:userInfo.id,
        status:userInfo.ea?1:0
      })
      if(res.code!==1){
        userInfo.ea=!userInfo.ea;
        return  this.$msg({
          showClose: true,
          message: res.msg,
          type: 'error',
          duration:2000
        });

      }
      this.$msg({
        showClose: true,
        message: '修改用户状态成功！',
        type: 'success',
        duration:2000
      });
    },
    //监听添加用户对话框的关闭事件
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //点击按钮，添加用户
    addSysUser(){
      this.$refs.addFormRef.validate(valid=>{
        if(!valid)return;
        //发起添加用户请求
        this.$http.post('sys/user/save',this.addForm).then(res=>{
          if(res.data.code!==1){
            return this.$msg({
              showClose: true,
              message: res.data.msg,
              type: 'error',
              duration:2000
            });
          }
          this.$msg({
            showClose: true,
            message: '添加用户成功',
            type: 'success',
            duration:2000
          });
          this.addDialogVisible =false;
          //重新获取用户数据
         this.refreshTable()
        })
      })
    },
    //显示修改用户信息的对话框
    async showEditDialog(id){
      const {data:res}=await this.$http.get(`sys/user/info/${id}`)
      if(res.code!==1){
        return this.$msg({
          showClose: true,
          message: '查询用户信息失败',
          type: 'error',
          duration:2000
        });
      }
      this.editForm =res.data;
      this.editDialogVisible=true;


    },
    //监听修改用户信息对话框的关闭
    editDialogClosed(){
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息
    editSysUserInfo(){
      this.$refs.editFormRef.validate(async valid=>{
        if(!valid)return;
        //修改用户信息
        const {data:res}=await this.$http.post('sys/user/update',this.editForm)
        console.log(res)
        if(res.code!==1){
          return this.$msg({
            showClose: true,
            message: res.msg,
            type: 'error',
            duration:2000
          });
        }
        //关闭对话框
        this.editDialogVisible=false;
        //刷新数据列表
       this.refreshTable()
        //提示修改成功
        this.$msg({
          showClose: true,
          message: '修改用户信息成功',
          type: 'success',
          duration:2000
        });
      })
    },
    //根据id删除对应的用户信息
    async removeUserById(id){
      //弹框提示用户是否删除数据
      //用户确定删除，返回"confirm",取消删除返回"cancel"
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
     const {data:res}=await this.$http.post('sys/user/delete',ids)
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
        message: '删除用户成功',
        type: 'success',
        duration:2000
      })
      this.refreshTable()
    },
    //点击面包屑的首页，更改首页的激活状态    TODO
    //点击分配角色按钮
    async permRole(row){
      this.permRoleSelect =[]
      this.permRoleOptions =[]
      //获取所有可选的角色
      const {data:res}=await this.$http.get('sys/role/getRoles')
      if(res.code!==1)return this.$msg.error('获取角色失败！')
      this.permRoleUserId =row.id;
      for(let i=0;i<res.data.length;i++){
          this.permRoleOptions.push({
            value:res.data[i].id,
            label:res.data[i].name
          })
          //设置select中的options默认选中
          if(row.role!==''){
            if(row.role.includes(res.data[i].name)){
              this.permRoleSelect.push(res.data[i].id)
            }
          }
      }
      this.permRoleDialogVisible = true;
    },
    //点击确定分配角色按钮
    async permRoleConfirm(){
      if(this.change){
        const {data:res}=await this.$http.post(`sys/user/role/${this.permRoleUserId}`,this.permRoleSelect)
        if(res.code!==1)return this.$msg.error(res.msg)
        this.permRoleDialogVisible = false
        this.refreshTable()
        this.$msg.success('分配角色成功')
        this.change=false;
      }else{
        this.permRoleDialogVisible = false
      }

    }

  },
}
</script>

<style scoped lang="less">

</style>
