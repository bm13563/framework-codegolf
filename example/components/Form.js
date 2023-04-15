import { Component } from "../../framework.js"
import { Button } from "./atoms/Button.js"
import { colorTheme } from "../styles.js"

export class Form extends Component {
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
