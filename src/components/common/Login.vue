<template>
  <div class="login-container">
    <div class="login-box">
      <div class="avatar-box">
        <img src="../../assets/img/loginLogo.png" alt="">
      </div>
    <!--   表单   -->
      <el-form ref="loginFormRef" label-width="0px" class="login-form" :model="form" :rules="formRules">
        <el-form-item prop="username">
          <el-input  prefix-icon="iconfont icon-user" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input  type="password" prefix-icon="iconfont icon-3702mima" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      //登录表单的数据绑定对象
      form: {
        username:'',
        password:''
      },
      //表单的验证规则对象
      formRules:{
        //验证用户名是否合法
        username:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //验证密码
        password:[
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods:{
    //点击重置按钮，重置表单
    resetForm(){
      this.$refs.loginFormRef.resetFields();
    },
    login(){
      this.$refs.loginFormRef.validate(async valid=>{
        if(!valid)return;//验证不通过，不发起请求
        const {data:res} = await this.$http.post('login/adminLogin',this.form)
        if(res.code!==1){//登录失败
          return this.$msg({
            showClose: true,
            message: res.msg,
            type: 'error',
            duration:2000
          });
        }
        this.$msg({
          showClose: true,
          message: "登录成功",
          type: 'success',
          duration:2000
        });
        //保存token以及用户名到sessionStorage中
        window.sessionStorage.setItem('token',res.data.tokeHead+' '+res.data.token)
        window.sessionStorage.setItem('username',this.form.username)
        this.$router.push('/home');
      })
    }
  }
}
</script>

<style lang ="less" scoped>
  .login-container{
    background-color: #2f90b9;
    height: 100%;
  }
  .login-box{
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    .avatar-box{
      width: 130px;
      height: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #eee;
      position: absolute;
      left: 50%;
      transform: translate(-50%,-65px);
      background-color: #fff;
      img{
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
  }
  .login-form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 15px;
  }
  .btns{
    display: flex;
    justify-content: flex-end;

  }
  .el-icon-user,.el-icon-lock{
    color: #333 !important;
  }
</style>
