<script>
import mixinsOptions from "./shared/mixinsOptions.js";
import { toCamelCase } from "./shared/uitils.js";
import { FormItem } from "element-ui";
export default {
  name: "form-item-maker",
  components: {
    "el-form-item": FormItem
  },
  mixins: [mixinsOptions],
  props: {
    data: Object,
    itemValue: [String, Number, Object, Array, Boolean],
    isView: Boolean,
    modelData: Object,
    other: Object,
    disabled: Boolean
  },
  render(h) {
    const { prop, rules, label, labelSlot } = this.data;
    const isLabelSlot = typeof labelSlot == "function";
    const labelNode = (isLabelSlot && labelSlot()) || null;
    return h(
      "el-form-item",
      {
        ref: "elFormItem",
        props: Object.assign({}, this.data, {
          prop,
          rules,
          label:
            (typeof label == "function" && label(this.modelData, this.other)) ||
            label
        })
      },
      [this.renderEle(h, this.data, this.itemValue)].concat(
        isLabelSlot
          ? h("span", { ...labelNode.data, slot: "label" }, labelNode.children)
          : null
      )
    );
  },
  async mounted() {
    await this.$nextTick();
  },
  methods: {
    renderEle(h, data, value) {
      const element =
        (typeof data.component == "function" &&
          data.component(this.modelData)) ||
        (typeof data.component == "object" && data.component) ||
        (this.isView && "div") ||
        (data.type && "el-".concat(data.type)) ||
        null;
      const options =
        typeof data.options == "function" ? data.options(data) : data.options;
      // 判断type渲染的表单元素的childVnode 一般指代slotVnode
      const ischildRender =
        data.childRender && typeof data.childRender == "function";
      const mainNode =
        !!element && !data.render
          ? h(
              typeof data.show == "function" && data.show(this.modelData)
                ? element
                : typeof data.show == "undefined" && element,
              {
                props: Object.assign({}, data.props, data.attrs, {
                  value,
                  disabled:
                    typeof data.props == "object" && disabled in data.props
                      ? data.props.disabled
                      : data.disabled || this.disabled
                }),
                attrs: data.attrs || {},
                style: data.attrs || {},
                on: {
                  input: val => {
                    this.updateModel({ prop: data.prop, value: val });
                    // 自定义组件校验触发方式
                    if (data.component && typeof data.component == "object") {
                      const { validateField } = this.$parent.$parent.$parent;
                      validateField(data.prop);
                    }

                    if (typeof data.atChange == "function") {
                      data.atChange(
                        {
                          prop: data.prop,
                          data: this.modelData,
                          other: this.other
                        },
                        val
                      );
                    }
                  },
                  change: val => {
                    // 对string类型做
                    const trimValue = typeof val == "string" ? val.trim() : val;
                    this.updateModel({ prop: data.prop, value: trimValue });
                    if (typeof data.atSubChange == "function") {
                      data.atSubChange(
                        {
                          prop: data.prop,
                          data: this.modelData,
                          other: this.other
                        },
                        trimValue
                      );
                    }
                  },
                  ...data.on
                }
              },
              [
                this.isView
                  ? (typeof data.formatter == "function" &&
                      data.formatter(this.modelData)) ||
                    this.modelData[data.prop]
                  : ischildRender
                  ? data.childRender(h, data, this.modelData)
                  : this.renderOps(data.type, options)
              ]
            )
          : typeof data.render == "function" &&
            data.render(h, data, this.modelData, this.other);

      const suffix =
        (typeof data.suffixNode == "function" &&
          data.suffixNode(h, this.modelData, this.other)) ||
        null;
      const pre =
        (typeof data.preNode == "function" &&
          data.preNode(h, this.modelData, this.other)) ||
        null;
      return h("span", [pre, mainNode, suffix]);
    },
    updateModel({ prop, value }) {
      this.$emit("updateModel", { prop, value });
    },
    renderOps(type, options) {
      const optRenderer = type && this[`${toCamelCase(type)}_opt`];
      if (typeof optRenderer === "function" && Array.isArray(options)) {
        return options.map(optRenderer);
      }
    }
  }
};
</script>
