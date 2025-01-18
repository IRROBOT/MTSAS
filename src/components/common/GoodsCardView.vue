<template>
  <div class="card-goods">
    <el-card shadow="hover" v-for="i in 6" :key="i">
      <div class="goods-img-container">
        <img src="" alt="" />
        <h2>￥ 58</h2>
      </div>
      <div class="goods-bottom-box">
        <div class="goods-name">
          <h3>Star Wars:Ahsoka</h3>
        </div>
        <el-button type="primary">立即购买</el-button>
      </div>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {},
};
</script>
<style scoped lang="scss">
::v-deep .el-card {
  width: 300px;
  height: 400px;
  display: grid-item;
  margin-bottom: 35px;
  justify-self: center;
  align-self: center;

  .el-card__body {
    padding: 0;
    height: 100%;
    .goods-img-container {
      height: 80%;
      width: 100%;
      img {
        width: 100%;
        height: 100%;
        overflow: hidden;
        object-fit: cover;
      }
      h2 {
        color: #000000b0;
        position: relative;
        top: -12%;
        margin: 0;
      }
    }
    .goods-bottom-box {
      width: 100%;
      height: 20%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-color: #c0c0c0;
      align-items: center;
      .goods-name {
        width: 95%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
        h3 {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          margin: 0;
        }
        h3:hover {
          text-decoration: underline;
          color: gold;
        }
      }
    }
  }
}
</style>
