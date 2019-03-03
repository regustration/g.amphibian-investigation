import './components/investigation-list.js'
import SPECIES from './config/species.js'
import ENV_ABBRS from './config/envs.js'
import { parseRecordDetail, pushSpeciesRecord, pushRecord, pushDetail, addSeeCount } from './utils.js'

let SPECIES_ABBRS = []
SPECIES.forEach(family =>
  family[1].forEach(genus =>
    genus[1].forEach(species =>
      SPECIES_ABBRS.push(...species[1])
    )
  )
)
const regSpecies = new RegExp(`(${SPECIES_ABBRS.join('|')})`)

const parseText = str => {
  const res = []
  let tempSpecies = ''
  let tempRecords = []
  let tempDetails = []
  let nextLineShouldBeData = false
  str.split(/\r?\n/).forEach((s, line) => {
    s = $.trim(s)
    if (!s) {
      console.log(`line ${line + 1} is an empty line.`);
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
        pushRecord(tempRecords, [[p, tempDetails]])
        tempDetails = []

      // 動作
      } else {
        const detail = parseRecordDetail(p)
        if (detail) {
          pushDetail(tempDetails, detail)
        } else {
          console.warn(`line ${line + 1} col ${strPos} is an undefined data.`);
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
  let see = {
    froglet: 0,
    male: 0,
    female: 0,
    grown: 0
  }
  res.see = Object.assign({}, see)
  res.hear = 0
  res.forEach(species => {
    const spSee = Object.assign({}, see)
    let spHear = 0
    species.records.forEach(record => {
      record[1].forEach(detail => {
        const { form, count } = detail
        switch (form) {
          case '幼':
            spSee.froglet += count
            break
          case '公':
            spSee.male += count
            break
          case '母':
            spSee.female += count
            break
          case '成':
            spSee.grown += count
            break
          case '抱接':
            spSee.male += count
            spSee.female += count
            break
          case '鳴':
            spHear += count
          default:
            break
        }
      })
    })
    species.summary = {
      see: spSee,
      hear: spHear
    }
    res.hear += spHear
    addSeeCount(res.see, spSee)
  })


  console.log(res);
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
