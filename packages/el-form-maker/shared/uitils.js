import get from 'lodash.get'
import isObject from 'lodash.isobject'
/**
 * 转换为大小驼峰命名
 * abc-efg => abcEfg
 */
export const toCamelCase = str => {
  return str.indexOf('-') !== -1
    ? str.replace(/-([a-zA-Z])/g, ($0, $1) => $1.toUpperCase())
    : str
}
/**
 * @description: 通过prop映射每个配置项
 * @param {data:arry->原始配置项数组}
 * @return: object->{prop:string:value:any}
 */
export const propMaps = data => {
  return data.reduce((cur, next) => {
    const {prop} = next
    cur[prop] = next
    return cur
  }, {})
}
/**
 * @description:
 * @param {type}
 * @return:
 */
export const findKeyPath = obj => {
  return Object.keys(obj).reduce((cur, key, index) => {
    const isObj = isObject(obj[key])
    if (!isObj) {
      cur.push(key)
    } else {
      const strsPath = findKeyPath(obj[key])
      cur.push(key + '.' + strsPath)
    }
    return cur
  }, [])
}

/**
 * @description: 获取obj下所有的key路径映射其对应的value
 * @param {obj}
 * @return: arry:所有的路径数组
 */
export const pathMap = obj => {
  const pathAll = findKeyPath(obj)
  return pathAll.reduce((cur, path) => {
    cur[path] = get(obj, path)
    return cur
  }, {})
}
