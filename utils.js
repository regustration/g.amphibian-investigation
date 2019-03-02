import ENV_ABBRS from './config/envs.js'

export function parseRecordDetail (str) {
  if (str === '卵' || str === '蝌蚪') {
    return { form: str }
  } else {
    const m = str.match(/(抱接|鳴|幼|公|母|成)(\d+)(\S*)/)
    return m
      ? {
        form: m[1],
        count: Number(m[2]),
        action: m[3]
      } : null
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

      dupSpecies.records.sort((a, b) => ENV_ABBRS.indexOf(a[0]) - ENV_ABBRS.indexOf(b[0]))
    } else {
      finalRecords.push({
        species,
        records: records.sort((a, b) => ENV_ABBRS.indexOf(a[0]) - ENV_ABBRS.indexOf(b[0]))
      })
    }
  }
}

export function pushRecord (records, newRecords) {
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

export function pushDetail (details, newDetail) {
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

export function addSeeCount (seeObj, newSeeObj) {
  seeObj.froglet += newSeeObj.froglet
  seeObj.male += newSeeObj.male
  seeObj.female += newSeeObj.female
  seeObj.grown += newSeeObj.grown
}
