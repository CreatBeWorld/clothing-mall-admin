<template>
  <div class="user-center">
    <el-card>
      <el-tabs v-model="activeTabPane">
        <el-tab-pane label="个人信息" name="userInfo">
          <el-form :model="userInfoForm" :rules="userInfoFormRules" ref="userInfoFormRef" label-width="80px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userInfoForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userInfoForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="phone">
              <el-input v-model="userInfoForm.phone"></el-input>
            </el-form-item>
            <el-form-item label="头像">
              <el-upload
                class="avatar-uploader"
                action
                :show-file-list="false"
                :http-request="uploadImg" >
                <img v-if="imgUrl" :src="imgUrl" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveUserInfo">保存</el-button>
            </el-form-item>
          </el-form>

        </el-tab-pane>
        <el-tab-pane label="修改密码" name="updatePass">
            <el-button type="primary" @click="updatePassDialogVisible=true">修改密码</el-button>
            <el-button type="primary" @click="resetPassDialogVisible=true">重置密码</el-button>
        </el-tab-pane>
      </el-tabs>
      <!--   重置密码对话框   -->
      <el-dialog
        title="重置密码"
        :visible.sync="resetPassDialogVisible"
        width="40%" class="resetPass">
        <!--        内容主体区域-->
            重置后的密码：<el-input disabled v-model="newPassword">123456</el-input>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="resetPassword">确 定</el-button>
          <el-button @click="resetPassDialogVisible = false">取 消</el-button>
        </span>
      </el-dialog>
      <!-- 修改密码对话框-->
      <el-dialog
        title="修改密码"
        :visible.sync="updatePassDialogVisible"
        width="40%"
        @close="updatePassDialogClosed">
        <!--        内容主体区域-->
        <el-form :model="updatePassForm" :rules="updatePassFormRules" ref="updatePassFormRef" label-width="80px">
          <el-form-item label="当前密码" prop="currentPass">
            <el-input v-model="updatePassForm.currentPass" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="password">
            <el-input v-model="updatePassForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPass">
            <el-input v-model="updatePassForm.confirmPass" type="password"></el-input>
          </el-form-item>
        </el-form>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="updatePassword">确 定</el-button>
          <el-button @click="updatePassDialogVisible = false">取 消</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "UserCenter",
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
    //验证确认密码的规则
    let confirmPassword =(rule,value,cb)=>{
      if(value===this.updatePassForm.password){
        return cb()
      }else{
        return new Error('确认密码和新密码需保持一致')
      }
    }
    return {
      //用户个人信息，表单数据
      userInfoForm:{},
      userInfoFormRules:{
        email:[
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur','change'] }
        ],
        phone:[
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator:checkMobile,trigger: ['blur','change'] }
        ]
      },
      activeTabPane:'userInfo',
      imgUrl:'',
      //重置密码 数据
      resetPassDialogVisible:false,//控制重置密码对话框的显示与隐藏
      userId:'',
      newPassword:'123456',
      //修改密码数据
      updatePassDialogVisible:false,//控制修改密码对话框的显示与隐藏,
      updatePassForm:{//表单数据
        currentPass:'',
        password:'',
        confirmPass:''
      },
      //表单验证规则
      updatePassFormRules:{
        //验证当前密码
        currentPass:[
          { required: true, message: '请输入当前密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        //验证新密码
        password:[
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        //验证确认密码
        confirmPass:[
          { required: true, message: '请确认密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
          { validator:confirmPassword,trigger: ['blur','change'] }
        ]

      }

    }
  },
  methods:{
    //修改用户信息
    //获取用户信息
    async getUserInfo(){
        const {data:res} = await this.$http.get('sys/user/userInfo')
        if(res.code!==1)return;
        this.userInfoForm = res.data;
        this.imgUrl = this.userInfoForm.avatar
        this.username = this.userInfoForm.username
        this.userId =this.userInfoForm.id
    },
    //上传图片
    async uploadImg(fileObj){
      let formData = new FormData();
      formData.set("file", fileObj.file);
      const {data:res}=await this.$http.post('upload/oss?folderName=admin', formData, {
          headers: {
            "Content-type": "multipart/form-data"
          }
        })
      if(res.code!==1)return;
      this.imgUrl = res.data;
    },
    //保存用户信息
    saveUserInfo(){
      this.$refs.userInfoFormRef.validate(async valid=>{
        if(!valid)return;
        //发起修改用户信息的请求
        this.userInfoForm.avatar = this.imgUrl
        const {data:res} = await this.$http.post('sys/user/update',this.userInfoForm)
        if(res.code!==1)return;
        this.$store.commit('changeAvatar',this.imgUrl)
        this.$msg.success('修改成功')
      })
    },

    //重置密码
    async resetPassword(){
        const {data:res} = await this.$http.get('sys/user/repass',{params:{userId:this.userId}})
        if(res.code!==1)return;
        this.$msg.success('重置密码成功')
        this.resetPassDialogVisible = false;
    },
    //修改密码
    //关闭对话框，请空数据
    updatePassDialogClosed(){
        this.$refs.updatePassFormRef.resetFields();
    },
    updatePassword(){
      this.$refs.updatePassFormRef.validate(async valid=>{
        if(!valid)return;
        const {data:res}=await this.$http.post('sys/user/updatePass',{currentPass:
          this.updatePassForm.currentPass,
          password:this.updatePassForm.password
        })
        if(res.code!==1)return;
        this.$msg.success('密码修改成功')
        this.updatePassDialogVisible=false
      })
    }



  },
  created() {
    this.getUserInfo()
  }
}
</script>

<style scoped lang="less">
.el-form-item{
  width: 50%;
}
.resetPass .el-input{
  width: 50%;
}
</style>
