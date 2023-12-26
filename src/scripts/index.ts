/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import * as htmx from "htmx.org";
import * as hyperscript from "hyperscript.org";

declare global {
  interface Window {
    htmx: any;
    utils: any;
  }
}

window.htmx = htmx;
hyperscript.browserInit();

const utils = {
  init: () => {
    console.debug("Initializing utils");
    const body: HTMLElement = document.getElementById("body");
    const checkbox: HTMLInputElement = document.getElementById(
      "theme-toggle"
    ) as HTMLInputElement;
    const isDark = window.localStorage.getItem("theme") === "dark";
    checkbox.checked = isDark;

    if (isDark) {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
  },

  toggleTheme: () => {
    const body: HTMLElement = document.getElementById("body");
    const isDark = body.classList.contains("dark");
    console.debug("Toggling theme", isDark);

    if (isDark) {
      body.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    } else {
      body.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    }
  }
};

window.utils = utils;
