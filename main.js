import { Component } from "./framework"

class Parent extends Component {
  registerState() {
    return {
      text: "Hello World",
      open: true,
    }
  }
  registerComponents() {
    return {
      child: new Child(),
    }
  }
  registerFunctions() {
    return {
      onClick: () => {
        this.state.open = !this.state.open
      },
    }
  }
  registerTemplate() {
    return `
              <div class="component-container">
                  <h1>${this.props.title}</h1>
                  <p data-bind="text">${this.state.text}</p>
                  ${this.components.child.mount({
                    text: this.state.text,
                    onClick: this.functions.onClick,
                  })}
                  ${this.state.open ? `<p>${this.state.text}</p>` : ""}
              </div>
          `
  }
  registerStyle() {
    return `
              h1 {
                  color: red;
              }
          `
  }
}

class Child extends Component {
  registerState() {
    return {
      text: "ello",
    }
  }
  registerFunctions() {
    return {
      handleClick: () => {
        this.props.onClick()
        this.state.text = this.state.text === "ello" ? "Hello" : "ello"
      },
    }
  }
  registerTemplate() {
    return `
              <div>
                  <p data-bind="text">${this.state.text}</p>
                  <button data-on="click:handleClick">Click me</button>
              </div>
          `
  }
}

const app = new Parent()
document.body.appendChild(app.mount({ title: "My App" }, true))