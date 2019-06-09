function query2obj (query) {
  const queryArr = query.split('&').filter(x => x)
  let res = null
  try {
    res = JSON.parse(
      '{' +
        queryArr
          .map(x => {
            const [key, value] = x.split('=')
            return `"${key}":"${value}"`
          })
          .join(',\n') +
      '}'
    )
  } catch (err) {
    res = {}
  }
  return res
}

export default {

  /** utils */

  query2obj

}