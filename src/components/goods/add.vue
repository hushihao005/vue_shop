<template>
    <div>
        <!-- 头部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
          <!-- 提示区域 -->
          <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
          <!-- 步骤条区域 active:激活项的索引 -->
          <el-steps :space="300" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
          </el-steps>
          <!-- tab栏区域 -->
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
            <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTable" @tab-click="tabClicked">
              <el-tab-pane label="基本信息" name="0">
                <el-form-item label="商品名称" prop="goods_name">
                  <el-input v-model="addForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                  <el-input v-model="addForm.goods_price" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                  <el-input v-model="addForm.goods_weight"></el-input>
                </el-form-item>
                <el-form-item label="商品数量" prop="goods_number">
                  <el-input v-model="addForm.goods_number" type="number"></el-input>
                </el-form-item>
                <el-form-item label="商品分类" prop="goods_cat">
                  <el-cascader
                    ref="cascaderHandle"
                    expand-trigger="hover"
                    v-model="addForm.goods_cat"
                    :options="catelist"
                    :props="cateProps"
                    @change="handleChange">
                  </el-cascader>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane label="商品参数" name="1">
                <!-- 渲染表单item项 -->
                <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                  <!-- 复选框组 -->
                  <el-checkbox-group v-model="item.attr_vals">
                    <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane label="商品属性" name="2">
                <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                  <el-input v-model="item.attr_vals"></el-input>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane label="商品图片" name="3">
                <!-- action是图片要上传到的地址
                     on-preview指定预览的事件
                     on-remove点击x号时调用
                     list-type 指定预览的呈现方式
                     headers 图片上传组件的请求头 因为上传组件调用的是自己封装的axios 所以要自己手动绑定axios-->
                <el-upload
                  :action="uploadURL"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  list-type="picture"
                  :headers="headerObj"
                  :on-success="handleSuccess">
                  <el-button size="small" type="primary">点击上传</el-button>
                </el-upload>
              </el-tab-pane>
              <el-tab-pane label="商品内容" name="4">
                <!-- 富文本编辑器组件 -->
                <quill-editor v-model="addForm.goods_introduce"/>
                <!-- 添加商品的按钮 -->
                <el-button type="primary" class="btnadd" @click="add">添加商品</el-button>
              </el-tab-pane>
            </el-tabs>
          </el-form>
        </el-card>
        <!-- 图片预览 -->
        <el-dialog
          class="previewImg"
          title="图片预览"
          :visible.sync="previewVisible"
          width="50%">
          <img :src="previewPath" alt="">
        </el-dialog>
    </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import _ from 'lodash'
export default {
  data () {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类(0,1,2 --> 1级,2级,3级)
        goods_cat: [],
        // 上传的图片的数组
        pics: [],
        // 商品详情的描述
        goods_introduce: '',
        // 商品的参数(静态属性和动态属性)
        attrs: []
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      catelist: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly: true
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态参数列表数据
      onlyTableData: [],
      // 上传图片的url地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      previewVisible: false
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品数据失败,请重试!')
      } else {
        this.catelist = res.data
        console.log(this.catelist)
        this.$message.success('获取商品数据成功!')
      }
    },
    // 级联选择器选中项变化触发的函数
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$refs.cascaderHandle.dropDownVisible = false
        return this.$message.error('只允许选择三级菜单')
      }
      this.$refs.cascaderHandle.dropDownVisible = false
    },
    beforeTable (activeName, oldActiveName) {
      // console.log(oldActiveName, activeName)
      // eslint-disable-next-line eqeqeq
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先完成必填项')
        return false
      } else {
        this.$message.success('切换成功')
      }
    },
    async tabClicked () {
      // 访问的是商品动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败,请重试!')
        } else {
          console.log(res.data)
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals.length === '0' ? [] : item.attr_vals.split(' ')
            console.log(item.attr_vals)
          })
          this.manyTableData = res.data
          this.$message.success('获取商品参数成功!')
        }
      } else if (this.activeIndex === '2') {
        // 访问的是静态属性面板
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败,请重试!')
        } else {
          this.onlyTableData = res.data
          // console.log(this.onlyTableData)
          this.$message.success('获取商品参数成功!')
        }
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      console.log(this.previewPath)
      this.previewVisible = true
    },
    // 处理点击x号时操作
    handleRemove (file) {
      console.log(file)
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中找到这个图片的索引值
      const i = this.addForm.pics.findIndex(x =>
        x.pic === filePath
      )
      // 3.调用splice方法将图片信息对象,从pics中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm.pics)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      console.log(response)
      // 1.拼接得到一个图片信息对象
      const picinfo = { pic: response.data.tmp_path }
      // 2.将图片信息对象push到pics数组中
      this.addForm.pics.push(picinfo)
      console.log(this.addForm.pics)
    },
    // 添加商品
    add () {
      // console.log(this.addForm.goods_introduce)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请先填写必填项')
        } else {
          // 执行添加的逻辑
          // goods_cat 从数组变成字符串
          // 直接这样会报错 因为级联选择器规定只能通过双向数据绑定到数组
          // 可以在转换之前通过深层拷贝addform 操作拷贝完的addform来避免错误
          // lodash cloneDeep(要拷贝的对象)
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          // 处理动态参数
          this.manyTableData.forEach(item => {
            const newinfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newinfo)
          })
          // 处理静态属性
          this.onlyTableData.forEach(item => {
            const newinfo = {
              attr_id: item.attr_id,
              // 静态属性的值本来就是字符串
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newinfo)
          })
          form.attrs = this.addForm.attrs
          console.log(form)
          // 发起商品添加请求
          const { data: res } = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败,请重试!')
          } else {
            this.$message.success('添加商品成功!')
            // 通过编程式导航的方式跳转到商品列表
            this.$router.push('/goods')
          }
        }
      })
    }
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .el-checkbox{
    margin: 0 5 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .btnadd{
    margin-top: 15px;
  }
</style>
