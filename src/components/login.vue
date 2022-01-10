<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-s-custom" placeholder="请输入用户名"  v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" placeholder="请输入密码" type="password" v-model="loginForm.password"></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login" round>登录</el-button>
          <el-button type="info" @click="resetLoginForm" round>重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是登录表单的数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 这是登录表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合规
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合规
        password: [
          { required: true, message: '请输入登录密码', trigger: 'change' },
          { min: 6, max: 15, message: '长度在 6 到 15 个数字或字母', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮 重置表单
    resetLoginForm () {
      // console.log(this)
      this.$refs.loginFormRef.resetFields()
    },
    // 点击登录 预验证
    login () {
      this.$refs.loginFormRef.validate(async vaild => { // async配合await使用 await只能用在被async修饰的方法中
        // console.log(vaild)
        if (vaild) {
          var { data: res } = await this.$http.post('login', this.loginForm) // 通过await简化返回的promise对象
          // console.log(res)
          if (res.meta.status !== 200) {
            this.$message.error('登录失败')
          } else {
            this.$message.success('登录成功')
          }
        } else {
          // eslint-disable-next-line no-useless-return
          return
        }
        // 1.将登录成功之后的token,保存到客户端的sessionStorage中
        //  1.1 项目中除了登录以外的其他api接口,必须在登录之后才能访问
        //  1.2 token只应用在当前网站打开期间生效,所以将token保存在sessionStorage中
        // console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        // 2.通过编程式导航跳转到主页,路由地址是/home
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang='less' scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  box-shadow: 0 0 10px #ddd;
  border-radius: 50%;
  padding: 10px;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.btns {
  display: flex;
  justify-content: center;
}
.login_form {
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
