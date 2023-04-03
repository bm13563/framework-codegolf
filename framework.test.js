import { jest } from "@jest/globals"
import * as fixtures from "./framework.fixtures"

jest.mock("./framework")

describe("Component", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  test("should mount component to the DOM", () => {
    const component = new fixtures.ComponentWithProps()
    const element = component.mount({ text: "Hello World" }, true)
    element.dataset.test = "test"
    document.body.appendChild(element)

    expect(document.querySelector("[data-test='test']").textContent).toEqual("Hello World")
  })

  test("should re-render when state updates", () => {
    const component = new fixtures.ComponentWithState()
    const element = component.mount({}, true)
    element.dataset.test = "test"
    document.body.appendChild(element)

    expect(document.querySelector("[data-test='test']").textContent).toEqual("Hello World")
    component.state.text = "Hello Test" // proxy updates are asynchronous
    fixtures.waitForNextStateUpdate(component, () =>
      expect(document.querySelector("[data-test='test']").textContent).toEqual("Hello Test"),
    )
  })

  test("should re-render when props update", () => {
    const component = new fixtures.ComponentWithLinkedPropsAndState()
    const element = component.mount({ text: "Hello World" }, true)
    element.dataset.test = "test"
    document.body.appendChild(element)

    expect(document.querySelector("[data-test='test']").textContent).toEqual("Hello World")
    component.mount({ text: "Hello Test" }, true)
    expect(document.querySelector("[data-test='test']").textContent).toEqual("Hello Test")
  })
})
