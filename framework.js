export class Component {
  #id
  #root
  #propDefinitions
  #watchers
  #watchedState
  static #instanceKeys = []
  static #instances = new WeakMap()

  constructor() {
    const instanceKey = this.#getInstanceKey()
    const existingWeakInstanceKey = Component.#instanceKeys.find(k => k.instanceKey === instanceKey)

    if (existingWeakInstanceKey) {
      return Component.#instances.get(existingWeakInstanceKey)
    }

    const newWeakInstanceKey = { instanceKey }
    Component.#instanceKeys.push(newWeakInstanceKey)
    Component.#instances.set(newWeakInstanceKey, this)

    this.onCreate()

    this.#id = Math.random().toString(36).substring(2, 9)
    this.#root = false
    this.#propDefinitions = this.registerProps()
    this.#watchers = this.registerWatchers()
    this.#watchedState = {}

    this.state = {}
    this.functions = this.registerFunctions()
    this.components = this.#createComponentFactories()

    this.#mountStyles()

    this.onCreated()
  }

  // abstract hooks
  onCreate() {
    return undefined
  }

  onCreated() {
    return undefined
  }

  onMount() {
    return undefined
  }

  onMounted() {
    return undefined
  }

  onUpdate() {
    return undefined
  }

  onUpdated() {
    return undefined
  }

  // abstract registration
  registerProps() {
    return {}
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

  registerWatchers() {
    return {}
  }

  registerTemplate() {
    return ""
  }

  registerStyle() {
    return ""
  }

  registerGlobalStyle() {
    return ""
  }

  #getInstanceKey() {
    const stack = new Error().stack.split("\n")
    let instanceKey = stack[4]
    if (instanceKey.includes("Object.$$factory")) {
      instanceKey = stack[5]
    }
    return instanceKey.trim()
  }

  #createComponentFactories() {
    const components = this.registerComponents()

    const componentPairs = Object.entries(components).map(([key, Component]) => {
      const $$factory = (props, root = false) => new Component().mount(props, root)
      return [key, $$factory]
    })

    const factories = componentPairs.reduce((factories, [key, factory]) => {
      factories[key] = factory
      return factories
    }, {})

    return factories
  }

  #mountStyles() {
    const styleElement = document.createElement("style")
    styleElement.media = "max-width: 1px"
    styleElement.innerHTML = this.registerStyle()
    styleElement.dataset.source = this.constructor.name
    document.head.appendChild(styleElement)

    const parsedStyles = Array.from(styleElement.sheet.cssRules, ({ selectorText, style }) => {
      return `${selectorText}[data-__${this.#id}] { ${style.cssText} }`
    })

    styleElement.innerHTML = parsedStyles.join("\n")
    styleElement.removeAttribute("media")
  }

  #bindEventsToElement(element) {
    const instanceKeys = Component.#instanceKeys

    instanceKeys.forEach(instanceKey => {
      const instance = Component.#instances.get(instanceKey)
      const selector = `[data-__${instance.#id}][data-on]`

      const elements = element.querySelectorAll(selector)

      elements.forEach(element => {
        const [eventType, handler] = element.dataset.on.split(":")
        element.addEventListener(eventType, instance.functions[handler].bind(instance))
      })
    })
  }

  #bindElementToDom(element) {
    const targetElement = document.activeElement
    const caretPosition = targetElement.selectionStart
    const rootQuery = `[data-__${this.#id}="root----"]`
    document.querySelector(rootQuery)?.replaceWith(element)

    if (targetElement.nodeName !== "BODY") {
      const newActiveElement = this.#findActiveElement(targetElement)
      newActiveElement?.focus()
      newActiveElement?.setSelectionRange(caretPosition, caretPosition)
    }

    this.#root = false
  }

  #findActiveElement(targetElement) {
    const isRoot = Object.entries(targetElement.dataset).find(([_, value]) =>
      value.includes("root----"),
    )

    if (isRoot) {
      const [key, value] = isRoot
      return document.querySelector(`${targetElement.nodeName}[data-${key}="${value}"]`)
    }

    const siblings = Array.from(targetElement.parentNode.children).filter(
      sibling => sibling.nodeType === Node.ELEMENT_NODE,
    )
    const index = siblings.indexOf(targetElement) + 1

    return this.#findActiveElement(targetElement.parentNode)?.querySelector(
      `${targetElement.tagName}:nth-child(${index})`,
    )
  }

  #executeWatchers(watchers, state, keyPath) {
    Object.keys(watchers).forEach(key => {
      if (typeof watchers[key] === "object") {
        this.#executeWatchers(watchers[key], state[key], [...keyPath, key])
      } else {
        const newKey = [...keyPath, key].join(".")
        const newValue = JSON.stringify(state[key])

        if (this.#watchedState[newKey] && this.#watchedState[newKey] !== newValue) {
          watchers[key](newValue, JSON.parse(this.#watchedState[newKey]))
        }

        this.#watchedState[newKey] = newValue
      }
    })
  }

  mount(props, root) {
    this.onMount()
    this.#root = root
    this.props = props

    const undefinedProps = Object.keys(this.props).filter(p => !(p in this.#propDefinitions))
    if (undefinedProps.length) {
      throw new Error(`Invalid props: ${this.constructor.name} - ${undefinedProps.join(",")}`)
    }

    const undeclaredProps = Object.keys(this.#propDefinitions).filter(p =>
      this.#propDefinitions[p] ? !this.props[p] : false,
    )
    if (undeclaredProps.length) {
      throw new Error(`Missing props: ${this.constructor.name} - ${undeclaredProps.join(",")}`)
    }

    const sanitizeState = state => {
      return state
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    }

    const state = this.registerState()
    const self = this

    const proxy = new Proxy(state, {
      get(stateObject, propertyName) {
        if (typeof stateObject[propertyName] === "object" && stateObject[propertyName] !== null) {
          return new Proxy(stateObject[propertyName], self.state)
        } else if (typeof stateObject[propertyName] === "string") {
          return sanitizeState(stateObject[propertyName])
        } else {
          return stateObject[propertyName]
        }
      },
      set: (stateObject, propertyName, newPropertyValue) => {
        if (stateObject[propertyName] !== newPropertyValue) {
          stateObject[propertyName] = newPropertyValue
          this.#root = true
          this.onUpdate()
          this.render()
          this.onUpdated()
        }
        return true
      },
    })

    this.state = proxy

    const element = this.render()

    this.onMounted()
    return root ? element : element.outerHTML
  }

  render() {
    const containerElement = document.createElement("div")

    const template = this.registerTemplate()
    containerElement.innerHTML = template.replace(
      /(?<=<[^\/]*)(?<!----")>/g,
      ` data-__${this.#id}="----">`,
    )

    if (containerElement.childElementCount > 1) {
      throw new Error(`Component ${this.constructor.name} must have a single root element`)
    }

    const element = containerElement.firstElementChild
    element.dataset[`__${this.#id}`] = "root----"

    if (this.#root) {
      this.#bindEventsToElement(element)
      this.#bindElementToDom(element)
    }

    this.#executeWatchers(this.#watchers, this.state, [])

    return element
  }
}
