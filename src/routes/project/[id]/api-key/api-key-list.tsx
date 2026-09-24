import {
  $,
  component$,
  Resource,
  useResource$,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import { ApiKeyService } from "~/services/apiKeyService";
import styles from "./api-key-list.scss?inline";
import { ApiKeySingle } from "./api-key-single";

interface ApiKeyListProps {
  projectId: string;
  apiKeyGenerated: { value: number };
}

export const ApiKeyList = component$((props: ApiKeyListProps) => {
  useStylesScoped$(styles);
  const tokens = useStore({
    value: [],
  });

  const fetchTokensResource = useResource$(async ({ track }) => {
    track(() => props.apiKeyGenerated.value);
    const response = await ApiKeyService.fetchKeys(props.projectId);
    tokens.value = response.data;
    return response.data;
  });

  const handleDelete = $((tokenId: string) => {
    ApiKeyService.deleteToken(tokenId)
      .then(() => {
        tokens.value = tokens.value.filter(
          (obj: { id: number }) => obj.id !== +tokenId
        );
      })
      .catch((error) => {
        console.log(error);
      });
  });

  return (
    <div>
      <Resource
        value={fetchTokensResource}
        onPending={() => <sl-spinner />}
        onRejected={(error) => (
          <div>Error loading resource: {error.message}</div>
        )}
        onResolved={() => (
          <div class="tokens-list">
            {tokens.value.map((token: any) => (
              <div key={token.id} class="token">
                <ApiKeySingle
                  tokensArray={tokens}
                  id={token.id}
                  name={token.name}
                  identifier={token.prefix}
                  createdAt={token.createdAt}
                  expiresAt={token.expiresAt}
                />
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
});
