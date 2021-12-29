<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>
<script>
export default {
  methods: {
    logout () {
      window.sessionStorage.clear() // 清空token值
      this.$router.push('/login') // 通过编程式导航定位到login界面
    }
  }
}
</script>
<style lang='less' scoped>

</style>
