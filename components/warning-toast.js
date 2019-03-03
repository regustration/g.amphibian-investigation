import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.0.1/lit-element.js?module'

class WarningToast extends LitElement {
  static get properties () {
    return {
      input: { type: Array }
    }
  }

  static get styles () {
    return css`
      p {
        background: #ffc107;
        color: #555;
        display: block;
        padding: 2px 8px;
        border-radius: 3px;
      }
    `
  }

  render () {
    const { input } = this
    return html`
      ${input.map(this._toast)}
    `
  }

  constructor () {
    super()
    this.input = []
  }

  _toast (text) {
    return html`<p>${text}</p>`
  }
}

customElements.define('warning-toast', WarningToast)
