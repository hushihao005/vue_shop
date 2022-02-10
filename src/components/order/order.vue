<template>
    <div>
        <!-- 头部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单列表数据 -->
            <el-table :data="orderlist" border stripe>
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                  <!-- eslint-disable-next-line -->
                  <template slot-scope="scope">
                    <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                    <el-tag type="danger" v-else>未付款</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                  <!-- eslint-disable-next-line -->
                  <template slot-scope="scope">
                    {{scope.row.create_time | dateFormat}}
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <!-- eslint-disable-next-line -->
                  <template slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
                    <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                  </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryinfo.pagenum"
              :page-sizes="[5, 10, 20]"
              :page-size="queryinfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
            </el-pagination>
            <!-- 修改地址对话框区域 -->
            <el-dialog
              title="修改地址"
              :visible.sync="addressVisible"
              width="50%"
              @close="addressDialogClosed">
              <el-form :model="addressForm" :rules="addressRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                  <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                  <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
              </el-form>
              <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
              </span>
            </el-dialog>
            <!-- 物流进度对话框区域 -->
            <el-dialog
              title="物流进度"
              :visible.sync="progressVisible"
              width="50%">
              <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in activities"
                  :key="index"
                  :icon="activity.icon"
                  :type="activity.type"
                  :color="activity.color"
                  :size="activity.size"
                  :timestamp="activity.timestamp">
                  {{activity.content}}
                </el-timeline-item>
              </el-timeline>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 总数据条数
      total: 0,
      // 订单列表
      orderlist: [],
      // 默认隐藏对话框
      addressVisible: false,
      addressForm: {
        address1: [],
        address2: ''
      },
      cityData: cityData,
      addressRules: {
        address1: [{ required: true, message: '请选择省市区/县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },
      // 默认隐藏物流进度对话框
      progressVisible: false,
      progressinfo: [],
      reverse: true,
      activities: [{
        content: '快递已收取',
        timestamp: '202-01-15',
        size: 'large',
        color: '#0bbd87'
      }, {
        content: '快递已运送',
        timestamp: '2022-1-16',
        color: '#0bbd87'
      }, {
        content: '快递已派件',
        timestamp: '2022-1-18',
        color: '#0bbd87'
      }, {
        content: '快递送达',
        timestamp: '2022-1-19',
        type: 'primary',
        icon: 'el-icon-more'
      }]
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryinfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表数据失败,请重试!')
      } else {
        console.log(res.data)
        this.$message.success('获取订单列表数据成功!')
        this.total = res.data.total
        this.orderlist = res.data.goods
      }
    },
    handleSizeChange (newsize) {
      this.queryinfo.pagesize = newsize
      this.getOrderList()
      this.$message.success('显示' + newsize + '条/页')
    },
    handleCurrentChange (newpage) {
      this.queryinfo.pagenum = newpage
      this.getOrderList()
      this.$message.success('跳转到第' + newpage + '页')
    },
    // 展示修改地址的对话框
    showBox () {
      this.addressVisible = true
    },
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    async showProgressBox () {
      this.progressVisible = true
      // const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流信息失败,请重试')
      // } else {
      //   this.progressinfo = res.data
      //   console.log(this.progressinfo)
      // }
    }
  }
}
</script>
<style lang="less" scoped>
  .el-cascader{
    width: 100%
  }
</style>
