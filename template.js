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
        display: grid;
        grid-template-columns: repeat(3, .33fr);
        font-size: 14px;
      }
      h3 {
        margin: 10px 0;
      }
      p {
        margin: .25em 0;
      }
      .data-item + .data-item::before {
        content: ', '
      }

      .data-card {
        padding: 10px 15px;
        margin: 5px;
        border: 1px solid #dedede;
        border-radius: 5px;
      }

    `
  }

  render () {
    const { result } = this
    return html`
      ${result ? result.map(res => this._listItem(res)) : '沒東西！'}
    `
  }

  _listItem (res) {
    const {species, dataSet} = res
    return html`
    <div class="data-card">
      <h3>${species}</h3>
      ${dataSet.map(data => {
        const [env, d] = data
        const { form, count, action } = d
        return html`<p><b>${env}</b> ${d.map(({ form, count, action }) => html`<span class="data-item">${form} ${count} ${action}</span>`)}</p>`
      })}
    </div>
    `
  }
}

customElements.define('investigation-list', InvestigationList)
