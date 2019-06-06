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

  query2obj,

  /** common */

  regex: {
    count (countStr) {
      if (countStr === '*') {
        return '*'
      } else {
        return `{${countStr}}`
      }
    },
    email: {
      whiteLists: [
        'qq.com',
        '163.com',
        'vip.163.com',
        'sohu.com',
        'sina.cn',
        'sina.com',
        'gmail.com',
        'hotmail.com'
      ]
    },
    number: {
      areaLabelReflex: {
        both: '-?',
        neg: '-',
        pos: ''
      }
    }
  }

}