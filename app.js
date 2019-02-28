import './template.js'

const ENV_STRINGS = '流水 溪流 瀑布 水域 水岸 水植 暫水 暫水岸 暫水植 暫植積 喬木 灌木 底層 竹林 長草 短草 邊坡 乾溝 建物 車道 步道 空地'.split(' ')


const dataSplit = data => {
  if (data.indexOf('卵') === 0 || data.indexOf('蝌蚪') === 0) {
    return { form: data }
  } else {
    const m = data.match(/(抱接|鳴|幼|公|母|成)(\d+)(\S*)/)
    return m
      ? {
        form: m[1],
        count: Number(m[2]),
        action: m[3]
      } : null
  }
}

const parseText = str => {
  const res = str.split(/[\r\n]+/).map((s, line) => {
    let parts = s.split(/\s+/)
    let strIndex = 0
    let species = parts.shift()

    strIndex += species.length
    const dataSet = []
    let temp = []
    parts.map(p => {
      if (ENV_STRINGS.indexOf(p) >= 0) {
        dataSet.push([
          p, temp
        ])
        temp = []
      } else {
        const data = dataSplit(p)
        if (data) {
          const dataHasPushed = temp.find(d => d.form === data.form && d.action === data.action)
          if (dataHasPushed) {
            if (typeof dataHasPushed.count !== undefined) {
              dataHasPushed.count += data.count
            }
          } else {
            temp.push(data)
          }
        }
      }
      strIndex += p.length
    })

    dataSet.sort((a, b) => ENV_STRINGS.indexOf(a[0]) - ENV_STRINGS.indexOf(b[0]))

    return {
      species,
      dataSet
    }
  })
  console.log(res);
  return res
}

$(() => {
  console.log('hihi');
  const $rawText = $('#raw-text')
  const $res = $('#result')
  $('button').click(e => {
    e.preventDefault()
    $('investigation-list')[0].result = parseText($.trim($rawText.val()))

  })
})
