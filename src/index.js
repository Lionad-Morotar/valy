import defaultValidator from './defaultValidator.js'

/** Valy
 * @param {Any} value 待校验的值
 */
class Valy {
  constructor (value = '') {
    Object.assign(this, {
      store: new Map([
        ['value', value]
      ]),
      pass: false,
      result: null,
      message: '',
      value
    })
    return new Proxy(this, {
      get: (target, key, receiver) => {
        // TODO prototype properties
        const findMap = maps.find(x => x.has(key))
        return !findMap
          ? Reflect.get(target, key, receiver)
          : params => {
            const handle = findMap.get(key)
            this.valid(
              handle.bind
                ? handle.bind(this, params)
                : handle
            )
            return receiver
          }
      }
    })
  }

  toValid (validators = [], options = {}) {
    options = Object.assign({ stragedy: 'and' }, options)
    const value = options.value || this.value

    /** const */

    const methods = {
      'function': () => {
        const fnResult = validators(value)
        return ['function', 'object'].includes(typeof fnResult)
          ? this.toValid(fnResult)
          : fnResult
      },
      'array': () => {
        const results = validators.map(x => this.toValid(x))
        return options.stragedy === 'and'
          ? results.every(x => x === true)
          : results.some(x => x === true)
      },
      'regexp': () => validators.test(value),
      'boolean': () => validators,
      'undefined': () => false,
      'error': () => { throw new Error(`unsupported type of validItem : ${typeof validators} - ${validators}`) }
    }

    /** vars */

    let toValidResult = null
    switch (typeof validators) {
      case 'object':
        if (Array.isArray(validators)) {
          toValidResult = methods['array'].bind(this)()
        } else if (validators instanceof RegExp) {
          toValidResult = methods['regexp'].bind(this)()
        }
        break

      case 'string':
        // TODO eval((1&&1||2)||0)
        const validArr = validators.split('||')
        if (validArr.length > 1) {
          toValidResult = this.toValid(validArr, Object.assign(options, { stragedy: 'or' }))
        } else {
          const toFindHandle = validators.split('?')
          const [fnName, params] = [toFindHandle[0], (toFindHandle[1] || '').split(',')]
          const handle = maps.find(x => x.has(fnName)).get(fnName)
          if (!handle) {
            toValidResult = false
            this.message = validators
            break
          }
          if (typeof handle === 'function') {
            const handleFnRes = handle.bind(this)(...params)
            toValidResult = this.toValid(handleFnRes)
          } else {
            toValidResult = this.toValid(handle)
          }
        }
        break

      default:
        toValidResult = methods[typeof validators].bind(this)()
    }

    return toValidResult
  }
  format (fn = _ => this.store.get('value')) {
    this.value = fn(this.value)
    return this
  }
  valid (validators) {
    if (this.pass) return this
    if (!(this.result = this.toValid(validators))) {
      this.pass = true
    }
    return this
  }
  async validAsync (validators) {
    if (this.pass) return this
    if (!(this.result = this.toValid(await validators))) {
      this.pass = true
    }
    return this
  }
  msg (info) {
    this.result = this.result || info
    return this
  }
  flush (key) {
    return key
      ? this[key]
      : this.message || this.result
  }
}

const maps = []
Valy.use = models => maps.unshift(new Map(Object.entries(models)))
Valy.use(defaultValidator)

export default Valy