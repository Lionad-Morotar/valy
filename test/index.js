// import mdDemo from '../res/md.demo'
const Valy = require('../dist/index')

const log = console.log
const line = () => console.log('\n')

log(new Valy(undefined).valid('required').getRes())

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