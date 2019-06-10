# Valy.js

你梦寐以求的那个校验器.

## demo

```js
// import from node_modules
const Valy = require('../dist/index')

// user-defined validators & useful default validators
const userDefinedValidator = {
  interger: /^-?\d+$/,
  float: /^-?\d*.\d*$/,
  number: 'interger||float',
  maxminRequired: 'max56||min56||required',
  max (max) {
    return ['notNaN', +this.value < max]
  },
  min (min) {
    return ['notNaN', +this.value > min]
  },
}
Valy.use(userDefinedValidator)

// demo
new Valy([1,2,3])
  .every(_ => _ >= 1)
  .some(_ => _ === 3)
  .has(1)
  .format(_ => '3')
  .has(3)
  .format()
  .every(_ => _ >= 1)
  .some(_ => _ === 3)
  .flush()
&& doSomethingHere()

// demo - async validator
const task = () => new Promise(resolve => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})
new Valy('123')
  .validAsync(task().then(() => 'has?3'))
  .then(valy => {
    if (valy.flush()) {
      doSomethingHere()
    }
  })
```
