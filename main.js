import { Component } from "./framework"
import { AutoComplete } from "./example/components/AutoComplete"
import { Form } from "./example/components/Form"
import { Timer } from "./example/components/Timer"
import { Counter } from "./example/components/Counter"
import { colorTheme } from "./example/styles"

class Page extends Component {
  registerComponents() {
    return {
      pageHeader: PageHeader,
      pageBody: PageBody,
    }
  }
  registerTemplate() {
    return `
      <div class="page__container">
        ${this.components.pageHeader({})}
        ${this.components.pageBody({})}
      </div>
    `
  }
}

class PageHeader extends Component {
  registerTemplate() {
    return `
      <div class="page-header__container">
        <h1 class="page-header__header">
          A very small framework
          <span>*</span>
        </h1>
        <h5 class="page-header__sub-header">* name TBC</h5>
      </div>
    `
  }
  registerStyle() {
    return `
      .page-header__container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .page-header__header {
        margin-bottom: 1rem;
      }
      .page-header__sub-header {
        margin-top: 0;
      }
    `
  }
}

class PageBody extends Component {
  registerComponents() {
    return {
      counter: Counter,
      timer: Timer,
      form: Form,
      autoComplete: AutoComplete,
    }
  }
  registerTemplate() {
    return `
      <div class="page-body__container">
        <div class="page-body__item">
          ${this.components.counter({})}
        </div>
        <div class="page-body__item">
          ${this.components.timer({})}
        </div>
        <div class="page-body__item">
          ${this.components.form({})}
        </div>
        <div class="page-body__item">
          ${this.components.autoComplete({})}
        </div>
      </div>
    `
  }
  registerStyle() {
    return `
      .page-body__container {
        display: flex;
        justify-content: space-around;
      }
      .page-body__item {
        display: flex;
        justify-content: center;
        margin: 2rem;
        width: 100%;
        border-radius: 1rem;
        overflow: hidden;
        background-color: ${colorTheme.bgSecondary};
        color: ${colorTheme.textSecondary};
        overflow: visible;
      }
    `
  }
}

const globalStyles = document.createElement("style")
globalStyles.innerHTML = `
  body {
    background-color: ${colorTheme.bgPrimary};
    color: ${colorTheme.textPrimary};
    font-family: 'Roboto', sans-serif;
  }
`

document.head.appendChild(globalStyles)

const page = new Page()
document.body.appendChild(page.mount({}, true))

window.addEventListener("focus", (event) => {
}, true)
