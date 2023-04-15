import { Component } from "../../framework.js"
import { Button } from "./atoms/Button.js"

export class Counter extends Component {
  registerState() {
    return {
      count: 0,
    }
  }
  registerFunctions() {
    return {
      increment: () => {
        this.state.count++
      },
    }
  }
  registerComponents() {
    return {
      button: Button,
    }
  }
  registerTemplate() {
    return `
      <div class="counter__container">
        <h2>Button has been clicked ${this.state.count} times</h2>
        ${this.components.button({
          text: "Click me",
          onClick: this.functions.increment,
        })}
      </div>
    `
  }
  registerStyle() {
    return `
      .counter__container {
        width: 100%;
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      h2 {
        text-align: center;
      }
    `
  }
}
