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
      child: Child,
    }
  }
  registerFunctions() {
    return {
      onClick: () => {
        this.state.text = this.state.text + "a"
      },
    }
  }
  registerTemplate() {
    return `
              <div class="component-container">
                ${this.components.child({
                  text: this.state.text,
                  onClick: this.functions.onClick,
                })}
                  <h1>${this.props.title}</h1>
                  <p>${this.state.text}</p>
                  ${this.components.child({
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
        this.props.onClick && this.props.onClick()
      },
    }
  }
  registerTemplate() {
    return `
              <div>
                  <p>${this.props.text}</p>
                  <button data-on="click:handleClick">Click me</button>
              </div>
          `
  }
  registerStyle() {
    return `
              p {
                  color: blue;
              }
          `
  }
}

document.body.appendChild(new Parent().mount({ title: "My App" }, true))
