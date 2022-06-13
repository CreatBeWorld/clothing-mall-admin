<template>
  <div class="tags">
    <el-tag
      size="small"
      v-for="(item,index) in tags"
      :key="item.name"
      :closable="item.name!=='首页'"
      :effect="$route.name===item.name?'dark':'plain'"
      @click="changeMenu(item)"
      @close="handleClose(item,index)">
      {{item.name}}
    </el-tag>
  </div>
</template>

<script>
import {mapState,mapMutations} from "vuex"
export default {
  name: "CommonTag",
  data(){
    return {

    }
  },
  computed:{
    ...mapState({
      tags:state=>state.tab.tabList
    })
  },
  methods:{
    changeMenu(item){
      this.$router.push(item.path)
      this.setCurrentMenuPath(item.path)
    },
    handleClose(item,index){
      const lastIndex = this.tags.length-1
      this.close(item)
      if(item.name!==this.$route.name){
        return;
      }
      if(index === lastIndex){
        this.$router.push(this.tags[index-1].path)
        this.setCurrentMenuPath(this.tags[index-1].path)
      }else{
        this.$router.push(this.tags[index].path)
        this.setCurrentMenuPath(this.tags[index].path)
      }

    },
    ...mapMutations({
      close:'closeTag',
      setCurrentMenuPath:'setCurrentMenuPath'
    })
  }
}
</script>

<style scoped lang="less">
  .tags{
    flex: 1;
    padding-left: 20px;
    .el-tag{
      margin-right: 15px;
      cursor: pointer;
    }
  }
</style>
