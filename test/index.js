/* eslint-disable */

const Valy = require('../dist/index')


const line = () => console.log('\n')
const log = (...args) => (line(), console.log(...args))

log(
  '[default validators should work correctly] every, some, has : ',
  require('./every-some')
)

// log(new Valy().valid('required').getRes())

// log(new Valy(0).valid('required').getRes())
// log(new Valy('').valid('required').getRes())
// log(new Valy('test').valid('required').getRes())

// line()

// log(new Valy(55.01).valid('max?max=55.02').getRes())
// log(new Valy(55.01).valid('max?max=55.009').getRes())

// line()

// log(new Valy(55.01).valid(['max?max=55.011', 'min?min=49', _ => _ === 55.01]).getRes())

// line()

// log(new Valy(55.01).valid(['max?max=55.011', 'min?min=49', '数字不为55']).getRes())

// line()

/** async */

// new Valy('5')
//     .valid(/5/)
//     .flush(),
// new Valy('5')
//   .validAsync(task().then(() => 'is?5'))
//   .then(res => console.log(res.flush()))

Valy.use({
  max56: 'max?55',
  min56: 'min?56',
  maxminRequired: 'max56||min56||required'
})

const task = () => new Promise(resolve => {
  setTimeout(() => {
    resolve(1)
  }, 1000)
})

log(
  // new Valy(55.01)
  //   .not(49)
  //   .required()
  //   .number()
  //   .min(55)
  //   .max(60)
  //   .maxminRequired()
  //   .valid(/^55.01$/)
  //   .valid([_ => [ _ => [ _ => _ < 56 ] ]])
  //   .format(_ => 55)
  //   .valid(/^55$/)
  //   .format(_ => 1)
  //   .valid(setTimeout(() => 'is?1', 1))
  //   .flush(),
  
)
