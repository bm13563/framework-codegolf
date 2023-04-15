import { Component } from "../../../framework.js"
import { colorTheme } from "../../styles.js"

export class Button extends Component {
  registerProps() {
    return {
      text: true,
      onClick: true,
    }
  }
  registerFunctions() {
    return {
      handleClick: () => {
        this.props.onClick()
      },
    }
  }
  registerTemplate() {
    return `
      <button class="button__container" data-on="click:handleClick">
        ${this.props.text}
      </button>
    `
  }
  registerStyle() {
    return `
      .button__container {
        background-color: ${colorTheme.bgAccentPrimary};
        padding: 1rem;
        border-radius: 1rem;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        margin-bottom: 1rem;
        min-width: 5rem;
        color: ${colorTheme.textAccentPrimary};
        font-weight: 600;
      }
      .button__container:hover {
        opacity: 0.8;
      }
    `
  }
}
