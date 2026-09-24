import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import { TryLoki } from "../try-loki/try-loki";
import styles from "./side-bar.scss?inline";

export const EmptySidebBar = component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();

  return (
    <div class="navigation-menu-container">
      <div class="flex-column flex-1">
        <a href="https://www.lokicode.io/" class="flex loki-brand">
          <img
            width="36"
            height="36"
            src="/icons/i-loki-logo.svg"
            title="loki-logo"
          ></img>
          <h1 class="title">Loki.code</h1>
        </a>
        <Slot></Slot>
        <div class="space"></div>
        <TryLoki></TryLoki>
      </div>
    </div>
  );
});
