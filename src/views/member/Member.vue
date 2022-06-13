<template>
  <div>
    <el-card>
      <!--   会员列表   -->
      <el-table :data="memberList" border stripe class="member-table">
        <!--    展开列    -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-table :data="scope.row.addressList" border stripe class="my-table">
              <el-table-column type="index" label="序号" width="100px"></el-table-column>
              <el-table-column label="收货人" prop="contact"></el-table-column>
              <el-table-column label="联系方式" prop="phone"></el-table-column>
              <el-table-column label="收货地址" prop="address"></el-table-column>
              <el-table-column label="是否默认">
                <template slot-scope="scope">
                  <el-switch v-model="scope.row.isDefault" disabled></el-switch>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column type="index" label="编号" width="100px"></el-table-column>
        <el-table-column label="会员名" prop="username"></el-table-column>
        <el-table-column label="性别" prop="sex"></el-table-column>
        <el-table-column label="生日" prop="birthday"></el-table-column>
        <el-table-column label="是否启用">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" @change="statusChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="手机号" prop="phone"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
      </el-table>
      <!--   分页   -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.page"
        :page-sizes="[1,2, 6, 10]"
        :page-size="queryInfo.size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Member",
  data(){
    return{
      memberList:[],
      queryInfo:{
        page:1,//当前页码
        size:10//每页显示条数
      },
      total:0
    }
  },
  created() {
    this.findPage()
  },
  methods:{
    //获取会员列表
    async findPage(){
      const {data:res} = await this.$http.get('/user/findPage',{params:this.queryInfo})
      if(res.code!==1) return this.$msg.error('获取会员列表失败')
      this.memberList=res.data.rows
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
    //刷新会员列表
    refreshTable(){
      this.queryInfo.page=1;
      this.queryInfo.size =10;
      this.findPage();
    },
    //设置会员状态
    async statusChange(row){
      const {data:res} = await this.$http.post('user/setStatus',{id:row.id,status:row.status})
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
        message: '设置会员状态成功！',
        type: 'success',
        duration:2000
      });
      this.refreshTable()
    },
  }

}
</script>

<style scoped>

</style>
