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

  it("renders the specified icon on the left by default", () => {
    const rendered = render(Button, {props: {icon: "the-icon.png"}})

    expect(rendered.getByAltText("left icon").getAttribute("src")).toEqual("the-icon.png")
  });
});
