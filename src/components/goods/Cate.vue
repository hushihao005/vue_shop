<template>
    <div>
        <!-- 头部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加分类按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 data为数据源 columns为table指定列-->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type = 'false' :expand-type = 'false' :show-index = "true" index-text="#" border>
              <!-- 是否有效列 -->
              <!-- eslint-disable-next-line -->
              <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
                <i class="el-icon-error" v-else style="color: red"></i>
              </template>
              <!-- 排序列 -->
              <!-- eslint-disable-next-line -->
              <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                <el-tag size="mini" type="warning" v-else>三级</el-tag>
              </template>
              <!-- 操作列 -->
              <!-- eslint-disable-next-line -->
              <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </tree-table>
            <!-- 分页区 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="querInfo.pagenum"
              :page-sizes="[3, 5, 10, 15]"
              :page-size="querInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
        </el-card>
        <!-- 添加分类的对话框 -->
        <el-dialog
          title="添加分类"
          :visible.sync="addCateDialogVisible"
          width="50%"
          @close="addCateDialogClosed">
          <!-- 添加分类的表单 -->
          <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
            <el-form-item label="分类名称" prop="cat_name">
              <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类: ">
              <!-- options 用来指定数据源的 props用来指定配置对象 -->
              <el-cascader
                ref="cascaderHandle"
                expand-trigger = "hover"
                v-model="selectedKeys"
                :options="parentCateList"
                :props="cascaderProps"
                @change="parentCateChange"
                clearable>
              </el-cascader>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表 默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列
      columns: [{
        label: '分类名称',
        prop: 'cat_name' // 指定列内容的具体的值
      },
      {
        label: '是否有效',
        type: 'template', // 指定当前列定义为模板列
        template: 'isok' // 指定当前列使用的模板名称
      },
      {
        label: '排序',
        type: 'template', // 指定当前列定义为模板列
        template: 'order' // 指定当前列使用的模板名称
      },
      {
        label: '操作',
        type: 'template', // 指定当前列定义为模板列
        template: 'opt' // 指定当前列使用的模板名称
      }
      ],
      // 控制添加分类对话框的显示或隐藏
      addCateDialogVisible: false,
      // 添加分类表单的数据对象
      addCateForm: {
        // 需要添加分类的分类名称
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 默认分类的等级为1级
        cat_level: 0
      },
      // 添加分类表单的规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        checkStrictly: true, // 是否选择任意一级的选项
        value: 'cat_id', // 选中的值的属性
        label: 'cat_name', // 看到的是那个属性
        children: 'children' // 父子嵌套用的属性
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.querInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      } else {
        // 把数据列表赋值给cateList
        // console.log(res.data)
        this.cateList = res.data.result
        // 为总数据条数赋值
        this.total = res.data.total
      }
    },
    // 监听分页改变
    handleSizeChange (newsize) {
      this.querInfo.pagesize = newsize
      // 刷新数据
      this.getCateList()
      this.$message.success('显示' + newsize + '条/页')
    },
    // 监听页码值改变
    handleCurrentChange (newpage) {
      this.querInfo.pagenum = newpage
      // 刷新数据
      this.getCateList()
      this.$message.success('第' + newpage + '页')
    },
    // 点击按钮显示添加分类的对话框
    showAddCateDialog () {
      // 弹出对话前时加载父级分类的数据列表
      this.getParentCateList()
      // 展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message('获取父级分类数据列表失败')
      } else {
        this.parentCateList = res.data
        // console.log(res.data)
      }
    },
    // 选择项发生变化触发的函数
    parentCateChange () {
      console.log(this.selectedKeys)
      // 如果selectedKeys的length大于0了 说明选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
        this.$refs.cascaderHandle.dropDownVisible = false
        // eslint-disable-next-line no-useless-return
        return
      } else {
        // 父级分类的id
        this.addCateForm.cat_pid = 0
        // 当前分类的等级
        this.addCateForm.cat_level = 0
      }
      this.$refs.cascaderHandle.dropDownVisible = false
    },
    // 点击按钮添加新的分类
    addCate () {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post('categories', this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败!')
          } else {
            this.$message.success('添加分类成功!')
            this.getCateList()
          }
        } else {
          // eslint-disable-next-line no-useless-return
          return
        }
      })
      this.addCateDialogVisible = false
    },
    // 监听对话框的关闭事件
    addCateDialogClosed () {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
}
</script>
<style lang="less" scoped>
  .treeTable{
    margin-top:15px
  }
  .el-cascader{
    width: 100%;
  }
</style>
