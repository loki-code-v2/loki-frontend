import {
  component$,
  useStylesScoped$,
  $,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import styles from "./api-key-generator.scss?inline";
import { ApiKeyService } from "~/services/apiKeyService";

interface ApiKeyGeneratorProps {
  projectId: string;
  apiKeyGenerated: { value: number };
}

export const ApiKeyGenerator = component$((props: ApiKeyGeneratorProps) => {
  useStylesScoped$(styles);
  const apiKeyName = useSignal("New Token");
  const apiKey = useSignal("");

  useVisibleTask$(() => {
    const createKeyButton = document.querySelector("#create-key-button");
    const dialog = document.querySelector("#create-key-dialog");

    const openDialog = async () => {
      (dialog as any)?.show();
    };
    createKeyButton?.addEventListener("click", () => openDialog());

    dialog?.addEventListener("sl-request-close", (event) => {
      if ((event as any).detail.source === "overlay") {
        event.preventDefault();
      } else {
        apiKeyName.value = "New token";
        apiKey.value = "";
      }
    });
  });

  const generateKey = $(async () => {
    // Capture the input value directly before generating the key
    const nameInput = document.querySelector("#name-input") as HTMLInputElement;
    if (nameInput) {
      apiKeyName.value = nameInput.value;
    }

    // Proceed with your existing key generation logic
    const response = await ApiKeyService.generateKey(
      apiKeyName.value,
      props.projectId
    );
    apiKey.value = response.data;
    props.apiKeyGenerated.value++;
  });

  return (
    <div class="token-container">
      <div class="header-container">
        <div class="header-container-left">
          <h4 class="token-container-title">Authentication Tokens</h4>
          <div class="token-container-description">
            Manage your CLI authentication tokens
          </div>
        </div>
        <div class="header-container-right">
          <sl-button id="create-key-button" variant="primary" outline>
            Generate new token
          </sl-button>
        </div>
      </div>
      <sl-dialog
        label={apiKeyName.value}
        class="create-key-dialog"
        id="create-key-dialog"
      >
        {!apiKey.value ? (
          <>
            <sl-input id="name-input" placeholder="Token name"></sl-input>
            <div class="create-key-dialog-description">
              Give your token a recognizable name
            </div>
            <sl-button
              class="create-button"
              variant="primary"
              onClick$={generateKey}
            >
              Create
            </sl-button>
          </>
        ) : (
          <>
            <div class="token-description">
              Copy this token and save it in a secure location. After you close
              this dialog, you will not be able to see this token again.
            </div>
            <div class="token-value-header">
              <sl-copy-button class="copy-button" value={apiKey.value}>
                <sl-icon
                  slot="copy-icon"
                  src="/icons/i-loki-copy.svg"
                  class="copy-icon"
                ></sl-icon>
              </sl-copy-button>
            </div>
            <div class="token-value">{apiKey.value}</div>
          </>
        )}
      </sl-dialog>
    </div>
  );
});
