import { browser } from "$app/environment";
import { pageBackgroundDefault } from "./Configuration";

export const setDynamicBackground = async (bgcolor = pageBackgroundDefault) => {
  if (!browser) return;

  let root = document.documentElement;
  root.style.setProperty("--page-background-color", bgcolor);
};
