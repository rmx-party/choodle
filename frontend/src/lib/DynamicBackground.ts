import { browser } from "$app/environment";
import { backgroundColour } from "./Configuration";

export const setDynamicBackground = async (bgcolor = backgroundColour) => {
  if (!browser) return;

  let root = document.documentElement;
  root.style.setProperty('--page-background-color', bgcolor);
}
