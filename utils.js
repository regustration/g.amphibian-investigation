import { HABITATS_ABBRS } from './config/envs.js'
import { BEHAVIORS, BEHAVIORS_ABBRS } from './config/behaviors.js'

const behaviorRegStr = BEHAVIORS_ABBRS.map(str => str[0] === '$' ? `\\${str}` : str).join('|')
const recordDetailReg = new RegExp(`(抱接|鳴|幼|公|母|成)(\\d+)(${behaviorRegStr})?(:\S+)?`)
export function parseRecordDetail (str) {
  if (str === '卵' || str === '蝌蚪') {
    return [{ form: str }]
  } else {
    const m = str.match(recordDetailReg)
    if (m) {
      const count = Number(m[2])
      if (m[1] === '抱接') {
        return [
          {
            form: '公',
            count,
            action: { id: 5, name: '配對' }
          }, {
            form: '母',
            count,
            action: { id: 5, name: '配對' }
          }
        ]
      } else {
        let action = m[3]
        if (action) {
          if (action[0] === '$') {
            const behaviorId = Number(action.substring(1)) - 1
            const bArr = BEHAVIORS.find(b => b[0] === behaviorId)
            if (bArr) {
              action = {
                id: behaviorId,
                name: bArr[1][0]
              }
            } else {
              console.warn('找不到行為');
            }
          } else {
            const bArr = BEHAVIORS.find(b => b[1].find(abbr => abbr === action))
            if (bArr) {
              action = {
                id: bArr[0],
                name: bArr[1][0]
              }
            } else {
              console.warn('找不到行為');
            }
          }
        } else {
          action = { id: 8, name: '單獨' }
        }

        return [{
          form: m[1],
          count,
          action
        }]
      }
    } else {
      return null
    }
  }
}

export function pushSpeciesRecord (species, records, finalRecords) {
  if (species && records.length) {
    // duplicated species data
    const dupSpecies = finalRecords.find(r => {
      const { genus: g, species: s } = r.species
      const { genus: gt, species: st } = species
      return `${g} ${s}` === `${gt} ${st}`
    })
    if (dupSpecies) {
      pushRecord(dupSpecies.records, records)
    } else {
      finalRecords.push({
        species,
        records
      })
    }
  }
}

export function pushRecord (records, newRecords) {
  newRecords.forEach(record => {
    const dupRecord = records.find(r => r[0].detailId === record[0].detailId)
    if (dupRecord) {
      record[1].forEach(detail =>
        pushDetail(dupRecord[1], [detail])
      )
    } else {
      records.push(record)
    }
  })
}

export function pushDetail (details, newDetails) {
  newDetails.forEach(newDetail => {
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
  })
}

export function addSeeCount (seeObj, newSeeObj) {
  seeObj.froglet += newSeeObj.froglet
  seeObj.male += newSeeObj.male
  seeObj.female += newSeeObj.female
  seeObj.grown += newSeeObj.grown
}
