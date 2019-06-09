import utils from './utils'

export default {

  /** social media */

  // 用户名
  username (options) {
    options = Object.assign({ min: 4, max: 16 }, options)
    return new RegExp(`^[a-zA-Z][a-zA-Z0-9_-]{${options.min - 1},${options.max - 1}}$`)
  },
  // 中文用户名
  username_cn (options) {
    options = Object.assign({ min: 2, max: 8 }, options)
    return new RegExp(`^[a-zA-Z\\u4E00-\\u9FA5][a-zA-Z0-9\\u4E00-\\u9FA5_-]{${options.min - 1},${options.max - 1}}$`)
  },
  // 邮箱
  email () {
    return new RegExp(`^([A-Za-z0-9_\\-\\.])+\\@([A-Za-z0-9_\\-\\.])+\\.([A-Za-z]{2,6})$`)
  },
  // 常用邮箱
  email_general () {
    return new RegExp(`^([A-Za-z0-9_\\-\\.])+\\@(${utils.regex.email.whiteLists.join('|')})$`)
  },
  // 手机号码
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,
  // 身份证
  idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  // URL
  url: options => /^((https?|ftp|file):\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/.test(options.value) || '不是正确的URL',

  /** number */

  // 整数
  interger (options) {
    options = Object.assign({ area: 'both' }, options)
    return new RegExp(`^${utils.regex.number.areaLabelReflex[options.area]}\\d+$`)
  },
  // 浮点数
  float (options) {
    options = Object.assign({ area: 'both', count: '*' }, options)
    return new RegExp(`^${utils.regex.number.areaLabelReflex[options.area]}\\d*\\.\\d${utils.regex.count(options.count)}$`)
  },
  // 数字
  number: 'interger||float',
  // 数字比较q
  max (options) {
    options = Object.assign({ max: Number.MAX_SAFE_INTEGER }, options)
    return !Number.isNaN(+options.value) ? (+options.value < +options.max) : `应不大于${options.max}`
  },
  min (options) {
    options = Object.assign({ min: Number.MIN_SAFE_INTEGER }, options)
    return !Number.isNaN(+options.value) ? (+options.value > +options.min) : `应不小于${options.min}`
  },

  /** general */

  required: options => (!['null', 'undefined'].includes(options.value) ? /.+/.test(options.value) : '值缺失'),
  // not: options => options.value !==
}