// import utils from './utils'

export default {

  /** social media */

  email: /^([A-Za-z0-9_.])+@([A-Za-z0-9_])+.([A-Za-z]{2,6})$/,
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,
  idcard: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,

  /** number */

  interger: /^-?\d+$/,
  float: /^-?\d*.\d*$/,
  number: 'interger||float',
  notNaN () {
    return !Number.isNaN(+this.value)
  },
  max (max) {
    return ['notNaN', +this.value < max]
  },
  min (min) {
    return ['notNaN', +this.value > min]
  },

  /** TODO array */

  /** general */

  required: /.+/,
  is (_) { return this.value === _ },
  not (_) { return this.value !== _ }
}