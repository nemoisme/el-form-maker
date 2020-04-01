<template>
  <div class="form-maker-demo1">
    <h2>el-form-maker-demo1</h2>
    <el-form-maker label-width="120px" :options="options" ref="formMaker" :customForm="customForm"></el-form-maker>
    <el-button @click="handlValidte">触发校验</el-button>
    <p>form:{{formData}}</p>
    <p>valid:{{valid}}</p>
  </div>
</template>
<script>
export default {
  name: "form-maker-demo1",
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
          label: "表单1",
          // outFormat:row=>{a:1},
          // inputFormat:row=>{cccc:1}
        },
        {
          rowId: 1,
          type: "select",
          prop: "b",
          label: "表单2",
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
          label: "表单3",
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
          label: "表单4",
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
          label: "表单5",
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
          label: "表单6",
          col: {
            span: 8
          }
        }
      ]
    };
  }
};
</script>
<style>
.form-maker-demo1 {
  width: 80%;
  margin: 50px auto;
}
</style>



    