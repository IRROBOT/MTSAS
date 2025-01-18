<template>
  <div class="ResourceFilter">
    <el-collapse accordion>
      <el-collapse-item>
        <template slot="title">
          <i class="el-icon-s-operation"></i>筛选影片
        </template>
        <div class="filter-bar">
          <div class="region-order-box">
            <el-popover placement="bottom" width="400" trigger="click">
              <h2 slot="reference">
                按地区筛选:<span>{{ region }}</span>
              </h2>
              <ul class="region-wrapper">
                <li
                  v-for="(item, index) in regionList"
                  :key="index"
                  @click="chooseRegion(index)"
                >
                  {{ item.title }}
                </li>
              </ul>
            </el-popover>
          </div>
          <div class="rank-order-box">
            <h2>按顺序筛选:</h2>
            <ul class="order-wrapper">
              <li
                :class="
                  item.trigger ? 'li-order-btn activeType' : 'li-order-btn'
                "
                v-for="(item, index) in orderTypeList"
                :key="index"
                @click="chooseOrderType(index)"
              >
                {{ item.title }}
              </li>
            </ul>
          </div>
          <div class="type-order-box">
            <h2>按类别筛选:</h2>
            <ul class="type-list">
              <li
                :class="item.trigger ? 'li-normal activeType' : 'li-normal'"
                v-for="(item, index) in typeList"
                :key="index"
                @click="chooseType(index)"
              >
                {{ item.title }}
              </li>
            </ul>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
export default {
  props: ["defaultType"],
  data() {
    return {
      searchVal: "",
      orderTypeList: [
        { title: "高分优先", trigger: true },
        { title: "首映时间", trigger: false },
      ],
      typeList: [
        { id: 0, title: "全部", trigger: true },
        { id: 1, title: "动作", trigger: false },
        { id: 2, title: "恐怖", trigger: false },
        { id: 3, title: "战争", trigger: false },
        { id: 4, title: "动画", trigger: false },
        { id: 5, title: "爱情", trigger: false },
        { id: 6, title: "科幻", trigger: false },
        { id: 7, title: "悬疑", trigger: false },
        { id: 8, title: "喜剧", trigger: false },
        { id: 9, title: "犯罪", trigger: false },
        { id: 10, title: "剧情", trigger: false },
        { id: 11, title: "惊悚", trigger: false },
        { id: 12, title: "冒险", trigger: false },
        { id: 13, title: "传记", trigger: false },
      ],
      region: "全部地区",
      regionList: [
        { id: 0, title: "全部地区" },
        { id: 1, title: "中国大陆" },
        { id: 2, title: "中国香港" },
        { id: 3, title: "中国台湾" },
        { id: 4, title: "美国" },
        { id: 5, title: "韩国" },
        { id: 6, title: "日本" },
        { id: 7, title: "泰国" },
        { id: 8, title: "印度" },
        { id: 9, title: "英国" },
        { id: 10, title: "法国" },
        { id: 11, title: "德国" },
        { id: 12, title: "意大利" },
        { id: 13, title: "西班牙" },
        { id: 14, title: "俄罗斯" },
        { id: 15, title: "加拿大" },
        { id: 16, title: "澳大利亚" },
        { id: 17, title: "爱尔兰" },
        { id: 18, title: "瑞典" },
        { id: 19, title: "巴西" },
        { id: 20, title: "丹麦" },
      ],
      factorArr: [],
    };
  },
  mounted() {
    this.chooseFactor(this.defaultType);
  },
  methods: {
    chooseRegion(index) {
      //先把地区的factor删掉
      this.factorArr = this.factorArr.filter((item) => !("area" in item));
      this.factorArr.push({ area: this.regionList[index].title });
      this.region = this.regionList[index].title;
      this.$emit("factorArr", this.factorArr);
    },
    catchDefaultType(data) {
      this.chooseFactor(data);
    },
    chooseType(index) {
      this.typeList.forEach((v) => {
        v.trigger = false;
      });
      this.typeList[index].trigger = true;
      //先去掉之前的contentClass
      this.factorArr = this.factorArr.filter(
        (item) => !("contentClass" in item)
      );
      this.factorArr.push({ contentClass: this.typeList[index].title });
      this.$emit("factorArr", this.factorArr);
    },
    chooseFactor(val) {
      if (this.defaultType != null) {
        let index = 0;
        this.typeList.forEach((v) => {
          if (v.title == val) {
            index = v.id;
          }
        });
        this.chooseType(index);
      }
    },
    chooseOrderType(index) {
      this.orderTypeList.forEach((v) => {
        v.trigger = false;
      });
      this.orderTypeList[index].trigger = true;
      if (index == 0) {
        this.$emit("orderType", ["mi.totalGrade", "desc"]);
      } else if (index == 1) {
        this.$emit("orderType", ["mi.date", "desc"]);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.ResourceFilter {
  position: sticky;
  top: 0;
  z-index: 50;
}
::v-deep .el-collapse-item__header {
  backdrop-filter: blur(20px);
  background-color: #ffffffbd !important;
}
::v-deep .el-collapse-item__content {
  padding: 0 !important;
}
.region-wrapper {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  background-color: #c2c8d5;
  li {
    padding: 2px 5px;
    cursor: pointer;
    background-color: #fff;
    margin: 5px;
    border-radius: 3px;
  }
}
.filter-bar {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  .region-order-box {
    flex-basis: max-content;
    h2 {
      span {
        color: gold;
      }
    }
    h2:hover {
      background-color: #00284e6e;
      cursor: pointer;
      border-radius: 5px;
    }
  }

  .rank-order-box {
    flex-basis: max-content;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    .order-wrapper {
      display: flex;
      li {
        padding: 0 5px;
        font-size: 20px;
        cursor: pointer;
      }
    }
  }
  .type-order-box {
    flex-basis: max-content;
    display: flex;
    align-items: center;
    h2 {
      flex-basis: 150px;
    }
    .type-list {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-around;
      li {
        padding: 0 5px;
        width: max-content;
      }
      li:hover {
        background-color: #00284e6e;
        border-radius: 5px;
        cursor: pointer;
        color: gold;
      }
    }
  }
}
.li-order-btn {
  width: max-content;
  cursor: pointer;
}
.li-normal {
  width: 40px;
  font-size: 20px;
  cursor: pointer;
}
.activeType {
  background-color: #00284e6e;
  border-radius: 5px;
  color: gold;
}
</style>
