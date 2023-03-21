export class Component {
  constructor() {
    this.onCreate && this.onCreate()
    this._id = `----${Math.random().toString(36).substring(2, 9)}`
    this._root = false
    this.components = this.registerComponents()
    this.functions = this.registerFunctions()
    this.props = {}
    this.state = {}
    const style = document.createElement("style")
    style.setAttribute("media", "max-width: 1px")
    style.innerHTML = this.registerStyle()
    document.head.appendChild(style)
    const parsedStyles = []
    for (const key in style.sheet.cssRules) {
      if (style.sheet.cssRules[key]?.selectorText) {
        parsedStyles.push(
          `${style.sheet.cssRules[key]?.selectorText}.${this._id} { ${style.sheet.cssRules[key]?.style.cssText} }`,
        )
      }
    }
    style.innerHTML = parsedStyles.join("\n")
    style.removeAttribute("media")
    this.onCreated && this.onCreated()
  }

  registerState() {
    return {}
  }
  registerComponents() {
    return {}
  }
  registerFunctions() {
    return {}
  }
  registerTemplate() {
    return ""
  }
  registerStyle() {
    return ""
  }

  mount(props, root = false) {
    this._root = root
    this.onMount && this.onMount()
    this.props = props
    if (Object.keys(this.state).length === 0) {
      this.state = new Proxy(this.registerState(), {
        set: (obj, prop, value) => {
          if (obj[prop] !== value) {
            obj[prop] = value
            this._root = true
            this.update()
          }
          return true
        },
      })
    }
    const element = this.render()
    this.onMounted && this.onMounted()
    return root ? element : element.outerHTML
  }

  update() {
    this.onUpdate && this.onUpdate()
    this.render()
    this.onUpdated && this.onUpdated()
  }

  render() {
    const el = document.createElement("div")
    el.setAttribute("class", `${this._id}----`)
    el.innerHTML = this.registerTemplate()
    const componentElements = el.querySelectorAll(":not([class^='----'])")
    componentElements.forEach(t =>
      t.setAttribute("class", t.className ? this._id + " " + t.className : this._id),
    )
    this._root && this.bind(el)
    this._root && document.querySelector(`.${this._id}----`)?.replaceWith(el)
    this._root = false
    return el
  }

  bind(el) {
    Object.entries(this.state).forEach(([key, value]) => {
      const elements = el.querySelectorAll(`.${this._id}[data-bind="${key}"]`)
      elements.forEach(element => {
        element.innerText = value
      })
    })
    const events = el.querySelectorAll(`.${this._id}[data-on]`)
    events.forEach(event => {
      const [eventType, handler] = event.dataset.on.split(":")
      event.addEventListener(eventType, this.functions[handler].bind(this))
    })
    Object.values(this.components).forEach(child => child.bind(el))
  }
}
