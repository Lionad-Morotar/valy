// import utils from './utils'

export default {

  /** social media */

  email: /^([A-Za-z0-9_.])+@([A-Za-z0-9_])+.([A-Za-z]{2,6})$/,
  mobile: /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/,

  /** number */

  interger: /^-?\d+$/,
  float: /^-?\d*.\d*$/,
  number: 'interger||float',
  max (max) {
    return ['notNaN', +this.value < max]
  },
  min (min) {
    return ['notNaN', +this.value > min]
  },

  /** array */
  
  some (_) { 
    return this.value.some(x => this._valid(_, { value: x })) 
  },
  every (_) { 
    return this.value.every(x => this._valid(_, { value: x })) 
  },

  /** general */

  required: /.+/,
  is (_) { 
    return this.value === _ 
  },
  not (_) { 
    return this.value !== _ 
  },
  has (_) {
    return this.value.includes(_)
  }
}