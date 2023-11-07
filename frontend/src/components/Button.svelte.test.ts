import {render} from '@testing-library/svelte'
import {describe, expect, it} from 'vitest';

import Button from './Button.svelte'
import SlotTest from './SlotTest.svelte';

describe("Button", () => {
  it("renders the stuff in the slot", () => {
    const {getByTestId} = render(SlotTest, {props: {Component: Button}})

    expect(() => {
      getByTestId('slot')
    }).not.toThrow()
  })

  it("renders the icon on the left by default", () => {
    const rendered = render(SlotTest,
      {props: {Component: Button, icon: 'the-icon'}})

    const button = rendered.getByRole("button")
    const slot = rendered.getByTestId('slot')

    console.log(button.innerHTML)
    expect(button.children[0].getAttribute("src")).toEqual("the-icon")
    expect(button.children[1]).toEqual(slot)
  });

  it("renders the icon on the right when specified", () => {
    const rendered = render(SlotTest,
      {props: {Component: Button, icon: 'the-icon', iconPosition: 'right'}})

    const button = rendered.getByRole("button")
    const slot = rendered.getByTestId('slot')

    expect(button.children[0]).toEqual(slot)
    expect(button.children[1].getAttribute("src")).toEqual("the-icon")
  });

  it("is disabled when offline", () => {
    const rendered = render(Button, {props: {isOnline: false}})

    const button = rendered.getByRole("button")

    expect(button.getAttribute("disabled")).toBeFalsy()
  });
});
