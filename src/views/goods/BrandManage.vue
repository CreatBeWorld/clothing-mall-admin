<template>
  <div>
    <el-card>
      <!--   搜索与添加区域   -->
      <el-row  type="flex" justify="space-between">
        <el-col :span="8">
          <el-input placeholder="请输入品牌名称" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"  @click="findPage"></el-button>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="addBrand">添加品牌</el-button>
        </el-col>
      </el-row>
      <!--  品牌列表   -->
      <el-table :data="brandList" border stripe>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="品牌名称" prop="name"></el-table-column>
        <el-table-column label="品牌首字母" prop="letter"></el-table-column>
        <el-table-column label="排序" prop="seq"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!--      修改品牌     -->
            <el-button type="text" @click="updateBrand(scope.row)">修改</el-button>
            <!--     删除品牌      -->
            <el-button type="text" @click="removeBrand(scope.row)">删除</el-button>
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
      <!--   新增或修改品牌信息对话框   -->
      <el-dialog
        :title="addOrUpdate?'新增品牌':'修改品牌'"
        :visible.sync="addOrUpdateDialogVisible"
        width="55%"
        @close="closeDialog">
        <!--        内容主体区域-->
        <el-form :model="addOrUpdateForm" :rules="addOrUpdateFormRules" ref="addOrUpdateFormRef" label-width="80px">
          <el-form-item label="品牌名称" prop="name" v-if="addOrUpdate">
            <el-input v-model="addOrUpdateForm.name"></el-input>
          </el-form-item>
          <el-form-item label="品牌名称" prop="name" v-else>
            <el-input v-model="addOrUpdateForm.name" :disabled="!canUpdate"></el-input>
          </el-form-item>

          <el-form-item label="首字母" prop="letter">
            <el-input v-model="addOrUpdateForm.letter"></el-input>
          </el-form-item>
          <el-form-item label="排序" prop="seq">
            <el-input v-model.number="addOrUpdateForm.seq"></el-input>
          </el-form-item>
          <el-form-item label="品牌图片">
            <el-upload
              class="avatar-uploader"
              action
              :show-file-list="false"
              :http-request="uploadImg" >
              <img v-if="imgUrl" :src="imgUrl" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-form>
        <!--     底部区域   -->
        <span slot="footer" class="dialog-footer">
    <el-button type="primary" @click=" addOrUpdateBrand">确 定</el-button>
          <el-button @click="addOrUpdateDialogVisible = false">取 消</el-button>
  </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "BrandManage",
  data(){
    // 验证品牌名的规则
    let nameCheck = (rule, value, cb) => {
      if(this.addOrUpdate){
        //新增品牌时，品牌名验证规则
        this.$http.get('brand/nameCheck',{params:{name:value}}).then(res=>{
          if(res.data.data===0){
            return cb()
          }
          cb(new Error('品牌名已存在'))
        })
      }
      else{
        //修改品牌信息，品牌名验证规则
        if(value === this.flag.name){
          //value值没变
          return cb()
        }
        else{
          this.$http.get('brand/nameCheck',{params:{name:value}}).then(res=>{
            if(res.data.data===0){
              return cb()
            }
            cb(new Error('品牌名已存在'))
          })
        }

      }
    }
    return {
      //品牌列表
      //获取品牌列表的参数对象
      queryInfo:{
        query:'',
        page:1,//当前页码
        size:10//每页显示条数
      },
      brandList:[],
      total:0,//总记录数,
      //新增或修改品牌信息
      imgUrl:'',//品牌图片地址
      addOrUpdate:true,//新增或修改品牌信息对话框为新增品牌对话框
      addOrUpdateDialogVisible:false,//控制新增或修改品牌信息对话框的显示与隐藏
      //新增或修改品牌信息对话框表单数据
      addOrUpdateForm:{
        name:'',//品牌名称
        letter:'',//品牌首字母
        seq:0,//排序
        image:''//品牌图片地址
      },
      id:0,//修改品牌时，品牌编号
      //记录修改品牌信息对话框输入框中的初始值
      flag:{
        name:'',
      },
      canUpdate:true,
      //新增或修改品牌信息的表单验证规则
      addOrUpdateFormRules:{
        name:[
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' },
          { validator:nameCheck,trigger: 'blur' }
        ],
        letter:[
          { required: true, message: '请输入品牌首字母', trigger: 'blur' },
          { min: 1, max: 1, message: '长度为1个字符', trigger: 'blur' }
        ],
        seq:[
          { required: true, message: '排序不能为空'},
          { type: 'number', message: '排序必须为数字值'}
        ]
      }
    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //获取品牌列表
    async findPage(){
      const {data:res} = await this.$http.get('/brand/findPage',{params:this.queryInfo})
      if(res.code!==1){
        if(this.queryInfo.query===''){
          return this.$msg({
            showClose: true,
            message: '获取品牌列表失败',
            type: 'error',
            duration:2000
          });
        }else{
          return this.$msg({
            showClose: true,
            message: '品牌不存在',
            type: 'error',
            duration:2000
          });
        }
      }
      this.brandList = res.data.rows
      console.log(this.brandList)
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
    //刷新品牌列表
    refreshTable(){
      this.queryInfo.query=''
      this.queryInfo.page=1;
      this.queryInfo.size =10;
      this.findPage();
    },
    //删除品牌
    async removeBrand(row){
      //验证能否删除品牌
      const brand ={
        id:row.id,
        name:row.name
      }
      const {data:res} = await this.$http.get('/brand/canDelete',{params:brand})
      if(res.code!==1)return;
      if(!res.data){
        return this.$msg({
          showClose: true,
          message: '该品牌与其他数据有关联,无法删除',
          type: 'error',
          duration:2000
        });
      }
      else{
        //弹框提示用户是否删除数据
        //用户确定删除，返回"confirm",取消删除返回"cancel"
        const confirmRes = await this.$confirm('此操作将永久删除该品牌, 是否继续?', '提示', {
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
        const {data:res}=await this.$http.get('brand/delete',{params:{id:row.id}})
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
          message: '删除品牌成功',
          type: 'success',
          duration:2000
        })
        this.refreshTable()
      }

    },
    //设置品牌表单数据
    setBrandForm(name,letter,seq,image){
      this.addOrUpdateForm.name=name
      this.addOrUpdateForm.letter=letter
      this.addOrUpdateForm.seq=seq
      this.addOrUpdateForm.image = image
      this.imgUrl = image
    },
    //监听修改品牌按钮的点击
    async updateBrand(row){
      this.addOrUpdate = false
      this.id= row.id
      this.setBrandForm(row.name,row.letter,row.seq,row.image)
      this.flag.name = row.name
      const{data:res} = await this.$http.get('brand/canUpdate',{params:{name:row.name}})
      if(res.code!==1)return;
      this.canUpdate = res.data
      this.addOrUpdateDialogVisible = true
    },
    //监听新增品牌按钮的点击
    addBrand(){
      this.setBrandForm('','',0,'')
      this.addOrUpdate = true
      this.addOrUpdateDialogVisible = true
    },
    //关闭新增或修改品牌信息对话框
    closeDialog(){
      this.$refs.addOrUpdateFormRef.resetFields()
    },
    //上传图片
    async uploadImg(fileObj){
      let formData = new FormData();
      formData.set("file", fileObj.file);
      const {data:res}=await this.$http.post('upload/oss?folderName=brand', formData, {
        headers: {
          "Content-type": "multipart/form-data"
        }
      })
      if(res.code!==1)return;
      this.imgUrl.push(res.data);
    },
    //新增或修改品牌信息
    addOrUpdateBrand(){
      this.$refs.addOrUpdateFormRef.validate(  async valid=>{
        if(!valid) return
        this.addOrUpdateForm.image = this.imgUrl
        if(this.addOrUpdate){
          //新增品牌信息
          const {data:res} = await this.$http.post('brand/add',this.addOrUpdateForm)
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('新增品牌成功')
        }
        else{
          //修改品牌信息
          const {data:res} = await this.$http.post('brand/update',{id:this.id,...this.addOrUpdateForm})
          if(res.code!==1)return this.$msg.error(res.msg);
          this.refreshTable()
          this.$msg.success('修改品牌成功')
        }
        this.addOrUpdateDialogVisible = false

      })

    },

  }
}
</script>

<style scoped>
.avatar-uploader-icon{
  line-height: 178px;
}

</style>
