import {
  $,
  component$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { ApiKeyService } from "~/services/apiKeyService";
import styles from "./api-key-single.scss?inline";

interface ApiKeySingleProps {
  tokensArray: any;
  id: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  identifier: string;
}

export const ApiKeySingle = component$((props: ApiKeySingleProps) => {
  useStylesScoped$(styles);

  useVisibleTask$(() => {
    const deleteKeyButton = document.querySelector(
      `#delete-key-button-${props.id}`
    );
    const dialog = document.querySelector(`#delete-key-dialog-${props.id}`);

    const openDialog = async () => {
      (dialog as any)?.show();
    };
    deleteKeyButton?.addEventListener("click", () => openDialog());
  });

  const handleDelete = $((tokenId: string) => {
    ApiKeyService.deleteToken(tokenId)
      .then(() => {
        props.tokensArray.value = props.tokensArray.value.filter(
          (obj: { id: number }) => obj.id !== +tokenId
        );
      })
      .catch((error) => {
        console.log(error);
      });
  });

  return (
    <div key={props.id} class="token">
      <div class="token-left">
        <div class="token-name">{props.name}</div>
        <div class="token-dates">
          <div class="token-created-at">Created at: {new Date(props.createdAt).toLocaleDateString()}</div>
          <div class="token-expires-at">Expires at: {new Date(props.expiresAt).toLocaleDateString()}</div>
          <div class="token-expires-at">{props.identifier + "****"}</div>
        </div>
      </div>
      <div class="token-right">
        <sl-button
          variant="danger"
          outline
          class="delete-key-button"
          id={`delete-key-button-${props.id}`}
        >
          Delete
        </sl-button>
      </div>
      <sl-dialog
        label="Are you sure?"
        class="delete-key-dialog"
        id={`delete-key-dialog-${props.id}`}
      >
        <div>
          By deleting this token, any application using it will stop working.
        </div>
        <sl-button
          class="delete-token-button"
          variant="danger"
          onClick$={() => handleDelete(props.id)}
        >
          Delete Token
        </sl-button>
      </sl-dialog>
    </div>
  );
});
