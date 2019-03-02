import './components/investigation-list.js'
import SPECIES from './config/species.js'
import ENV_ABBRS from './config/envs.js'
import { pushSpeciesRecord, pushRecord, pushDetail } from './utils.js'

let SPECIES_ABBRS = []
SPECIES.forEach(family =>
  family[1].forEach(genus =>
    genus[1].forEach(species =>
      SPECIES_ABBRS.push(...species[1])
    )
  )
)
const regSpecies = new RegExp(`(${SPECIES_ABBRS.join('|')})`)
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
  const res = []
  let tempSpecies = ''
  let tempRecords = []
  let tempDetails = []
  let nextLineShouldBeData = false
  str.split(/\r?\n/).forEach((s, line) => {
    s = $.trim(s)
    if (!s) {
      console.log(`line ${line} is an empty line.`);
      return
    }
    let startPos = 0
    let strPos = 0
    let parts = s.split(/\s/)
    parts.forEach((p, i) => {
      if (!p) {
        strPos += 1
        // 文字紀錄開頭可以空幾行再開始
        if (i === startPos) startPos += 1
        return
      }
      let isSpeciesPart = SPECIES_ABBRS.indexOf(p) >= 0
      if (i === startPos && line === 0 && !isSpeciesPart) {
        throw new Error(`first one should be a species name.`)
      }

      // 物種名稱
      if (isSpeciesPart) {
        // 推送物種資料並且重置動作棲地資料
        if (tempRecords.length) {
          pushSpeciesRecord(tempSpecies, tempRecords, res)

          tempRecords = []
          tempDetails = []
        }

        SPECIES.find(f => f[1].find(g => g[1].find(s => s[1].find(abbr => {
          if (abbr === p) {
            tempSpecies = {
              family: f[0],
              genus: g[0],
              species: s[0],
              abbr: s[1][0]
            }
            return true
          }
        }))))


      // 資料棲地
      } else if (ENV_ABBRS.indexOf(p) >= 0) {
        tempRecords.push([p, tempDetails])
        tempDetails = []

      // 動作
      } else {
        const detail = dataSplit(p)
        if (detail) {
          pushDetail(tempDetails, detail)
        } else {
          console.warn(`line ${line} col ${strPos} is an undefined data.`);
        }
      }

      strPos += (p.length + 1)
    })
  })
  // 最後一筆資料推送
  if (tempRecords.length) {
    pushSpeciesRecord(tempSpecies, tempRecords, res)

    tempRecords = []
    tempDetails = []
  }

  // 整合資料
  // TODO: 整合資料


  return res.sort((a, b) =>{
    const { species: sa } = a
    const { species: sb } = b
    return `${sa.family} ${sa.genus} ${sa.species}`.localeCompare(`${sb.family} ${sb.genus} ${sb.species}`)
  })
}

$(() => {
  const $rawText = $('#raw-text')
  const $res = $('#result')
  $('button').click(e => {
    e.preventDefault()
    $('investigation-list')[0].result = parseText($.trim($rawText.val()))
  })
})
