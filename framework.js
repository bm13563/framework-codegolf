export class Component {
  static _instances = {}

  constructor() {
    const key = new Error().stack
    if (Component._instances[key]) {
      return Component._instances[key]
    }
    Component._instances[key] = this
    this.onCreate?.()
    this._id = `----${Math.random().toString(36).substring(2, 9)}`
    this.components = Object.fromEntries(
      Object.entries(this.registerComponents?.() || {}).map(([key, value]) => [
        key,
        (props, root = false) => new value().mount(props, root),
      ]),
    )
    this.functions = this.registerFunctions?.() || {}
    this.propDefinitions = this.registerProps?.() || {}
    this.props = {}
    this.state = {}
    const styleElement = document.createElement("style")
    styleElement.media = "max-width: 1px"
    styleElement.innerHTML = this.registerStyle?.() || ""
    document.head.appendChild(styleElement)
    const parsedStyles = Array.from(
      styleElement.sheet.cssRules,
      ({ selectorText, style }) => `${selectorText}.${this._id} { ${style.cssText} }`,
    )
    styleElement.innerHTML = parsedStyles.join("\n")
    styleElement.removeAttribute("media")
    this.onCreated?.()
  }

  mount(props, root) {
    this._root = root
    this.onMount?.()
    this.props = props
    const undefinedProps = Object.keys(this.props).filter(p => !(p in this.propDefinitions))
    if (undefinedProps.length)
      throw new Error(
        `Invalid props on component ${this.constructor.name}: ${undefinedProps.join()}`,
      )
    const undeclaredProps = Object.keys(this.propDefinitions).filter(p => !this.props[p])
    if (undeclaredProps.length)
      throw new Error(
        `Missing props on component ${this.constructor.name}: ${undeclaredProps.join()}`,
      )
    if (!Object.keys(this.state).length && this.registerState) {
      this.state = new Proxy(this.registerState(), {
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
    }
    const element = this.render()
    this.onMounted?.()
    return root ? element : element.outerHTML
  }

  render() {
    const el = document.createElement("div")
    el.setAttribute("class", `${this._id}_`)
    el.innerHTML = this.registerTemplate ? this.registerTemplate() : ""
    el.querySelectorAll(":not([class^='----'])").forEach(t =>
      t.setAttribute("class", t.className ? this._id + " " + t.className : this._id),
    )
    this._root && this.bindEvents(el)
    this._root && document.querySelector(`.${this._id}_`)?.replaceWith(el)
    this._root = false
    return el
  }

  bindEvents(el) {
    Object.values(Component._instances).forEach(instance =>
      el.querySelectorAll(`.${instance._id}[data-on]`).forEach(event => {
        const [eventType, handler] = event.dataset.on.split(":")
        event.addEventListener(eventType, instance.functions[handler].bind(instance))
      }),
    )
  }
}
