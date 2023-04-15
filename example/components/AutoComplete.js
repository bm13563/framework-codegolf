import { Component } from "../../framework.js"
import { colorTheme } from "../styles.js"

export class AutoComplete extends Component {
  registerState() {
    return {
      selected: false,
      searchTerm: "",
      options: [],
      filteredOptions: [],
    }
  }
  registerFunctions() {
    return {
      handleChange: event => {
        this.state.searchTerm = event.target.value
      },
      handleSelect: event => {
        this.state.searchTerm = event.target.innerText
        this.state.selected = false
      },
    }
  }
  registerWatchers() {
    return {
      searchTerm: () => {
        if (this.state.searchTerm.length > 0) {
          this.state.filteredOptions = this.state.options.filter(o =>
            o.toLowerCase().startsWith(this.state.searchTerm.toLowerCase()),
          )
          this.state.selected = true
        } else {
          this.state.selected = false
        }
      },
    }
  }
  async onCreated() {
    const response = await fetch("https://randomuser.me/api/?results=100&nat=gb&inc=name")
    const jsonData = await response.json()
    this.state.options = jsonData.results.map(r => `${r.name.first} ${r.name.last}`)
  }
  registerTemplate() {
    return `
      <div class="autocomplete__container">
        <h2>Search for a name</h2>
        <div class="autocomplete__input-container">
          <input 
            type="input" 
            value="${this.state.searchTerm}"
            class="autocomplete__input"
            data-on="input:handleChange"
          />
          ${
            this.state.selected
              ? `<div class="autocomplete__options-container">
                  <div class="autocomplete__options">
                    ${this.state.filteredOptions.map(p => this.optionFragment(p)).join("")}
                  </div>
                </div>`
              : ""
          }
        </div>
      </div>
    `
  }
  optionFragment(option) {
    return `
      <div data-on="click:handleSelect" class="autocomplete__option">${option}</div>
      `
  }
  registerStyle() {
    return `
      .autocomplete__container {
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 2rem;
        padding: 2rem;
        border-radius: 1rem;
        position: relative;
      }
      .autocomplete__input-container {
        width: 100%;
        position: relative;
      }
      .autocomplete__input {
        padding: 0.5rem;
        font-size: 1rem;  
        border-radius: 0.5rem;
        border: none;
        width: 100%;
        box-sizing: border-box;
      }
      .autocomplete__options-container {
        margin-top: 0.5rem;
        position: absolute;
        width: 100%;
        background-color: ${colorTheme.bgAccentSecondary};
        border-radius: 0.5rem;
        max-height: 20rem;
        overflow-y: auto;
      }
      .autocomplete__options {
        border-radius: 0.5rem;
        z-index: 5;
      }
      .autocomplete__option {
        padding: 10px;
        cursor: pointer;
        border-radius: 0.5rem;
        color: ${colorTheme.textAccentSecondary};
      }
      .autocomplete__option:hover {
        background-color: ${colorTheme.bgAccentPrimary};
      }
    `
  }
}
