import './components/template.js'
import SPECIES from './config/species.js'

const ENV_STRINGS = '流水 溪流 瀑布 水域 水岸 水植 暫水 暫水岸 暫水植 暫植積 喬木 灌木 底層 竹林 長草 短草 邊坡 乾溝 建物 車道 步道 空地'.split(' ')

let SPECIES_ABBRS = []
SPECIES.forEach(family =>
  family[1].forEach(genus =>
    genus[1].forEach(species =>
      SPECIES_ABBRS.push(...species[1])
    )
  )
)
const regSpecies = new RegExp(`(${SPECIES_ABBRS.join('|')})`)
console.log(SPECIES_ABBRS.join('|'));
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
    let strPos = 0
    let parts = s.split(/\s/)
    parts.forEach((p, i) => {
      if (!p) {
        strPos += 1
        return
      }
      let isSpeciesPart = SPECIES_ABBRS.indexOf(p) >= 0
      if (i === 0 && line === 0 && !isSpeciesPart) {
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
      } else if (ENV_STRINGS.indexOf(p) >= 0) {
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


function pushSpeciesRecord (species, records, finalRecords) {
  if (species && records.length) {
    // duplicated species data
    const dupSpecies = finalRecords.find(r => {
      const { genus: g, species: s } = r.species
      const { genus: gt, species: st } = species
      console.log(`${g} ${s}`, ` ${gt} ${st}`);
      return `${g} ${s}` === `${gt} ${st}`
    })
    if (dupSpecies) {
      pushRecord(dupSpecies.records, records)

      dupSpecies.records.sort((a, b) => ENV_STRINGS.indexOf(a[0]) - ENV_STRINGS.indexOf(b[0]))
    } else {
      finalRecords.push({
        species,
        records: records.sort((a, b) => ENV_STRINGS.indexOf(a[0]) - ENV_STRINGS.indexOf(b[0]))
      })
    }
  }
}

function pushRecord (records, newRecords) {
  newRecords.forEach(record => {
    const dupRecord = records.find(r => r[0] === record[0])
    if (dupRecord) {
      record[1].forEach(detail =>
        pushDetail(dupRecord[1], detail)
      )
    } else {
      records.push(record)
    }
  })
}

function pushDetail (details, newDetail) {
  const dupDetail = details.find(d =>
    d.form === newDetail.form && d.action === newDetail.action
  )
  if (dupDetail) {
    if (typeof dupDetail.count === 'number') {
      dupDetail.count += newDetail.count
    }
  } else {
    details.push(newDetail)
  }
}
