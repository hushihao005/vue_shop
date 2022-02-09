<template>
    <div>
         <!-- 头部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryinfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- table表格区域 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="75px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="150px">
                    <!-- eslint-disable-next-line -->
                    <template slot-scope="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <!-- eslint-disable-next-line -->
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryinfo.pagenum"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="queryinfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
                background>
            </el-pagination>
        </el-card>
    </div>
</template>
<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryinfo: {
        query: '',
        pagenum: 1, // 当前第几页
        pagesize: 10 // 每页显示多少条
      },
      // 商品列表
      goodslist: [],
      // 总数据条数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryinfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败!')
      } else {
        console.log(res.data)
        this.goodslist = res.data.goods
        this.total = res.data.total
        this.$message.success('获取商品列表成功!')
      }
    },
    // pagesize(显示..条/页)发生变化时会调用这个函数
    handleSizeChange (newSize) {
      this.queryinfo.pagesize = newSize
      this.getGoodsList()
      this.$message.success('显示' + newSize + '条/页')
    },
    handleCurrentChange (newPage) {
      this.queryinfo.pagenum = newPage
      this.getGoodsList()
      this.$message.success('跳转到第' + newPage + '页')
    },
    async removeById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      } else {
        const { data: res } = await this.$http.delete(`goods/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败,请重试!')
        } else {
          this.$message.success('删除商品成功!')
          this.getGoodsList()
        }
      }
    },
    // 通过路由导航的方式跳转到对应界面
    goAddpage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
<style lang="less" scoped>

</style>
