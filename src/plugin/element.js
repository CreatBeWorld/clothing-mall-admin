import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css'
import {Button,
  Form,
  FormItem,
  Input,
  Message,
  Container,
  Header,
  Aside,
  Main,
  Menu,
  Submenu,
  MenuItemGroup,
  MenuItem,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn,
  Switch,
  Pagination,
  Dialog,
  MessageBox,
  Select,
  Option,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Tag,
  DatePicker,
  Radio,
  Tabs,
  TabPane,
  Upload,
  RadioGroup,
  Tree,
  Steps,
  Step,
  Cascader,
  Checkbox,
  CheckboxGroup,
  Descriptions,
  DescriptionsItem,
  Timeline,
  TimelineItem
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItemGroup)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Select)
Vue.use(Option)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Tag)
Vue.use(DatePicker)
Vue.use(Radio)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Upload)
Vue.use(RadioGroup)
Vue.use(Tree)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Cascader)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Descriptions)
Vue.use(DescriptionsItem)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.prototype.$msg= Message;
Vue.prototype.$confirm = MessageBox.confirm
