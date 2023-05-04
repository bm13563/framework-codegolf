import { Component } from "../../framework.js"
import { Button } from "./atoms/Button.js"

export class Timer extends Component {
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
            ${
              this.state.timerId
                ? this.components.button({
                    text: "Stop",
                    onClick: this.functions.stopTimer,
                  })
                : this.components.button({
                    text: "Start",
                    onClick: this.functions.startTimer,
                  })
            }
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
