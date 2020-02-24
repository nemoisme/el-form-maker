<script>
import Form from 'element-ui/lib/form'
import {groupBy, cloneDeep, set, get, isObject, isArray} from 'loadsh'
import {propMaps, pathMap} from './shared/uitils'
import {FORM_MIX, ROW_MAP} from './shared/constant'

export default {
  name: 'el-form-maker',
  // mixins:[FORM_MIX], // 这里的混入存在一些问题 methods 无法获取
  components: {
    'form-item-maker': () => import('./form-item-maker')
  },
  props: Object.assign({}, Form.props, {
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
        this.initModel(data, this.customForm.data)
      },
      immediate: true,
      deep: true
    },
    'customForm.data': {
      handler: function(data) {
        this.mergeModel(data)
      },
      deep: true,
      immediate: true
    },
    modelData: {
      handler: function(val) {
        this.$emit('input', val)
      },
      deep: true,
      immediate: true
    },
    value: {
      handler: function(val) {
        this.modelData = val
      }
    }
  },
  computed: {
    propMaps() {
      return propMaps(this.content)
    }
  },
  data() {
    return {
      modelData: {},
      rowGroup: [],
      content: []
    }
  },
  /**
   * @description: 主渲染函数:在render书写jsx，需要声明参数的属性props,on,attrs
   * @param {h:->$creatElement}
   * @return: dom
   */
  render(h) {
    return (
      <el-form
        {...{
          props: Object.assign({}, this._props, {
            model: this.modelData,
            rules: this.customForm && this.customForm.rules
          })
        }}
        ref="elForm"
      >
        {this.renderGroup(h, this.rowGroup).concat(this.$slots.default)}
      </el-form>
    )
  },

  created() {
    // 初始化格式行分组数据
    this.content = cloneDeep(this.options)
    this.rowGroup = this.formateGroup(this.content, this.customForm)
    // 初始化model
    this.initModel(
      this.content,
      (this.customForm && this.customForm.data) || {}
    )
  },
  async mounted() {
    await this.$nextTick()
    // 同步Form中的methods
    Object.keys(Form.methods).forEach(key => {
      this[key] = this.$refs['elForm'][key]
    })
  },
  methods: {
    /**
     * @description: 初始化model数据
     * @param {data:array->原始options}
     * @param {custom:object->外部自定义表单数据}
     * @return: model:object
     */
    initModel(data, custom) {
      const real = cloneDeep(data)
      this.modelData = real.reduce((cur, next) => {
        const {prop, type, defaultValue, props, isRender = true} = next
        if (!isRender) return cur
        cur[prop] =
          typeof props == 'object' && !!props.value
            ? props.value
            : type && type.indexOf('checkbox-group') > -1
            ? []
            : defaultValue || ''
        return cur
      }, cloneDeep(custom))
      this.$emit('updated-model', this.modelData)
    },
    mergeModel(val) {
      this.modelData = Object.assign({}, this.modelData, val)
    },
    renderGroup(h, data) {
      // 获取具名插槽的name
      const slotPropKey = Object.keys(this.$slots).reduce((cur, next) => {
        const [key, value] = next.split(':')
        key !== 'default' && (cur[key] = value)
        return cur
      }, {})

      const vnodeArr =
        data &&
        data.map(row => {
          const {rowId} = row[0] || ''
          const curItem = this.content.find(item => rowId == item.rowId)
          return (
            <el-row
              {...{
                props: this.rowMap[rowId] || this.rowMap['default'],
                curProp: curItem.prop || ''
              }}
            >
              {row.map(col => {
                const isRender =
                  typeof col.isRender == 'undefined' ||
                  (typeof col.isRender == 'boolean' && !!col.isRender)
                return (
                  isRender && (
                    <el-col {...{props: col.col}}>
                      <form-item-maker
                        {...{
                          props: {
                            itemValue: this.modelData[col.prop],
                            data: col,
                            formData: this.modelData,
                            isView: this.isView,
                            modelData: this.modelData,
                            other: this.other,
                            disabled: this.disabled
                          },
                          on: {
                            updateModel: params => this.updateModel(params)
                          }
                        }}
                      />
                    </el-col>
                  )
                )
              })}
            </el-row>
          )
        })
      // 获取具名插槽当前的索引值
      const slotIndex = vnodeArr.findIndex(vnode => {
        const {
          data: {curProp}
        } = vnode
        const slotName = `${curProp}:${slotPropKey[curProp]}`
        return !!slotPropKey[curProp]
      })
      // 所匹配的第一个prop
      const rowFirstProp =
        (slotIndex > -1 && vnodeArr[slotIndex].data.curProp) || ''
      // 最终的slotName
      const slotName = `${rowFirstProp}:${slotPropKey[rowFirstProp]}`
      // 如果prop存在 则对rows中的VNodes:[array] 进行插槽排序处理
      if (rowFirstProp) {
        vnodeArr.splice(slotIndex, 0, this.$slots[slotName])
      }

      return vnodeArr
    },
    formateGroup(data) {
      const rowGroups = groupBy(data, 'rowId')
      return Object.values(rowGroups).reduce((cur, next, index) => {
        cur.push(next)
        return cur
      }, [])
    },
    /**
     * @description: 格式化form数据
     * 1.fetchValue触发则调用outFormat
     * 2.updateForm触发则调用inputFormat
     * @param {form:object->表单数据}
     * @param {field:string->调用functionName}
     * @return: model:object
     */
    innerFormate(form, field) {
      const maps = this.propMaps
      return Object.keys(form).reduce((cur, key) => {
        const hasKey = this.modelData.hasOwnProperty(key)
        const value =
          hasKey && !!maps[key] && typeof maps[key][field] == 'function'
            ? maps[key][field](form)
            : form[key]
        if (isObject(value) && field == 'outFormat') {
          cur = Object.assign(cur, value)
        } else {
          cur[key] = value
        }
        return cur
      }, {})
    },
    updateModel({prop, value}) {
      this.$set(this.modelData, prop, value)
    },
    fetchValue() {
      return this.innerFormate(this.modelData, 'outFormat')
    },
    updateForm(form) {
      const subForm = this.innerFormate(form, 'inputFormat')
      // 更新完之后，需要合并model，覆盖之前的
      this.mergeModel(subForm)
    },
    setOption(prop, config) {
      const curIndex = this.content.findIndex(item => item.prop == prop)
      // 路径Map  {path:value}
      const map = pathMap(config)

      const target = cloneDeep(this.content[curIndex]) // array 改变 视图未更新  有待解决
      Object.keys(map).forEach(path => {
        set(target, path, map[path])
      })
      this.content.splice(curIndex, 1, target)
    },
    // 是否禁用
    setDisabled(prop, value) {
      const curIndex = this.content.findIndex(item => item.prop == prop)
      this.$set(this.content[curIndex], 'disabled', value)
    }
  }
}
</script>
