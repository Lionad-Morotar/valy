/* eslint-disable */

const Valy = require('../dist/index')


const line = () => console.log('\n')
const log = (...args) => (line(), console.log(...args))

log(
  '[default validators should work correctly] every, some, has : ',
  require('./every-some')
)

// const task = () => new Promise(resolve => {
//   setTimeout(() => {
//     resolve(1)
//   }, 1000)
// })

log(
  new Valy(55.01)
    .not(49)
    .required()
    .number()
    .min(55)
    .max(60)
    .flush(),
)
