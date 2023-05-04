export class Component {
  #id
  #root
  #propDefinitions
  #watchers
  #watchedState
  static #instanceKeys = []
  static #instances = new WeakMap()
  _debug = false

  constructor(key = "documentroot") {
    const instanceKey = key
    const existingWeakInstanceKey = Component.#instanceKeys.find(k => k.instanceKey === instanceKey)

    if (existingWeakInstanceKey) {
      return Component.#instances.get(existingWeakInstanceKey)
    }
    const newWeakInstanceKey = { instanceKey }
    Component.#instanceKeys.push(newWeakInstanceKey)
    Component.#instances.set(newWeakInstanceKey, this)

    this.onCreate()

    this.#id = key
    this.#root = false
    this.props = {}
    this.#propDefinitions = this.registerProps()
    this.#watchers = this.registerWatchers()
    this.#watchedState = {}
    this.state = {}
    this.functions = this.registerFunctions()
    this.compiledTemplate = this.#compileTemplate()
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

  #createComponentFactories() {
    const components = this.registerComponents()

    const componentPairs = Object.entries(components).map(([key, Component]) => {
      const $$factory = (key, props, root = false) => new Component(key).mount(props, root)
      return [key, $$factory]
    })

    const factories = componentPairs.reduce((factories, [key, factory]) => {
      factories[key] = factory
      return factories
    }, {})

    return factories
  }

  #compileTemplate() {
    let templateString = `${this.registerTemplate}`
    templateString = templateString
      .slice(templateString.indexOf("{") + 1, templateString.lastIndexOf("}"))
      .replace(/(<[a-zA-Z1-9]+)([^\$<]*\${this.(state|props).([a-zA-Z1-9]+))/g, (_, group1, group2) => {
        const randomStr = Math.random().toString(36).substring(2, 9);
        return `${group1} data-reactive="${randomStr}" ${group2}`
      })
      .replace(/(<[a-zA-Z1-9]+)/g, `$1 data-${this.#id}`)
      .replace(/(<[a-zA-Z1-9]+)/, `$1 data-root`)
      .replace(/(this\.components\.[^\(]*\(){/g, (_, group1) => {
        const randomStr = Math.random().toString(36).substring(2, 9);
        return `${group1}"${randomStr}", {`;
      })
      .trim()

    const compiledRegisterTemplate = new Function(templateString)

    return () => compiledRegisterTemplate.bind(this)()
  }

  #mountStyles() {
    const styleElement = document.createElement("style")
    styleElement.media = "max-width: 1px"
    styleElement.innerHTML = this.registerStyle()
    styleElement.dataset.source = this.constructor.name
    document.head.appendChild(styleElement)

    const parsedStyles = Array.from(styleElement.sheet.cssRules, ({ selectorText, style }) => {
      return `${selectorText}[data-${this.#id}] { ${style.cssText} }`
    })

    styleElement.innerHTML = parsedStyles.join("\n")
    styleElement.removeAttribute("media")
  }

  #bindEventsToElement(element) {
    const instanceKeys = Component.#instanceKeys

    instanceKeys.forEach(instanceKey => {
      const instance = Component.#instances.get(instanceKey)
      const selector = `[data-${instance.#id}][data-on]`

      const elements = element.parentNode.querySelectorAll(selector)

      elements.forEach(element => {
        const [eventType, handler] = element.dataset.on.split(":")
        element.addEventListener(eventType, instance.functions[handler].bind(instance))
      })
    })
  }

  #bindElementToDom(element) {
    const activeSelector = document.activeElement?.dataset?.reactive
    const selectionStart = document.activeElement?.selectionStart
    const selectionEnd = document.activeElement?.selectionEnd
    const rootQuery = `[data-${this.#id}][data-root]`
    document.querySelector(rootQuery)?.replaceWith(element)
    const newActiveElement = document.querySelector(`[data-reactive="${activeSelector}"]`)
    if (newActiveElement) {
      newActiveElement.focus()
      try {
        newActiveElement.setSelectionRange(selectionStart, selectionEnd)
      } catch {
        true
      }
    }
    this.#root = false
  }

  #executeWatchers(watchers, state, keyPath) {
    Object.keys(watchers).forEach(key => {
      if (typeof watchers[key] === "object") {
        this.#executeWatchers(watchers[key], state[key], [...keyPath, key])
      } else {
        const newKey = [...keyPath, key].join(".")
        const newValue = JSON.stringify(state[key])

        if (this.#watchedState[newKey] && this.#watchedState[newKey] != newValue) {
          this.#watchedState[newKey] = newValue
          watchers[key](newValue, JSON.parse(this.#watchedState[newKey]))
        } else {
          this.#watchedState[newKey] = newValue
        }
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
      this.#propDefinitions[p] ? !(p in this.props) : false,
    )
    if (undeclaredProps.length) {
      throw new Error(`Missing props: ${this.constructor.name} - ${undeclaredProps.join(",")}`)
    }
    
    if (Object.keys(this.state).length === 0) {
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

      this.state = new Proxy(state, {
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
          if (stateObject[propertyName] != newPropertyValue) {
            stateObject[propertyName] = newPropertyValue
            self.#root = true
            self.onUpdate()
            self.render(propertyName)
            self.onUpdated()
          }
          return true
        },
      })
    }

    const elementOrTemplate = this.render()

    this.onMounted()
    return elementOrTemplate
  }

  render () {
    const template = this.compiledTemplate()

    if (this.#root) {
      const containerElement = document.createElement("div")
      containerElement.innerHTML = template

      if (containerElement.children.length > 1) {
        throw new Error(`Component must have a single root element: ${this.constructor.name}`)
      }

      const element = containerElement.firstElementChild

      this.#bindEventsToElement(element)
      this.#bindElementToDom(element)
      this.#executeWatchers(this.#watchers, this.state, [])
      return element
    } else {
      return template
    }
  }

  _debugLog() {
    if (this._debug) {
      console.log(...arguments, this.constructor.name)
    }
  }
}
