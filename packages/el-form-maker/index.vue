<script>
import FormLib from "element-ui/lib/form";
import { propMaps, pathMap } from "./shared/uitils.js";
import { FORM_MIX, ROW_MAP } from "./shared/constant.js";
import FormItemMaker from "./form-item-maker.vue";
import { Form, Row, Col } from "element-ui";
import get from 'lodash.get'
import set from 'lodash.set'
import cloneDeep from 'lodash.clonedeep'
import isObject from 'lodash.isobject'
import groupBy from 'lodash.groupby'


export default {
  name: "el-form-maker",
  // mixins:[FORM_MIX], // 这里的混入存在一些问题 methods 无法获取
  components: {
    "el-form": Form,
    "el-row": Row,
    "el-col": Col,
    "form-item-maker": FormItemMaker
  },
  props: Object.assign({}, FormLib.props, {
    options: {
      type: Array,
      required: true
    },
    rowMap: {
      type: Object,
      default: () => ({
        default: ROW_MAP
      })
    },
    value: Object,
    customForm: {
      type: Object,
      default: () => ({
        data: {},
        rules: {}
      }),
      validator: val => !!val.data && !!val.rules
    },
    isView: {
      type: Boolean,
      default: false
    },
    disabled: Boolean,
    other: Object
  }),
  watch: {
    options: {
      handler: function(data) {
        this.initModel(data, this.customForm.data);
      },
      immediate: true,
      deep: true
    },
    "customForm.data": {
      handler: function(data) {
        this.mergeModel(data);
      },
      deep: true,
      immediate: true
    },
    modelData: {
      handler: function(val) {
        this.$emit("input", val);
      },
      deep: true,
      immediate: true
    },
    value: {
      handler: function(val) {
        this.modelData = val;
      }
    }
  },
  computed: {
    propMaps() {
      return propMaps(this.content);
    }
  },
  data() {
    return {
      modelData: {},
      rowGroup: [],
      content: [],
      optionsEleMap: {},
      initVal: {}
    };
  },
  /**
   * @description: 主渲染函数:在render书写jsx，需要声明参数的属性props,on,attrs
   * @param {h:->$creatElement}
   * @return: dom
   */
  render(h) {
    // 插槽修正
    const slots = Object.keys(this.$slots)
      .reduce((arr, key) => {
        arr = arr.concat(this.$slots[key]);
        return arr;
      }, [])
      .map(vnode => {
        vnode.context = this._self;
        return vnode;
      });
    return h(
      "el-form",
      {
        props: Object.assign({}, this._props, {
          model: this.modelData,
          rules: this.customForm && this.customForm.rules
        }),
        ref: "elForm"
      },
      this.renderGroup(h, this.rowGroup).concat(slots)
    );
  },

  created() {
    // 初始化格式行分组数据
    this.content = cloneDeep(this.options);
    this.rowGroup = this.formateGroup(this.content, this.customForm);
    // 初始化model
    this.initModel(
      this.content,
      (this.customForm && this.customForm.data) || {}
    );
  },
  beforeMount() {
    this.initEleOption();
  },
  async mounted() {
    await this.$nextTick();
    // 同步Form中的methods
    Object.keys(Form.methods).forEach(key => {
      this[key] = this.$refs["elForm"][key];
    });

    this.resetFields = () => {
      this.$refs.elForm["resetFields"]();
      Object.keys(this.modelData).forEach(key => {
        if (Array.isArray(this.modelData[key])) {
          this.modelData[key] = this.modelData[key].filter(
            val => val !== undefined
          );
        } else {
          this.modelData[key] = this.initVal[key];
        }
      });
    };
  },
  methods: {
    /**
     * @description: 初始化model数据
     * @param {data:array->原始options}
     * @param {custom:object->外部自定义表单数据}
     * @return: model:object
     */
    initModel(data, custom) {
      const real = cloneDeep(data);
      this.modelData = real.reduce((cur, next) => {
        const { prop, type, defaultValue, props, isRender = true } = next;
        if (!isRender || !prop) return cur;
        cur[prop] =
          typeof props == "object" && !!props.value
            ? props.value
            : type && type.indexOf("checkbox-group") > -1
            ? defaultValue || []
            : defaultValue || "";

        return cur;
      }, cloneDeep(custom));
      this.updateForm(this.modelData); // inputFormat
      if (Object.keys(this.initVal).length == 0) {
        this.initVal = cloneDeep(this.modelData);
      }
      this.$emit("updated-model", this.modelData);
    },
    initEleOption() {
      this.optionsEleMap = this.content.reduce((con, item) => {
        con[item.prop] =
          item.type == "group"
            ? item.items.reduce((cur, next) => {
                cur[next.prop] = next.options || [];
                return cur;
              }, {})
            : item.options || [];
        return con;
      }, {});
    },
    mergeModel(val) {
      Object.assign(this.modelData, val);
    },
    renderGroup(h, data) {
      // 获取具名插槽的name
      const slotPropKey = Object.keys(this.$slots).reduce((cur, next) => {
        const [key, value] = next.split(":");
        key !== "default" && (cur[key] = value);
        return cur;
      }, {});

      const vnodeArr =
        data &&
        data.map(row => {
          const { rowId } = row[0] || {};
          const realId =
            (typeof rowId == "function" && rowId(this.modelData)) || rowId;
          const curItem = this.content.find(
            item =>
              realId ==
                (typeof item.rowId == "function" &&
                  item.rowId(this.modelData)) || item.rowId
          );

          return h(
            "el-row",
            {
              props: this.rowMap[realId] || this.rowMap["default"],
              curProp: curItem.prop || ""
            },
            row.map(col => this.renderCol(h, col))
          );
        });
      // 获取具名插槽当前的索引值
      const slotIndex = vnodeArr.findIndex(vnode => {
        const {
          data: { curProp }
        } = vnode;
        const slotName = `${curProp}:${slotPropKey[curProp]}`;
        return !!slotPropKey[curProp];
      });
      // 所匹配的第一个prop
      const rowFirstProp =
        (slotIndex > -1 && vnodeArr[slotIndex].data.curProp) || "";
      // 最终的slotName
      const slotName = `${rowFirstProp}:${slotPropKey[rowFirstProp]}`;
      // 如果prop存在 则对rows中的VNodes:[array] 进行插槽排序处理

      if (rowFirstProp) {
        vnodeArr.splice(slotIndex, 0, this.$slots[slotName]);
      }

      return vnodeArr;
    },
    renderCol(h, col) {
      const isRender =
        typeof col.isRender == "undefined" ||
        (typeof col.isRender == "function" && col.isRender(this.modelData)) ||
        (typeof col.isRender == "boolean" && !!col.isRender);
      return (
        isRender &&
        h("el-col", { props: col.col }, [
          h("form-item-maker", {
            props: {
              itemValue: this.modelData[col.prop],
              data: {
                ...col,
                options: this.optionsEleMap[col.prop]
              },
              formData: this.modelData,
              isView: this.isView,
              modelData: this.modelData,
              other: this.other,
              disabled: this.disabled
            },
            on: {
              updateModel: params => this.updateModel(params)
            }
          })
        ])
      );
    },
    formateGroup(data) {
      const rowGroups = groupBy(data, el => {
        const rowId =
          (typeof el.rowId == "function" && el.rowId(this.modelData)) ||
          el.rowId;
        return rowId;
      });
      return Object.values(rowGroups).reduce((cur, next, index) => {
        cur.push(next);
        return cur;
      }, []);
    },
    /**
     * @description: 格式化form数据
     * 1.fetchValue触发则调用outFormat
     * 2.updateForm触发则调用inputFormat
     * @param {form:object->表单数据}
     * @param {field:string->调用functionName}
     * @return: model:object
     */
    formateFormVal(form, field) {
      const maps = this.propMaps;
      // debugger
      return Object.keys(form).reduce((cur, key) => {
        const hasKey = key in this.modelData;
        const formatVal =
          hasKey && !!maps[key] && typeof maps[key][field] == "function"
            ? maps[key][field](form)
            : form[key];
        isObject(formatVal) && !Array.isArray(formatVal)
          ? (cur = Object.assign(cur, formatVal))
          : (cur[key] = formatVal);
        return cur;
      }, {});
    },
    updateModel({ prop, value }) {
      this.$set(this.modelData, prop, value);
    },
    fetchValue() {
      return this.formateFormVal(this.modelData, "outFormat");
    },
    updateForm(form) {
      const subForm = this.formateFormVal(form, "inputFormat");
      // 更新完之后，需要合并model，覆盖之前的
      this.mergeModel(subForm);
    },
    // setOption(prop, config) {
    //   const curIndex = this.content.findIndex(item => item.prop == prop);
    //   // 路径Map  {path:value}
    //   const map = pathMap(config);

    //   const target = cloneDeep(this.content[curIndex]); // array 改变 视图未更新  有待解决
    //   Object.keys(map).forEach(path => {
    //     set(target, path, map[path]);
    //   });
    //   this.content.splice(curIndex, 1, target);
    // },
    setOption(prop, options) {
      if (!prop || !Array.isArray(options)) return;
      set(this.optionsEleMap, prop, options);
    },
    // 是否禁用
    setDisabled(prop, value) {
      const curIndex = this.content.findIndex(item => item.prop == prop);
      this.$set(this.content[curIndex], "disabled", value);
    }
  }
};
</script>
