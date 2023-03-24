export class Component {
  constructor() {
    this.onCreate?.()
    this._id = `----${Math.random().toString(36).substring(2, 9)}`
    this._root = false
    this.components = this.registerComponents?.() || {}
    this.functions = this.registerFunctions?.() || {}
    this.propDefinitions = this.registerProps?.() || {}
    this.props = {}
    this.state = {}
    const styleElement = document.createElement("style")
    styleElement.media = "max-width: 1px"
    styleElement.innerHTML = this.registerStyle?.() || ""
    document.head.appendChild(styleElement)
    const parsedStyles = Array.from(styleElement.sheet.cssRules, rule => {
      const { selectorText, style } = rule
      return `${selectorText}.${this._id} { ${style.cssText} }`
    })
    styleElement.innerHTML = parsedStyles.join("\n")
    styleElement.removeAttribute("media")
    Component._instance = this;
    Component._blah.push(this)
    this.onCreated?.()
  }

  mount(props, root = false) {
    console.log(Component._blah, this)
    this._root = root
    this.onMount?.()
    this.props = props
    const undefinedProps = Object.keys(this.props).filter(p => !(p in this.propDefinitions))
    if (undefinedProps.length) {
      throw new Error(
        `Invalid props on component ${this.constructor.name}: ${undefinedProps.join()}`,
      )
    }
    const undeclaredProps = Object.keys(this.propDefinitions).filter(p => !this.props[p])
    if (undeclaredProps.length) {
      throw new Error(
        `Missing props on component ${this.constructor.name}: ${undeclaredProps.join()}`,
      )
    }
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
    const componentElements = el.querySelectorAll(":not([class^='----'])")
    componentElements.forEach(t =>
      t.setAttribute("class", t.className ? this._id + " " + t.className : this._id),
    )
    this._root && this.bindEvents(el)
    this._root && document.querySelector(`.${this._id}_`)?.replaceWith(el)
    this._root = false
    return el
  }

  bindEvents(el) {
    const events = el.querySelectorAll(`.${this._id}[data-on]`)
    events.forEach(event => {
      const [eventType, handler] = event.dataset.on.split(":")
      event.addEventListener(eventType, this.functions[handler].bind(this))
    })
    Object.values(this.components).forEach(child => child.bindEvents(el))
  }
}
