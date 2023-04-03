import { Component } from "./framework"

export const waitForNextStateUpdate = (component, callback) => {
  component.onUpdated = () => {
    callback()
  }
}

export const ComponentWithProps = class extends Component {
  registerProps() {
    return { text: true }
  }
  registerTemplate() {
    return `<div>${this.props.text}</div>`
  }
}

export const ComponentWithState = class extends Component {
  registerState() {
    return { text: "Hello World" }
  }
  registerTemplate() {
    return `<div>${this.state.text}</div>`
  }
}

export const ComponentWithLinkedPropsAndState = class extends Component {
  registerProps() {
    return { text: true }
  }
  registerState() {
    return { text: this.props.text }
  }
  registerTemplate() {
    return `<div>${this.state.text}</div>`
  }
}