import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.0.1/lit-element.js?module'

class InvestigationList extends LitElement {
  static get properties () {
    return {
      result: { type: Array }
    }
  }

  static get styles () {
    return css`
      :host {
        display: block;
      }
      .list-block {
        display: grid;
        grid-template-columns: repeat(3, .3333fr);
        grid-gap: 5px;
        font-size: 14px;
      }
      h3 {
        margin: 10px 0;
      }
      h3 small {
        color: #aaa;
        font-weight: normal;
        font-style: italic;
      }
      p {
        margin: .25em 0;
      }
      .data-item + .data-item::before {
        content: ', '
      }

      .data-card {
        padding: 10px 15px;
        border: 1px solid #dedede;
        border-radius: 5px;
        background: rgba(255,255,255, .5);
      }
      .card-title-groups {
        display: grid;
        grid-template-columns: 1fr max-content;
      }
      .card-title-groups .summary-groups {
        margin-top: 14px;
      }
      .card-body {
        background: #f1f1f1;
      }
      .card-body > p:nth-child(even) {
        background: #dfdfdf;
      }

      .summary {
        display: flex;
        align-items: center;
        color: #aaa;
      }
      .summary svg {
        fill: #aaa;
        width: 1.2em;
        height: 1.2em;
      }
      .summary span {
        margin: 0 8px 0 4px;
      }
      .summary-groups {
        display: flex;
        justify-content: space-between;
      }

      .button {
        width: 120px;
        height: 40px;
        background: orange;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        border-radius: 5px;
      }
    `
  }

  render () {
    const { result } = this
    return html`
      ${!result || !result.length ? '沒東西！' : html`
        <a href="#" class="button" @click="${this.outputApiData}">API Data</a>
        <p>種類總數： ${result.length} 種</p>
        ${this._summaryOverview(result.see, result.hear)}
        <div class="list-block">${result.map(res => this._listItem(res))}</div>
      `}
    `
  }

  outputApiData (e) {
    e.preventDefault()
    const apiDatas = []
    this.result.forEach(res => {
      const { species, records } = res
      // 建立物種資料
      const apiData = {
        frog_id: species.id
      }
      records.forEach(record => {
        const { typeId: habitat_id, detailId: habitat_p1_id } = record[0]
        // 建立棲地資料
        Object.assign(apiData, { habitat_id, habitat_p1_id })

        // 建立紀錄
        record[1].forEach(d => {
          let { form, count: amount, action } = d
          if (form === '鳴') {
            if (amount >= 50) amount = '>50'
            else if (amount >= 40) amount = '40-49'
            else if (amount >= 30) amount = '30-39'
            else if (amount >= 20) amount = '20-29'
            else if (amount >= 10) amount = '10-19'

            apiDatas.push(Object.assign({}, apiData, {
              observing_method_id: 1,
              amount,
              living_type_id: 4,
              living_type_ids: 4,
              behavior_id: 2,
              behavior_ids: 2,
              memo: null,
              _: Date.parse(new Date())
            }))
          } else if (form === '卵' || form === '蝌蚪') {
            apiDatas.push(Object.assign({}, apiData, {
              observing_method_id: 0,
              amount: '不計數',
              living_type_id: form === '卵' ? 1 : 2,
              living_type_ids: form === '卵' ? 1 : 2,
              behavior_id: 0,
              behavior_ids: 0,
              memo: null,
              _: Date.parse(new Date())
            }))
          } else {
            let behavior = action.id
            if (behavior < 0) behavior = 8

            if (form === '幼') form = 3
            else if (form === '公') form = 4
            else if (form  === '母') form = 5
            else if (form  === '成') form = 6

            apiDatas.push(Object.assign({}, apiData, {
              observing_method_id: 0,
              amount,
              living_type_id: form,
              living_type_ids: form,
              behavior_id: behavior,
              behavior_ids: behavior,
              memo: null,
              _: Date.parse(new Date())
            }))
          }
        })
      })
    })

    console.log(JSON.stringify(apiDatas));
  }

  _hear (hear) {
    return html`
      <svg viewBox="0 0 24 24">
        <path fill="#555" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z" />
      </svg>
      <span style="color:#555;">${hear}</span>
    `
  }

  _see (see) {
    const { froglet, male, female, grown } = see
    return html`
      <svg viewBox="0 0 24 24">
        <path fill="#555" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
      </svg>
      <span style="color:#555;">${froglet + male + female + grown}</span>
    `
  }

  _seeDetail (see, hear) {
    const { froglet, male, female, grown } = see
    return html`
      <svg viewBox="0 0 24 24">
        <path d="M13,2V10H21A8,8 0 0,0 13,2M19.32,15.89C20.37,14.54 21,12.84 21,11H6.44L5.5,9H2V11H4.22C4.22,11 6.11,15.07 6.34,15.42C5.24,16 4.5,17.17 4.5,18.5A3.5,3.5 0 0,0 8,22C9.76,22 11.22,20.7 11.46,19H13.54C13.78,20.7 15.24,22 17,22A3.5,3.5 0 0,0 20.5,18.5C20.5,17.46 20.04,16.53 19.32,15.89M8,20A1.5,1.5 0 0,1 6.5,18.5A1.5,1.5 0 0,1 8,17A1.5,1.5 0 0,1 9.5,18.5A1.5,1.5 0 0,1 8,20M17,20A1.5,1.5 0 0,1 15.5,18.5A1.5,1.5 0 0,1 17,17A1.5,1.5 0 0,1 18.5,18.5A1.5,1.5 0 0,1 17,20Z" />
      </svg>
      <span>${froglet}</span>
      <svg viewBox="0 0 24 24">
        <path d="M9,9C10.29,9 11.5,9.41 12.47,10.11L17.58,5H13V3H21V11H19V6.41L13.89,11.5C14.59,12.5 15,13.7 15,15A6,6 0 0,1 9,21A6,6 0 0,1 3,15A6,6 0 0,1 9,9M9,11A4,4 0 0,0 5,15A4,4 0 0,0 9,19A4,4 0 0,0 13,15A4,4 0 0,0 9,11Z" />
      </svg>
      <span>${male}</span>
      <svg viewBox="0 0 24 24">
        <path d="M12,4A6,6 0 0,1 18,10C18,12.97 15.84,15.44 13,15.92V18H15V20H13V22H11V20H9V18H11V15.92C8.16,15.44 6,12.97 6,10A6,6 0 0,1 12,4M12,6A4,4 0 0,0 8,10A4,4 0 0,0 12,14A4,4 0 0,0 16,10A4,4 0 0,0 12,6Z" />
      </svg>
      <span>${female}</span>
      <svg viewBox="0 0 24 24">
        <path d="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z" />
      </svg>
      <span>${grown}</span>
    `
  }

  _summaryOverview (see, hear) {
    return html`
      <div class="summary">${this._hear(hear)}</div>
      <div class="summary">${this._see(see)}${this._seeDetail(see)}</div>
    `
  }

  _summarySpecies (see, hear) {
    return html`
      <div class="summary-groups">
        <div class="summary">${this._hear(hear)}</div>
        <div class="summary">${this._see(see)}</div>
      </div>
      <div class="summary">${this._seeDetail(see)}</div>
    `
  }

  _listItem (res) {
    const { _listItemBehavior } = this
    const { species, records, summary } = res
    const { family, genus, species: sp, abbr } = species
    return html`
    <div class="data-card">
      <div class="card-title-groups">
        <h3>${abbr} <br><small>${genus} ${sp}</small></h3>
        <div>${this._summarySpecies(summary.see, summary.hear)}</div>
      </div>
      <div class="card-body">
        ${records.map(data => {
          const [habitat, d] = data
          const { type, detail } = habitat
          return html`<p><b>${type} ${detail}</b> ${d.map(_listItemBehavior)}</p>`
        })}
      </div>
    </div>
    `
  }

  _listItemBehavior ({ form, count, action } = {}) {
    if (['卵', '蝌蚪'].indexOf(form) >= 0) {
      return html`<span class="data-item">${form}</span>`
    } else if (form === '鳴') {
      return html`<span class="data-item">${form} ${count}</span>`
    } else {
      return html`<span class="data-item">${form} ${count} ${action.name}</span>`

    }
  }
}

customElements.define('investigation-list', InvestigationList)
