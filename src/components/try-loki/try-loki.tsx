import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./try-loki.scss?inline";

export const TryLoki = component$(() => {
  useStylesScoped$(styles);

  return (
    <div class="activate-pro-card">
      <div class="header">Demoing for Web3</div>
      <p class="body">
        Easily interact with, test, and demo smart contracts with Loki.code.
      </p>
      <div class="footer">
        <a
          href="https://www.lokicode.io/"
          class="upgrade-button"
          target="_blank"
        >
          <sl-button
            variant="primary"
            class="upgrade-button"
            id="upgrade-button"
          >
            Get started
          </sl-button>
        </a>
      </div>
    </div>
  );
});
