export class Component {
  static _instances = {}

  constructor() {
    const instanceKey = new Error().stack.split("\n")[2].trim()
    if (Component._instances[instanceKey]) {
      return Component._instances[instanceKey]
    }
    Component._instances[instanceKey] = this
    this.onCreate?.()
    this._id = `${Math.random().toString(36).substring(2, 9)}`
    this.components = Object.fromEntries(
      Object.entries(this.registerComponents?.() || {}).map(([key, value]) => [
        key,
        (props, root = false) => new value().mount(props, root),
      ]),
    )
    this.functions = this.registerFunctions?.() || {}
    this.propDefinitions = this.registerProps?.() || {}
    this.state = {}
    this.watchedState = {}
    this.props = {}
    const styleElement = document.createElement("style")
    styleElement.media = "max-width: 1px"
    styleElement.innerHTML = this.registerStyle?.() || ""
    document.head.appendChild(styleElement)
    const parsedStyles = Array.from(
      styleElement.sheet.cssRules,
      ({ selectorText, style }) => `${selectorText}[data-${this._id}] { ${style.cssText} }`,
    )
    styleElement.innerHTML = parsedStyles.join("\n")
    styleElement.removeAttribute("media")
    this.onCreated?.()
  }

  mount(props, root) {
    this.onMount?.()
    this._root = root
    this.props = props
    const undefinedProps = Object.keys(this.props).filter(p => !(p in this.propDefinitions))
    if (undefinedProps.length) {
      throw new Error(`Invalid props: ${this.constructor.name} - ${undefinedProps.join(",")}`)
    }
    const undeclaredProps = Object.keys(this.propDefinitions).filter(p => !this.props[p])
    if (undeclaredProps.length) {
      throw new Error(`Missing props: ${this.constructor.name} - ${undeclaredProps.join(",")}`)
    }
    const self = this
    this.state = new Proxy(this.registerState?.() || {}, {
      get(target, key) {
        return typeof target[key] === "object" && target[key] !== null
          ? new Proxy(target[key], self.state)
          : typeof target[key] === "string"
          ? target[key]
              .replace(/&/g, "&amp;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#39;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
          : target[key]
      },
      set: (obj, prop, value) => {
        if (obj[prop] !== value) {
          obj[prop] = value
          this._root = true
          this.onUpdate?.()
          this.render()
          this.onUpdated?.()
        }
        return true
      },
    })
    const element = this.render()
    this.onMounted?.()
    return root ? element : element.outerHTML
  }

  render() {
    const containerElement = document.createElement("div")
    containerElement.innerHTML = (this.registerTemplate?.() || "").replace(
      /(?<!(?:----"))>/g,
      ` data-${this._id}="nr----">`,
    )
    if (containerElement.childElementCount > 1) {
      throw new Error(`Component ${this.constructor.name} must have a single root element`)
    }
    const element = containerElement.firstElementChild
    element.dataset[this._id] = "r----"
    this._root &&
      Object.values(Component._instances).forEach(instance =>
        element.querySelectorAll(`[data-${instance._id}][data-on]`).forEach(event => {
          const [eventType, handler] = event.dataset.on.split(":")
          event.addEventListener(eventType, instance.functions[handler].bind(instance))
        }),
      )
    this._root && document.querySelector(`[data-${this._id}="r----"]`)?.replaceWith(element)
    this._root = false
    this.watch()
    return element
  }

  watch(watchers = this.registerWatchers?.() || {}, state = this.state, keyPath = []) {
    Object.keys(watchers).forEach(key => {
      if (typeof watchers[key] === "object") {
        this.watch(watchers[key], state[key], [...keyPath, key])
      } else {
        const newKey = [...keyPath, key].join(".")
        const newValue = JSON.stringify(state[key])
        if (this.watchedState[newKey] && this.watchedState[newKey] !== newValue) {
          watchers[key](newValue, JSON.parse(this.watchedState[newKey]))
        }
        this.watchedState[newKey] = newValue
      }
    })
  }
}
