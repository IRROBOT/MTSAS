export default {
  debounce(func, wait) {
    //防抖函数,事件多次触发后，规定时间内没有被触发，才执行程序。func 为需防抖的函数,wait是等待秒数
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  },
  throttle(func, limit) {
    //节流函数，规定在一定时间内只触发一次
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  },
  //生成时间字符串
  getInsertTime() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    // 确保月份、日期、小时、分钟和秒钟都是两位数
    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return (
      year +
      "-" +
      month +
      "-" +
      day +
      " " +
      hours +
      ":" +
      minutes +
      ":" +
      seconds
    );
  },
  //比较两个数组，生成待删数组
  generateDeleteArr(oldArr, newArr) {
    let deleteArr = [];
    oldArr.forEach((v) => {
      if (!newArr.includes(v)) {
        deleteArr.push(v);
      }
    });
    return deleteArr;
  },
  //判断字符串是否为base64格式图片
  isBase64Image(str) {
    // 检查是否有data:image/前缀
    if (!str.startsWith("data:image/")) {
      return false;
    }
    // 提取Base64编码部分
    const base64Start = str.indexOf("base64,") + 7;
    const base64 = str.substring(base64Start);
    // 判断是否为有效的Base64编码
    try {
      const decoded = atob(base64);
      return decoded.length > 0; // 如果解码后长度为0，说明是无效的Base64编码
    } catch (e) {
      return false; // 如果解码时抛出异常，说明不是有效的Base64编码
    }
  },
  replaceImgSrc(str, replacements) {
    let index = 0;
    return str.replace(/#image\$!\*placeholder#/g, function () {
      return replacements[index++];
    });
  },
};
