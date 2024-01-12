/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import * as htmx from "htmx.org";
import * as hyperscript from "hyperscript.org";
import Cookies from "js-cookie";

declare global {
  interface Window {
    __htmx: any;
    utils: any;
  }
}

window.__htmx = htmx;

const utils = {
  halt: (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  },

  init: async () => {
    console.debug("Initializing utils");
    utils.configureDefaultTheme();

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    Cookies.set("tz", tz);
  },

  configureDefaultTheme: () => {
    const theme = Cookies.get("theme") || "system";
    const html = document.getElementsByTagName("html")[0];
    let isDark =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : theme === "dark";

    if (isDark) {
      html.classList.remove("light", "system");
      document.getElementsByTagName("html")[0].classList.add("dark");
    } else document.getElementsByTagName("html")[0].classList.remove("dark");
  },

  toggleOpenState: (checkboxId: string, descriptionId: string) => {
    const checkbox: HTMLInputElement = document.getElementById(
      checkboxId
    ) as HTMLInputElement;
    checkbox.checked = !checkbox.checked;
    window.__htmx.trigger("#" + descriptionId, "change");
  },

  setTheme: (event: { target: { value: "light" | "dark" | "system" } }) => {
    const theme = event?.target?.value;
    const html: HTMLElement = document.getElementsByTagName("html")[0];
    const options = ["light", "dark", "system"];

    if (!options.includes(theme)) throw new Error("Unknown theme: " + theme);
    Cookies.set("theme", theme);
    utils.configureDefaultTheme();
  }
};

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches }) => {
    utils.configureDefaultTheme();
  });

window.utils = utils;

window.document.addEventListener("DOMContentLoaded", utils.init);

document.addEventListener(
  "astro:page-load",
  () => {
    console.info("astro:page-load");
    utils.init();
  },
  { once: false }
);
