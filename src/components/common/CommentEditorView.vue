<template>
  <div class="comment-editor-wrapper">
    <el-dialog
      title="写影评"
      ref="MTV_Dialog"
      :visible.sync="CommentEditor"
      width="1500px"
      @close="controllDialog(false)"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="ruleForm" :rules="rules" status-icon ref="ruleForm">
        <el-form-item prop="title">
          <el-input placeholder="请输入标题" v-model="ruleForm.title" clearable>
          </el-input>
        </el-form-item>
      </el-form>
      <quill-editor
        v-model="content"
        ref="editorRef"
        :options="editorOption"
        @ready="onEditorReady($event)"
        @change="onEditorChange($event)"
      >
      </quill-editor>
      <el-upload
        action="#"
        class="upload-file-el"
        :auto-upload="false"
        :before-upload="beforeUp"
        multiple
        :show-file-list="false"
        :on-change="changeUp"
      >
      </el-upload>
      <div class="publish-btn">
        <el-button type="primary" @click="publishComment('ruleForm')"
          >发布<i class="icon iconfont icon-fabu"></i
        ></el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { quillEditor, Quill } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { ImageDrop } from "quill-image-drop-module";
import ImageResize from "quill-image-resize-module";
Quill.register("modules/imageDrop", ImageDrop);
Quill.register("modules/imageResize", ImageResize);
const fontSizeStyle = Quill.import("attributors/style/size"); // 引入这个后会把样式写在style上
fontSizeStyle.whitelist = [
  "",
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
];
Quill.register(fontSizeStyle, true);
const Font = Quill.import("attributors/style/font"); // 引入这个后会把样式写在style上
const fonts = ["", "SimSun", "SimHei", "Microsoft-YaHei", "KaiTi", "FangSong"];
Font.whitelist = fonts; // 将字体加入到白名单
Quill.register(Font, true);
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线 -----['bold', 'italic', 'underline', 'strike']
  ["blockquote", "code-block"], // 引用  代码块-----['blockquote', 'code-block']
  [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表-----[{ list: 'ordered' }, { list: 'bullet' }]
  [{ header: 1 }, { header: 2 }],
  [{ script: "sub" }, { script: "super" }], // 上标/下标-----[{ script: 'sub' }, { script: 'super' }]
  [{ indent: "-1" }, { indent: "+1" }],
  [{ size: fontSizeStyle.whitelist }], // 配置字号
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题-----[{ header: [1, 2, 3, 4, 5, 6, false] }]
  [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色-----[{ color: [] }, { background: [] }]
  [{ font: fonts }], //显示字体选择
  [{ align: [] }], // 对齐方式-----[{ align: [] }]
  ["clean"], // 清除文本格式-----['clean']
  ["link", "image"], // 链接、图片、视频-----['link', 'image', 'video']
];
const titleConfig = [
  { Choice: ".ql-bold", title: "〖 加粗 〗" },
  { Choice: ".ql-italic", title: "〖 斜体 〗" },
  { Choice: ".ql-underline", title: "〖 下划线 〗" },
  { Choice: ".ql-header", title: "〖 段落格式 〗" },
  { Choice: ".ql-strike", title: "〖 删除线 〗" },
  { Choice: ".ql-blockquote", title: "〖 块引用 〗" },
  { Choice: ".ql-code-block", title: "〖 代码块 〗" },
  { Choice: ".ql-size", title: "〖 字号 〗" },
  { Choice: ".ql-font", title: "〖 字体 〗" },
  { Choice: '.ql-list[value="ordered"]', title: "〖 编号列表  〗" },
  { Choice: '.ql-list[value="bullet"]', title: "〖 项目列表 〗" },
  { Choice: ".ql-direction", title: "〖 文本方向 〗" },
  { Choice: '.ql-header[value="1"]', title: "〖 h1 〗" },
  { Choice: '.ql-header[value="2"]', title: "〖 h2 〗" },
  { Choice: ".ql-color", title: "〖 字体颜色 〗" },
  { Choice: ".ql-background", title: "〖 背景颜色 〗" },
  { Choice: ".ql-image", title: "〖 图像 〗" },
  { Choice: ".ql-link", title: "〖 添加链接 〗" },
  { Choice: ".ql-formula", title: "〖 插入公式 〗" },
  { Choice: ".ql-clean", title: "〖 清除字体格式 〗" },
  { Choice: '.ql-script[value="sub"]', title: "〖 下标 〗" },
  { Choice: '.ql-script[value="super"]', title: "〖 上标 〗" },
  { Choice: '.ql-indent[value="-1"]', title: "〖 向左缩进 〗" },
  { Choice: '.ql-indent[value="+1"]', title: "〖 向右缩进 〗" },
  { Choice: ".ql-header .ql-picker-label", title: "〖 标题大小 〗" },
  { Choice: ".ql-header .ql-picker-item:last-child", title: "标准" },
  { Choice: ".ql-size .ql-picker-item:nth-child(2)", title: "标准" },
  { Choice: ".ql-align", title: "〖 对齐方式 〗" },
  { Choice: ".ql-align .ql-picker-item:first-child", title: "〖 居左对齐 〗" },
  {
    Choice: '.ql-align .ql-picker-item[data-value="center"]',
    title: "〖 居中对齐 〗",
  },
  {
    Choice: '.ql-align .ql-picker-item[data-value="right"]',
    title: "〖 居右对齐 〗",
  },
  {
    Choice: '.ql-align .ql-picker-item[data-value="justify"]',
    title: "〖 两端对齐 〗",
  },
];
import common from "@/assets/js/common.js";
import http from "@/common/api/request.js";
export default {
  components: {
    quillEditor,
  },
  data() {
    //自定义验证规则
    var checkTitle = (rule, value, callback) => {
      const regex = /[\s~`!@#$%^&*()\\-_=+[\]{}|;:'",<.>/?]/;
      const result = regex.test(value);
      if (result) {
        callback(new Error("标题包含特殊字符"));
      } else {
        callback();
      }
    };
    return {
      CommentEditor: false, //默认评论编辑弹窗是关闭的
      content: "",
      text: "", //评论纯文本内容
      editorOption: {
        placeholder: "请输入内容",
        theme: "snow",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: function (value) {
                if (value) {
                  // 调用element的图片上传组件
                  document.querySelector(".upload-file-el input").click();
                } else {
                  this.quill.format("image", false);
                }
              },
            },
          },
          imageResize: {
            modules: ["Resize", "DisplaySize", "Toolbar"],
          },
          imageDrop: true, //图片拖拽
        },
      },
      ruleForm: {
        title: "",
      },
      rules: {
        title: [
          { required: true, message: "请输入标题名称", trigger: "blur" },
          {
            type: "string",
            validator: checkTitle,
            trigger: "blur",
            message: "标题包含特殊字符",
          },
        ],
      },
      fileObj: [],
      upImgUrl: [],
      newUpImgUrl: [],
      mid: 0,
      oldContent: "",
      publishType: true, //默认是发布新内容
      cid: 0,
      quill: null,
    };
  },
  created() {
    this.mid = this.$route.params.mid;
  },
  mounted() {},
  computed: {
    editor() {
      return this.$refs.editorRef.quill;
    },
  },
  methods: {
    //给工具栏加文字提示
    initTitle() {
      for (let item of titleConfig) {
        let tip = document.querySelector(".quill-editor " + item.Choice);
        if (!tip) continue;
        tip.setAttribute("title", item.title);
      }
    },
    //控制评论编辑弹窗
    controllDialog(val) {
      this.CommentEditor = val;
    },
    //初始化评论编辑器
    initialEditor(cid) {
      this.cid = cid;
      // 获取评论部分信息
      http
        .$axios({
          url: "/mtv/api/getCommentInfo",
          method: "GET", //get请求对应 params  post请求的对应 data
          headers: {
            token: true,
          },
          params: {
            cid,
          },
        })
        .then((res) => {
          if (res.success) {
            this.ruleForm.title = res.data.title;
            this.oldContent = res.data.commentInfo;
            this.publishType = false; //默认发布新内容变为编辑新内容
            this.CommentEditor = true;
          } else {
            this.$message.error(res.data);
          }
        });
    },
    //发布内容
    publishComment(formName) {
      this.$refs[formName].validate((valid) => {
        let content = this.editor.root.innerHTML; //从根节点那里拿到最新数据
        if (valid && content.trim().length > 0) {
          let title = this.ruleForm.title;
          //先匹配最终富文本中的图片链接
          let new_img_arr = this.matchImg(content);

          //最终需要发送给后端的文件对象
          let pureArr = this.compareUrlArr(new_img_arr);

          //需要进一步处理content,将img给替换掉
          let holder = "#image$!*placeholder#";
          content = content.replace(
            /<img[^>]*src="[^"]*"/g,
            `<img src="${holder}"`
          );
          let richContent = { title, text: this.text, content };
          //向后端发送请求,将文件对象上传至服务器
          if (this.publishType) {
            //首次发布
            http
              .$axios({
                url: "/mtv/api/upRichContent",
                method: "POST", //get请求对应 params  post请求的对应 data
                headers: {
                  token: true,
                  "Content-Type": "multipart/form-data", //支付请求必带参数
                },
                data: {
                  mid: this.mid,
                  url: global.env.SERVER_BASE,
                  richContent,
                  file: pureArr,
                },
              })
              .then((res) => {
                if (res.success) {
                  this.$message.success("发布成功");
                  //关闭窗口
                  this.CommentEditor = false;
                  location.reload();
                  //跳转到影评页
                } else {
                  this.$message.error(res.data);
                }
              });
          } else {
            //编辑后的内容
            //将newImgArr中的base64替换成imageUrls中的内容
            for (let i = 0; i < new_img_arr.length; i++) {
              //判断这个链接是否为base64编码图
              let flag = common.isBase64Image(new_img_arr[i]);
              if (flag) {
                //如果是那就把imageUrls中的链接放到newImgArr中
                new_img_arr[i] = "MTSAS影界指南";
              }
            }
            //先将未编辑的内容中的img得src获取到
            let old_img_arr = this.matchImg(this.oldContent); //初始化时的富文本
            //图片有变化,检查图片的异同的待删数组，删除不需要的图片
            let deleteImgArr = common.generateDeleteArr(
              old_img_arr,
              new_img_arr
            );
            http
              .$axios({
                url: "/mtv/api/editRichContent",
                method: "POST", //get请求对应 params  post请求的对应 data
                headers: {
                  token: true,
                  "Content-Type": "multipart/form-data", //支付请求必带参数
                },
                data: {
                  cid: this.cid,
                  url: global.env.SERVER_BASE,
                  newImg: new_img_arr,
                  deleteImg: deleteImgArr,
                  richContent,
                  file: pureArr, //新增需要上传的图片文件，也有可能是空数组
                },
              })
              .then((res) => {
                if (res.success) {
                  this.$message.success("修改成功");
                  //关闭窗口
                  this.CommentEditor = false;
                  this.publishType = true;
                  //刷新页面
                  location.reload();
                } else {
                  this.$message.error("发布失败,请检查网络");
                }
              });
          }
        }
      });
    },
    //匹配富文本中的图片
    matchImg(content) {
      // 定义一个空数组来存储匹配到的src值
      let srcArray = [];
      // 使用正则表达式匹配img标签的src属性
      let match = content.match(/<img[^>]+src="([^"]+)"/g);
      // 如果匹配到了结果
      if (match) {
        // 将匹配到的src值放入数组中
        match.forEach(function (value) {
          srcArray.push(value.match(/src="([^"]+)"/)[1]);
        });
      }
      // 输出结果数组
      return srcArray;
    },
    imgbase(file) {
      // new 一个Promise实例
      return new Promise((resolve) => {
        // 对文件对象的处理
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          resolve(this.result);
        };
      });
    },
    //删除指定下标
    removeItemsByIndex(arr, indexes) {
      return arr.filter((_, index) => !indexes.includes(index.v));
    },
    compareUrlArr(arr2) {
      //分两种情况
      let arr1 = this.upImgUrl;
      // let arr2 = [...new Set(this.newUpImgUrl)]; //数组去重
      //1.用户没有上传图片
      if (arr1.length == 0) {
        //用户没有插入任何图片,图片位置发生改变了
        return [];
      }
      //2.用户上传了图片
      let index = this.findDifference(arr1, arr2);
      //arr1和this.fileObj是同步放入的,所以只要找到在arr1中不在arr2中的下标,就说明是删除的
      //所以this.fileObj就同步删除数组中对应下标的元素，就能拿到最终的文件对象
      let newArr = this.removeItemsByIndex(this.fileObj, index);
      //待上传的文件排序
      let arr = this.sortFileArr(arr1, arr2, newArr);
      return arr;
    },
    //给文件数组排序
    sortFileArr(arr1, arr2, newArr) {
      let tmp = [],
        tmp2 = [];
      arr1.forEach((e) => {
        tmp2.push(e.v);
      });
      arr2.forEach((v) => {
        let index = tmp2.indexOf(v);
        if (index != -1) {
          tmp.push(newArr[index].v);
        }
      });
      return tmp;
    },
    findDifference(arr1, arr2) {
      const result = [];
      // 创建一个包含 arr2 中所有元素的集合
      const set2 = new Set(arr2);
      for (let i = 0; i < arr1.length; i++) {
        if (!set2.has(arr1[i].v)) {
          result.push(arr1[i].k);
        }
      }
      return result;
    },
    //插入一张图片
    async changeUp(file, fileList) {
      fileList.length = 0;
      this.tmpImg = await this.imgbase(file.raw); //转换为base64格式以便预览
      let quill = this.$refs.editorRef.quill;
      let length = quill.getSelection().index;
      // 插入图片
      quill.insertEmbed(length, "image", this.tmpImg);
      // 调整光标到最后
      quill.setSelection(length + 1);
      let len = this.upImgUrl.length - 1 < 0 ? 0 : this.upImgUrl.length - 1;

      this.upImgUrl.push({ k: len, v: this.tmpImg }); //放入一张图片的base64编码
      this.fileObj.push({ k: len, v: file.raw });
    },
    beforeUp(file) {
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isLt2M;
    },
    /***富文本***/
    onEditorReady(e) {
      // 注意：确保this.oldContent是安全的，以防止XSS攻击。
      this.initTitle();

      e.root.innerHTML = this.oldContent;
    },
    onEditorChange(e) {
      //内容改变事件
      this.text = e.text;
    },
    /**********/
  },
};
</script>
<style scoped lang="scss">
::v-deep .el-input {
  font-size: 20px !important;
  input {
    text-align: center;
  }
}

.upload-file-el {
  display: none;
}
::v-deep .ql-toolbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  position: sticky;
  position: -webkit-sticky;
  background-color: #c7dfff;
  top: 0;
  z-index: 100;
}
::v-deep .ql-snow {
  .ql-tooltip[data-mode="link"]::before {
    content: "请输入链接地址:";
  }
  .ql-tooltip.ql-editing a.ql-action::after {
    border-right: 0px;
    content: "保存";
    padding-right: 0px;
  }
  .ql-picker.ql-size {
    .ql-picker-label::before,
    .ql-picker-item::before {
      content: "字号";
    }
    .ql-picker-label[data-value="12px"]::before,
    .ql-picker-item[data-value="12px"]::before {
      content: "12px";
    }
    .ql-picker-label[data-value="14px"]::before,
    .ql-picker-item[data-value="14px"]::before {
      content: "14px";
    }
    .ql-picker-label[data-value="16px"]::before,
    .ql-picker-item[data-value="16px"]::before {
      content: "16px";
    }
    .ql-picker-label[data-value="18px"]::before,
    .ql-picker-item[data-value="18px"]::before {
      content: "18px";
    }
    .ql-picker-label[data-value="20px"]::before,
    .ql-picker-item[data-value="20px"]::before {
      content: "20px";
    }
    .ql-picker-label[data-value="24px"]::before,
    .ql-picker-item[data-value="24px"]::before {
      content: "24px";
    }
    .ql-picker-label[data-value="28px"]::before,
    .ql-picker-item[data-value="28px"]::before {
      content: "28px";
    }
    .ql-picker-label[data-value="32px"]::before,
    .ql-picker-item[data-value="32px"]::before {
      content: "32px";
    }
    .ql-picker-label[data-value="36px"]::before,
    .ql-picker-item[data-value="36px"]::before {
      content: "36px";
    }
  }
  .ql-picker.ql-header {
    .ql-picker-label::before,
    .ql-picker-item::before {
      content: "标题";
    }
    .ql-picker-label[data-value="1"]::before,
    .ql-picker-item[data-value="1"]::before {
      content: "标题1";
    }
    .ql-picker-label[data-value="2"]::before,
    .ql-picker-item[data-value="2"]::before {
      content: "标题2";
    }
    .ql-picker-label[data-value="3"]::before,
    .ql-picker-item[data-value="3"]::before {
      content: "标题3";
    }
    .ql-picker-label[data-value="4"]::before,
    .ql-picker-item[data-value="4"]::before {
      content: "标题4";
    }
    .ql-picker-label[data-value="5"]::before,
    .ql-picker-item[data-value="5"]::before {
      content: "标题5";
    }
    .ql-picker-label[data-value="6"]::before,
    .ql-picker-item[data-value="6"]::before {
      content: "标题6";
    }
  }
  .ql-picker.ql-font {
    .ql-picker-label::before,
    .ql-picker-item::before {
      content: "字体";
    }
    .ql-picker-label[data-value="SimSun"]::before,
    .ql-picker-item[data-value="SimSun"]::before {
      content: "宋体";
      font-family: "SimSun" !important;
    }
    .ql-picker-label[data-value="SimHei"]::before,
    .ql-picker-item[data-value="SimHei"]::before {
      content: "黑体";
      font-family: "SimHei";
    }
    .ql-picker-label[data-value="Microsoft-YaHei"]::before,
    .ql-picker-item[data-value="Microsoft-YaHei"]::before {
      content: "微软雅黑";
      font-family: "Microsoft YaHei";
    }
    .ql-picker-label[data-value="KaiTi"]::before,
    .ql-picker-item[data-value="KaiTi"]::before {
      content: "楷体";
      font-family: "KaiTi" !important;
    }
    .ql-picker-label[data-value="FangSong"]::before,
    .ql-picker-item[data-value="FangSong"]::before {
      content: "仿宋";
      font-family: "FangSong";
    }
  }
}
.ql-align-center {
  text-align: center;
}
.ql-align-right {
  text-align: right;
}
.ql-align-left {
  text-align: left;
}

.comment-editor-wrapper {
  ::v-deep .el-dialog {
    width: 100%;
  }
}
::v-deep .el-input__inner {
  color: black;
}
.publish-btn {
  width: 150px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  margin-top: 30px;
  ::v-deep .el-button {
    font-size: 23px;
    flex: 1;
    i {
      font-size: 23px;
    }
  }
}
</style>
