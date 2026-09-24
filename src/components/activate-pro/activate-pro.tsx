import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import styles from "./activate-pro.scss?inline";

export const ActivatePro = component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();

  return (
    <div class="activate-pro-card">
      <div class="header">Activate PRO</div>
      <p class="body">Unlock all features available in Loki.code</p>
      <div class="footer">
        <sl-button
          variant="primary"
          class="upgrade-button"
          id="upgrade-button"
          onClick$={() => {
            nav("/subscribe");
          }}
        >
          Upgrade
        </sl-button>
      </div>
    </div>
  );
});
