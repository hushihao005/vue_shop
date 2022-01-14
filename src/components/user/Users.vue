<template>
  <div>
    <!-- 导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="UserList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- eslint-disable-next-line -->
          <!-- 定义作用域插槽 通过slot-scope接收当前作用域数据 通过scope.row拿到对应行的数据 
               再通过v-model进行数据绑定
          -->
          <template slot-scope="scope">
            <!-- {{ scope.row.mg_state }} -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- eslint-disable-next-line -->
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="small" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="small" @click="removeUserById(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="small" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 4]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
      <!-- 添加用户的对话框 -->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="30%" @close="addDialogClosed">
        <!-- 内容主题体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser" >确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%" @close="editDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 页脚区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserinfo">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色的对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%" @close="setRoleDialogClosed">
        <div>
          <p>当前的用户: {{userinfo.username}}</p>
          <p>当前的角色: {{userinfo.role_name}}</p>
          <p>
            分配新角色: <el-select v-model="selectedRoleId" placeholder="请选择">
                          <el-option
                            v-for="item in rolesList"
                            :key="item.id"
                            :label="item.roleName"
                            :value="item.id">
                          </el-option>
                        </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleinfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        // 合法邮箱
        return cb()
      } else {
        cb(new Error('请输入合法的邮箱 例如:123456@qq.com'))
      }
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        // 合法邮箱
        return cb()
      } else {
        cb(new Error('请输入合法的手机号 例如:180xxxxx906'))
      }
    }
    return {
      // 选中的角色id值
      selectedRoleId: '',
      // 所有角色的数据列表
      rolesList: [],
      // 需要被分配权限的用户信息
      userinfo: {},
      // 获取用户列表参数对象
      queryInfo: {
        query: '', // 搜索的关键字段
        pagenum: 1, // 当前的页数
        pagesize: 2 // 当前每页显示多少条数据
      },
      UserList: [],
      total: 0,
      addDialogVisible: false, // 控制添加用户对话框的显示和隐藏
      editDialogVisible: false, // 控制修改用户对话框的显示和隐藏
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加表单的规则对象
      addFormRules: {
        username: [
          // 必填属性:true 错误提示 触发验证时机:失去焦点
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在 3 到 10 个字符之间', trigger: 'blur' }
        ],
        password: [
          // 必填属性:true 错误提示 触发验证时机:失去焦点
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度在 6 到 15 个字符之间', trigger: 'blur' }
        ],
        email: [
          // 必填属性:true 错误提示 触发验证时机:失去焦点
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 查询到的用户信息对象
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱号', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框的显示或隐藏
      setRoleDialogVisible: false
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      // 从后端那取得数据 通过返回的status值来判断请求是否成功
      // 成功就把数据保存到data数据中
      var { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      } else {
        // 保存用户列表 用户数量
        this.UserList = res.data.users
        this.total = res.data.total
      }
    },
    // 监听pagesize的改变
    handleSizeChange (newsize) {
      // console.log(newsize)
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange (newpage) {
      // console.log(newpage)
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    // 监听switch开关的状态
    async userStateChange (userinfo) {
      console.log(userinfo)
      var { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state // 请求失败时保证按钮还是原样
        return this.$message.error('更新用户列表失败!')
      } else {
        return this.$message.success('更新用户列表成功!')
      }
    },
    // 监听添加用户列表关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields() // 对表单内容进行重置
    },
    // 点击按钮,添加新用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (valid) {
          var { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败')
          } else {
            this.$message.success('添加用户成功')
            this.addDialogVisible = false // 隐藏添加用户对话框
            this.getUserList() // 重新获取用户列表
          }
        } else {
          // eslint-disable-next-line no-useless-return
          return
        }
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      } else {
        this.editForm = res.data
      }
      this.editDialogVisible = true
    },
    // 监听修改用户对话框关闭 重置信息
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并提交
    editUserinfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          // eslint-disable-next-line no-useless-return
          return
        } else {
          // 发起修改用户信息请求
          const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
          if (res.meta.status !== 200) {
            return this.$message.error('更新用户信息失败!')
          } else {
            // 关闭对话框
            this.editDialogVisible = false
            // 刷新数据列表
            this.getUserList()
            // 提示修改成功
            this.$message.success('更新用户信息成功')
          }
        }
      })
    },
    // 根据id删除用户
    async removeUserById (id) {
      // console.log(id)
      // 弹框询问用户是否删除数据
      var confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(error => {
        return error
      })
      // 如果用户确认删除则返回值为字符串confirm
      // 如果用户取消删除则返回值为字符串cancel
      // console.log(confirmResult)
      // eslint-disable-next-line
      if (confirmResult == 'confirm') {
        // console.log('确认删除')
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        } else {
          this.$message.success('删除用户成功')
          this.getUserList()
        }
      } else {
        return this.$message.info('已取消删除操作')
      }
    },
    // 展示分配角色的对话框
    async setRole (userinfo) {
      this.userinfo = userinfo
      // 在展示对话框之前获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      } else {
        this.rolesList = res.data
      }
      this.setRoleDialogVisible = true
    },
    // 点击按钮,分配角色
    async saveRoleinfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色!')
      } else {
        const { data: res } = await this.$http.put(`users/${this.userinfo.id}/role`, { rid: this.selectedRoleId })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色失败!')
        } else {
          this.$message.success('更新角色成功!')
          this.getUserList()
          this.setRoleDialogVisible = false
        }
      }
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userinfo = {}
    }
  }
}
</script>
<style lang='less' scoped>
</style>
