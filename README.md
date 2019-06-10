# Valy.js

你梦寐以求的那个校验器.

## demo

```js
// import from node_modules
const Valy = require('../dist/index')

// user-defined validators & useful default validators
const userDefinedValidator = {
  required: /.+/,
  interger: /^-?\d+$/,
  float: /^-?\d*.\d*$/,
  number: 'interger||float',
  demo1: 'max?123||min?122||required',
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
  .msg('not every item >= 1')
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
    valy
      .number()
      .msg('not a number')
      .demo1()
      .msg('demo1 test failed')
      .flush()
    && doSomethingHere()
  })
```

## TODO

- validate form data
