const Valy = require('../dist/index')

const data = [1,2,3]

const validRes = (
    new Valy(data)
        .every(_ => _ >= 1)
        .some(_ => _ === 3)
        .has(1)
        .flush()
) && !(
    new Valy(data)
        .has(4)
        .flush()
) && !(
    new Valy(data)
        .every(_ => _ === 1)
        .flush()
) && !(
    new Valy(data)
        .some(_ => _ > 99)
        .flush()
)

module.exports = validRes