import http from "@/common/api/request.js";
import { Message } from "element-ui";
export default {
  /*请求影视数据*/
  async getRankList(limit, offset, field, artType, order, fuzzyQuery, isLog) {
    //limit限制请求条数,offset请求的数据的开始偏移量,field请求的字段
    // 确保fuzzyQuery被定义为一个空数组，如果没有传入则默认为空数组
    fuzzyQuery = fuzzyQuery || [];
    let queryStr = "";
    if (fuzzyQuery.length != 0) {
      for (let i = 0; i < fuzzyQuery.length; i++) {
        let v = fuzzyQuery[i];
        queryStr +=
          " and " + Object.keys(v) + " like '%" + v[Object.keys(v)] + "%'";
      }
    }
    if (artType == "") {
      queryStr = queryStr.replace(" and ", "");
    }
    const response = await http.$axios({
      url: "/mtv/api/getMtvInfo",
      method: "GET", //get请求对应 params  post请求的对应 data
      headers: {
        token: isLog,
      },
      params: {
        limit,
        offset:offset+1,
        field,
        artType,
        order,
        fuzzyQuery: queryStr, //模糊查询的条件 {area:"美国"} 或 {contentClass:"犯罪"}
      },
    });
    if (response.success) {
      return response;
    } else {
      Message.warning({
        message: "网络异常,请重试",
        duration: 1000,
        center: true,
        type: "warning",
      });
      return false;
    }
  },
};
