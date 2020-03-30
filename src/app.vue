<template>
  <div id="app">
    <div class="form-maker-demo1">
      <h2>el-form-maker-demo1</h2>
      <el-form-maker
        label-width="120px"
        :options="options"
        ref="formMaker"
        :customForm="customForm"
      ></el-form-maker>
      <el-button @click="handlValidte">触发校验</el-button>
      <p>form:{{formData}}</p>
      <p>valid:{{valid}}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      formData: {},
      valid: false,
      customForm: {
        data: {
          custom: 1
        },
        rules: {
          custom: [
            {
              validator: (rule, value, callback) => {
                debugger;
              },
              trigger: "blur"
            },
            {
              required: true,
              messsage: "不能为空",
              trigger: "blur"
            }
          ]
        }
      },
      options: [
        {
          rowId: 1,
          type: "input",
          prop: "a",
          label: "领券活动名称",
          rules:[
            {
              required:true,
              messsage:'不能为空',
              trigger:'blur'
            }
          ]
          // outFormat:row=>{a:1},
          // inputFormat:row=>{cccc:1}
        },
        {
          rowId: 1,
          type: "select",
          prop: "b",
          label: "领券方式",
          attrs: {
            width: "100%"
          },
          defaultValue: "1",
          options: [{ label: "选项1", value: "1" }]
        },
        {
          rowId: 1,
          type: "checkbox-group",
          prop: "c",
          label: "活动时间",
          // outFormat: row => {
          //   return {aaa:{a:11}}
          // },
          inputFormat: row => [1, 2],
          options: [
            {
              label: "选项1",
              value: 1
            },
            {
              label: "选项2",
              value: 2
            },
            {
              label: "选项3",
              value: 3
            }
          ]
        },
        {
          rowId: 2,
          type: "date-picker",
          prop: "e",
          label: "活动对象12",
          attrs: {
            width: "100%"
          },
          col: {
            span: 8
          }
        },
        {
          rowId: 2,
          type: "radio-group",
          prop: "d",
          label: "活动对象",
          options: [
            {
              label: "单选1",
              value: "1"
            },
            {
              label: "单选2",
              value: "2"
            }
          ],
          col: {
            span: 8
          }
        },

        {
          rowId: 2,
          type: "input",
          prop: "f",
          label: "活动对象",
          col: {
            span: 8
          }
        }
      ]
    };
  },
  methods: {
    handlValidte() {
      this.$refs.formMaker.validate(valid => {
        this.valid = valid;
        this.formData = this.$refs.formMaker.fetchValue();
      });
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
