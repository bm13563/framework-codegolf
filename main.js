import { Component } from "./framework"

class Parent extends Component {
  registerProps() {
    return {
      title: true,
    }
  }
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
                ${this.components.child.test({
                  text: this.state.text,
                  onClick: this.functions.onClick,
                })}
                  <h1>${this.props.title}</h1>
                  <p>${this.state.text}</p>
                  ${this.components.child.test({
                    text: this.state.text,
                    onClick: this.functions.onClick,
                  })}
                  ${this.state.open ? `<p>${this.state.text}</p>` : ""}
              </div>
          `
  }
  registerStyle() {
    return `
              p {
                  color: red;
              }
          `
  }
}

class Child extends Component {
  registerProps() {
    return {
      text: true,
      onClick: false,
    }
  }
  registerState() {
    return {
      text: "ello",
    }
  }
  registerFunctions() {
    return {
      handleClick: () => {
        console.log("fire")
        this.props.onClick && this.props.onClick()
        this.state.text = this.state.text === "ello" ? "Hello" : "ello"
      },
    }
  }
  registerTemplate() {
    return `
              <div>
                  <p>${this.state.text}</p>
                  <button data-on="click:handleClick">Click me</button>
              </div>
          `
  }
}

const app = new Parent()
document.body.appendChild(app.test({ title: "My App" }, true))
