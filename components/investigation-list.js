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
      :host > p {
        text-align: right;
      }
      :host > div {
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

    `
  }

  render () {
    const { result } = this
    return html`
      ${!result ? '沒東西！' : html`
        <p>種類總數： ${result.length} 種</p>
        <div>${result.map(res => this._listItem(res))}</div>
      `}
    `
  }

  _listItem (res) {
    const { species, records } = res
    const { family, genus, species: sp, abbr } = species
    return html`
    <div class="data-card">
      <h3>${abbr} <br><small>${genus} ${sp}</small></h3>
      ${records .map(data => {
        const [env, d] = data
        const { form, count, action } = d
        return html`<p><b>${env}</b> ${d.map(({ form, count, action }) => html`<span class="data-item">${form} ${count} ${action}</span>`)}</p>`
      })}
    </div>
    `
  }
}

customElements.define('investigation-list', InvestigationList)
