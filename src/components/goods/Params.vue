<template>
    <div>
        <!-- 头部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 头部的警告区域 -->
            <el-alert title="注意!!! 只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false">
            </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类: </span>
                    <!-- 级联选择器 选择商品分类的 -->
                    <el-cascader
                      ref="cascaderHandle"
                      expand-trigger="hover"
                      v-model="selectedCateKeys"
                      :options="catelist"
                      :props="CateProps"
                      @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- 页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
              <!-- 添加动态参数面板 -->
              <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
                <!-- 动态参数表格 -->
                <el-table :data="manyTableData" border stripe>
                  <!-- 展开行 -->
                  <el-table-column type="expand">
                    <!-- eslint-disable-next-line -->
                    <template slot-scope="scope">
                       <!-- 循环渲染tag标签 -->
                      <el-tag closable :key="i" v-for="(item, i) in scope.row.attr_vals" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                      <!-- 输入的文本框 -->
                      <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm"
                        @blur="handleInputConfirm(scope.row)">
                      </el-input>
                      <!-- 添加按钮 -->
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <!-- 索引列 -->
                  <el-table-column type="index" label="#"></el-table-column>
                  <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <!-- eslint-disable-next-line -->
                    <template slot-scope="scope">
                      <el-button type="primary" icon="edit" size="mini">编辑</el-button>
                      <el-button type="danger" icon="delete" size="mini">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <!-- 添加静态属性面板 -->
              <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                <!-- 静态参数表格 -->
                <el-table :data="onlyTableData" border stripe>
                  <!-- 展开行 -->
                  <el-table-column type="expand">
                    <!-- eslint-disable-next-line -->
                    <template slot-scope="scope">
                       <!-- 循环渲染tag标签 -->
                      <el-tag closable :key="i" v-for="(item, i) in scope.row.attr_vals" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                      <!-- 输入的文本框 -->
                      <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm"
                        @blur="handleInputConfirm(scope.row)">
                      </el-input>
                      <!-- 添加按钮 -->
                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                    </template>
                  </el-table-column>
                  <!-- 索引列 -->
                  <el-table-column type="index" label="#"></el-table-column>
                  <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                  <el-table-column label="操作">
                    <!-- eslint-disable-next-line -->
                    <template slot-scope="scope">
                      <el-button type="primary" icon="edit" size="mini">编辑</el-button>
                      <el-button type="danger" icon="delete" size="mini">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数对话框 -->
        <el-dialog
          :title="'添加'+ titleText"
          :visible.sync="addDialogVisible"
          width="50%"
          @close="addDialogClosed">
          <!-- 添加参数对话框 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" class="demo-ruleForm">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      catelist: [],
      // 级联选择框的配置对象
      CateProps: {
        checkStrictly: true, // 是否选择任意一级的选项
        value: 'cat_id', // 指定选中的值
        label: 'cat_name', // 看到的值
        children: 'children' // 父子节点的嵌套属性
      },
      // 级联选择框双向绑定的数据
      selectedCateKeys: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 默认激活的页签的名称
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的规则验证对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 默认隐藏文本输入框
      inputVisible: false,
      // 文本框中输入的内容
      inputValue: ''
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败!')
      } else {
        this.catelist = res.data
      }
    },
    // 级联选择框选中项变化时,会触发此事件
    handleChange () {
      if (this.selectedCateKeys.length !== 3) {
        // 选中的不是三级分类
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.$refs.cascaderHandle.dropDownVisible = false
        return this.$message.error('只允许为第三级分类设置相关参数')
      }
      this.getParamsData()
    },
    // tab页签点击事件
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData () {
      console.log(this.selectedCateKeys)
      if (this.selectedCateKeys.length !== 3) {
        // 选中的不是三级分类
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.$refs.cascaderHandle.dropDownVisible = false
      } else {
        // 选中的是三级分类
        console.log(this.selectedCateKeys)
        // 根据所选分类的id和当前所处的面板获取对应的参数
        const { data: res } = await this.$http.get(`categories/${this.CateId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数列表失败')
        } else {
          res.data.forEach(item => {
            // 本来返回的是字符串现在经过循环之后就变成数组了
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 控制文本框的显示与隐藏
            item.inputVisible = false
            // 文本框中输入的值
            item.inputValue = ''
          })
          console.log(res.data)
          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else {
            this.onlyTableData = res.data
          }
        }
      }
      this.$refs.cascaderHandle.dropDownVisible = false
    },
    // 监听对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮 添加参数
    addParams () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.post(`categories/${this.CateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加参数失败!')
          } else {
            this.$message.success('添加参数成功!')
            this.addDialogVisible = false
            this.getParamsData()
          }
        } else {
          // eslint-disable-next-line no-useless-return
          return
        }
      })
    },
    // 文本框失去焦点,或按下enter都会触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return 说明输入内容 需要做后续处理
      var rowTrim = row.inputValue.trim()
      row.attr_vals.push(rowTrim)
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求保存添加
      this.saveAttrVals(row)
    },
    // 对attr_vals的操作保存到数据库
    async saveAttrVals (row) {
      // 发起请求保存添加
      const { data: res } = await this.$http.put(`categories/${this.CateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败!')
      } else {
        return this.$message.success('修改参数成功!')
      }
    },
    // 点击按钮展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick方法作用 就是当页面上元素被重新渲染之后 才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应参数可选项
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    // 计算属性是依赖缓存的 性能上更好 也就是只要内容没变化 就不会像方法一样被反复调用
    // 如果按钮被禁用 则返回true 否则返回false
    // eslint-disable-next-line vue/return-in-computed-property
    isBtnDisabled () {
      // eslint-disable-next-line eqeqeq
      if (this.selectedCateKeys.length == 3) {
        return false
      } else {
        return true
      }
    },
    // 当前选中的三级分类的id
    // eslint-disable-next-line vue/return-in-computed-property
    CateId () {
      if (this.selectedCateKeys.length !== 3) {
        return null
      } else {
        return this.selectedCateKeys[2]
      }
    },
    // 动态计算标题文本
    // eslint-disable-next-line vue/return-in-computed-property
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
    .cat_opt{
        margin: 15px 0;
    }
    .el-tag{
      margin: 10px;
    }
    .el-input {
      width: 150px;
    }
</style>
