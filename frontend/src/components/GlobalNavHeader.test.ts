import {render} from '@testing-library/svelte'
import {describe, expect, it} from 'vitest';

import GlobalNavHeader from './GlobalNavHeader.svelte'
import handDrawIcon from '$lib/assets/hand-draw.svg'
import listIcon from '$lib/assets/list-icon.svg'

describe("GlobalNavHeader", () => {
  it("renders the left link with the appropriate icon linking to pick", () => {
    const rendered = render(GlobalNavHeader, {props: {logoUrl: "logo-url"}})
    const header = rendered.getByRole("banner")

    let anchor = header.children[0];

    expect(anchor.getAttribute("href")).toEqual("/")
    expect(anchor.children[0].getAttribute("src")).toEqual(handDrawIcon)
  })

  it("renders the the provided logo second", () => {
    const rendered = render(GlobalNavHeader,
      {props: {logoUrl: "logo-url"}})
    const header = rendered.getByRole("banner")

    let image = header.children[1];

    expect(image.getAttribute("src")).toEqual("logo-url")
  });

  it("renders the logo as a link to a destination when supplied", () => {
    const rendered = render(GlobalNavHeader,
      {props: {logoUrl: "logo-url", logoLinkDestination: "link-dest"}})
    const header = rendered.getByRole("banner")

    const anchor = header.children[1];
    const image = anchor.children[0];

    expect(image.getAttribute("src")).toEqual("logo-url")
    expect(anchor.getAttribute("href")).toEqual("link-dest")
  });

  it("renders the right link with the appropriate icon linking to dashboard", () => {
    const rendered = render(GlobalNavHeader,
      {props: {logoUrl: "logo-url"}})
    const header = rendered.getByRole("banner")

    const anchor = header.children[2];
    const image = anchor.children[0];

    expect(image.getAttribute("src")).toEqual(listIcon)
    expect(anchor.getAttribute("href")).toEqual("/dashboard")
  });
})
