import { Component } from "./framework"

class Button extends Component {
  registerProps() {
    return {
      text: true,
      onClick: true,
    }
  }
  registerFunctions() {
    return {
      handleClick: () => {
        this.props.onClick()
      },
    }
  }
  registerTemplate() {
    return `
      <button class="button__container" data-on="click:handleClick">
        ${this.props.text}
      </button>
    `
  }
  registerStyle() {
    return `
      .button__container {
        background-color: ${colorTheme.bgComplementary};
        padding: 1rem;
        border-radius: 1rem;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        margin-bottom: 1rem;
        min-width: 5rem;
        color: ${colorTheme.textTertiary};
        font-weight: 600;
      }
      .button__container:hover {
        opacity: 0.8;
      }
    `
  }
}

class Page extends Component {
  registerComponents() {
    return {
      pageHeader: PageHeader,
      pageBody: PageBody,
    }
  }
  registerTemplate() {
    return `
      <div class="page__container">
        ${this.components.pageHeader({})}
        ${this.components.pageBody({})}
      </div>
    `
  }
}

class PageHeader extends Component {
  registerTemplate() {
    return `
      <div class="page-header__container">
        <h1 class="page-header__header">A very small framework<span>*</span></h1>
        <h5 class="page-header__sub-header">* name TBC</h5>
      </div>
    `
  }
  registerStyle() {
    return `
      .page-header__container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .page-header__header {
        margin-bottom: 1rem;
      }
      .page-header__sub-header {
        margin-top: 0;
      }
    `
  }
}

class PageBody extends Component {
  registerComponents() {
    return {
      counter: Counter,
      timer: Timer,
      form: Form,
    }
  }
  registerTemplate() {
    return `
      <div class="page-body__container">
        <div class="page-body__item">
          ${this.components.counter({})}
        </div>
        <div class="page-body__item">
          ${this.components.timer({})}
        </div>
        <div class="page-body__item">
          ${this.components.form({})}
        </div>
      </div>
    `
  }
  registerStyle() {
    return `
      .page-body__container {
        display: flex;
        justify-content: space-around;
      }
      .page-body__item {
        display: flex;
        justify-content: center;
        margin: 2rem;
        width: 100%;
        border-radius: 1rem;
        overflow: hidden;
        background-color: ${colorTheme.bgTertiary};
        color: ${colorTheme.textPrimary};
      }
    `
  }
}

class Counter extends Component {
  registerState() {
    return {
      count: 0,
    }
  }
  registerFunctions() {
    return {
      increment: () => {
        this.state.count++
      },
    }
  }
  registerComponents() {
    return {
      button: Button,
    }
  }
  registerTemplate() {
    return `
      <div class="counter__container">
        <h2>Button has been clicked ${this.state.count} times</h2>
        ${this.components.button({
          text: "Click me",
          onClick: this.functions.increment,
        })}
      </div>
    `
  }
  registerStyle() {
    return `
      .counter__container {
        width: 100%;
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
    `
  }
}

class Timer extends Component {
  registerState() {
    return {
      time: 0,
      timerId: null,
    }
  }
  registerComponents() {
    return {
      button: Button,
    }
  }
  registerFunctions() {
    return {
      startTimer: () => {
        const timerId = setInterval(() => {
          this.state.time++
        }, 1000)
        this.state.timerId = timerId
      },
      stopTimer: () => {
        clearInterval(this.state.timerId)
        this.state.timerId = null
      },
      resetTimer: () => {
        clearInterval(this.state.timerId)
        this.state.time = 0
        this.state.timerId = null
      },
    }
  }
  registerTemplate() {
    const minutes = Math.floor(this.state.time / 60)
    const seconds = this.state.time % 60
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`

    return `
      <div class="timer__container">
        <h2 class="timer__display">${formattedTime}</h2>
        <div class="timer__controls">
          <div>
            ${this.state.timerId ? this.stopButton() : this.startButton()}
          </div>
          <div class="timer__button-right">
            ${this.components.button({
              text: "Reset",
              onClick: this.functions.resetTimer,
            })}
          </div>
        </div>
      </div>
    `
  }
  stopButton() {
    return `
      ${this.components.button({
        text: "Stop",
        onClick: this.functions.stopTimer,
      })}
    `
  }
  startButton() {
    return `
      ${this.components.button({
        text: "Start",
        onClick: this.functions.startTimer,
      })}
    `
  }
  registerStyle() {
    return `
      .timer__container {
        width: 100%;
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .timer__controls {
        display: flex;
      }
      .timer__button-right {
        margin-left: 1rem;
      }
    `
  }
}

class Form extends Component {
  registerProps() {
    return {
      onSubmit: false,
    }
  }

  registerState() {
    return {
      name: "",
      email: "",
      password: "",
      errors: {
        name: "",
        email: "",
        password: "",
      },
    }
  }

  registerFunctions() {
    return {
      handleChange: event => {
        const { name, value } = event.target
        const errors = { ...this.state.errors }

        switch (name) {
          case "name":
            errors.name = value.length < 3 ? "Name must be at least 3 characters long!" : ""
            break
          case "email":
            errors.email = !/\S+@\S+\.\S+/.test(value) ? "Email address is invalid!" : ""
            break
          case "password":
            errors.password = value.length < 6 ? "Password must be at least 6 characters long!" : ""
            break
          default:
            break
        }

        this.state[name] = value
        this.state.errors = errors
      },
      handleSubmit: event => {
        event.preventDefault()
        if (!this.state.errors.name && !this.state.errors.email && !this.state.errors.password) {
          this.props.onSubmit(this.state)
        }
      },
    }
  }
  registerComponents() {
    return { button: Button }
  }
  registerTemplate() {
    return `
      <form class="form__container" data-on="submit:handleSubmit">
        <div class="form__input-container">
          <label for="name">Name:</label>
          <p class="form__error">${this.state.errors.name}</p>
          <input type="text" name="name" value="${
            this.state.name
          }" data-on="input:handleChange" required>
        </div>
        <div class="form__input-container">
          <label for="email">Email:</label>
          <p class="form__error">${this.state.errors.email}</p>
          <input type="text" name="email" value="${
            this.state.email
          }" data-on="input:handleChange" required>
        </div>
        <div class="form__input-container">
          <label for="password">Password:</label>
          <p class="form__error">${this.state.errors.password}</p>
          <input type="text" name="password" value="${
            this.state.password
          }" data-on="input:handleChange" required>
        </div>
        <div class="form__submit">
          ${this.components.button({ text: "Submit", onClick: () => undefined })}
        </div>
      </form>
    `
  }

  registerStyle() {
    return `
      .form__container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 2rem;
        padding: 2rem;
        border-radius: 1rem;
      }
      .form__input-container {
        width: 90%;
      }
      .form__container label {
        font-size: 1.2rem;
        margin-right: 1rem;
        font-weight: 600;
      }
      .form__container input {
        padding: 0.5rem;
        font-size: 1rem;
        border-radius: 0.5rem;
        border: none;
        margin-bottom: 1rem;
        width: 100%;
      }
      .form__container input[type="text"]:focus,
      .form__container input[type="email"]:focus,
      .form__container input[type="password"]:focus {
        outline: none;
        box-shadow: 0 0 0 2px #5e81ac;
      }
      .form__error {
        color: ${colorTheme.textError}
      }
    `
  }
}

const colorTheme = {
  bgPrimary: "#181c28", // A dark blue-grey color for the primary background
  bgSecondary: "#242a3a", // A slightly lighter blue-grey color for the secondary background
  bgTertiary: "#2e3447", // A muted blue-grey color for the tertiary background
  bgAccent: "#5e81ac", // A pastel blue color for the accent background
  bgComplementary: "#ac8c5e", // A pastel orange color for the complementary background

  textPrimary: "#eceff4", // A light off-white color for primary text
  textSecondary: "#d8dee9", // A slightly darker off-white color for secondary text
  textTertiary: "#343a40", // A dark grey color for tertiary text
  textAccent: "#88c0d0", // A pastel blue color for the accent text
  textComplementary: "#d08770", // A pastel orange color for the complementary text
  textQuaternary: "#aeb6c1", // A grey-blue color for quaternary text
  textError: "#bf616a", // A red color for error text

  accentPrimary: "#88c0d0", // A pastel blue color for the primary accent
  accentSecondary: "#81a1c1", // A darker pastel blue color for the secondary accent
  accentTertiary: "#5e81ac", // A muted pastel blue color for the tertiary accent
  accentComplementary1: "#70a9a1", // A muted pastel blue-green color for the first complementary accent
  accentComplementary2: "#d08770", // A pastel orange color for the second complementary accent
}

const globalStyles = document.createElement("style")
globalStyles.innerHTML = `
  body {
    background-color: ${colorTheme.bgPrimary};
    color: ${colorTheme.textPrimary};
    font-family: 'Roboto', sans-serif;
  }
`

document.head.appendChild(globalStyles)

const page = new Page()
document.body.appendChild(page.mount({}, true))
