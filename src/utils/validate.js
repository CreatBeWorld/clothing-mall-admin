//验证用户名是否唯一
let usernameUniqueCheck=(rule,value,cb)=>{
  this.$http.get('sys/user/usernameCheck',{params:{username:value}}).then(res=>{
    if(res.data.data===0){
      return cb();
    }
    cb(new Error('用户名已存在!'))
  })
}
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
export default {
  usernameUniqueCheck,
  checkMobile
}
