import Vue from 'vue'
import VueRouter from 'vue-router'
const Welcome = ()=>import('../views/Welcome')
const Login = () => import('../components/common/Login')
const Home = () => import('../views/Home')
//会员管理
const Member = ()=>import('../views/member/Member')
//系统管理
const Users = ()=>import('../views/system/user/Users')
const UserCenter =()=>import('../views/system/user/UserCenter')
const SysRole = ()=>import('../views/system/Role/SysRole')
const AssignMenu =()=>import('../views/system/Role/AssignMenu')
const SysMenu =()=>import('../views/system/menu/SysMenu')
const AddOrUpdateMenu = ()=>import('../views/system/menu/AddOrUpdateMenu')
//商品管理
const BrandManage =()=>import('../views/goods/BrandManage')
const GoodsConfig =()=>import('../views/goods/GoodsConfig')
const SpecManage = ()=>import('../views/goods/SpecManage')
const ParaManage= ()=>import('../views/goods/ParaManage')
const CategoryManage = ()=>import('../views/goods/CategoryManage')
const AddOrUpdateCate =()=>import('../views/goods/AddOrUpdateCate')
const AddGoods = ()=>import('../views/goods/AddGoods')
const GoodsList = ()=>import('../views/goods/GoodsList')
const AuditDetail = ()=>import('../views/goods/AuditDetail')
const UpdateGoods = ()=>import('../views/goods/UpdateGoods')
//订单管理
const OrderConfig = ()=>import('../views/order/OrderConfig')
const ReturnCauseConfig = ()=>import('../views/order/ReturnCauseConfig')
const OrderReturnGoods = ()=>import('../views/order/OrderReturnGoods')
const OrderRefund = ()=>import('../views/order/OrderRefund')
const ReturnGoodsDetail = ()=>import('../views/order/ReturnGoodsDetail')
const RefundDetail = ()=>import('../views/order/RefundDetail')
const OrderList =()=>import('../views/order/OrderList')
const SendOrderList = ()=>import('../views/order/SendOrderList')
const OrderDetail = ()=>import('../views/order/OrderDetail')



const originalPush = VueRouter.prototype.push

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        name:'首页',
        component:Welcome
      },
      {
        path:'/userCenter',
        name:'用户中心',
        component:UserCenter
      },
      //会员管理
      {
        path:'/member/manage',
        component:Member,
        name:'会员管理'
      },
      //系统管理
      {
        path:'/sys/user',
        name:'用户管理',
        component: Users
      },
      {
        path:'/sys/role',
        name:'角色管理',
        component:SysRole
      },
      {
        path:'/sys/role/assignMenu',
        name:'分配菜单',
        component:AssignMenu
      },
      {
        path:'/sys/menu',
        name:'菜单管理',
        component:SysMenu
      },
      {
        component:AddOrUpdateMenu,
        path:'/sys/menu/addOrUpdateMenu'
      },
      //商品管理
      {
        component:GoodsList,
        path:'/goods/list',
        name:'商品列表'
      },
      {
        path:'/goods/detail',
        component:AuditDetail,
      },
      {
        path:'/goods/update',
        component:UpdateGoods,
        name:'修改商品信息'
      },
      {
        component:BrandManage,
        path:'/goods/brandManage',
        name:'品牌管理'
      },
      {
        component:GoodsConfig,
        path:'/goods/config',
        name:'商品设置'
      },
      {
        component:SpecManage,
        path:'/spec/list',
        name:'规格管理'
      },
      {
        component:ParaManage,
        path:'/para/list',
        name:'参数管理'
      },
      {
        component:CategoryManage,
        path:'/goods/category',
        name:'商品分类'
      },
      {
        component:AddOrUpdateCate,
        path:'/goods/category/addOrUpdateCate',
      },
      {
        path:'/goods/add',
        component:AddGoods,
        name:'新增商品'
      },
      //订单管理
      {
        path:'/order/config',
        component:OrderConfig,
        name:'订单设置'
      },
      {
        path:'/order/returnCause',
        component:ReturnCauseConfig,
        name:'退货原因设置'
      },
      {
        path:'/order/returnGoods',
        component:OrderReturnGoods,
        name:'退货申请处理'
      },
      {
        path:'/order/returnGoods/details',
        component:ReturnGoodsDetail,
        name:'查看退货申请详情'
      },
      {
        path:'/order/refund',
        component:OrderRefund,
        name:'退款申请处理'
      },
      {
        path:'/order/refund/details',
        component:RefundDetail,
        name:'查看退款申请详情'
      },
      {
        path:'/order/list',
        component:OrderList,
        name:'订单列表'
      },
      {
        path:'/order/list/sendList',
        component:SendOrderList,
        name:'发货列表'
      },
      {
        path:'/order/list/detail',
        component:OrderDetail,
        name:'订单详情'
      },


    ]
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})
//挂载路由导航守卫  控制访问权限
router.beforeEach((to,from,next)=>{
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})
export default router
