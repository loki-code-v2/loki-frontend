import { component$, useSignal, useStylesScoped$ } from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import LokiPage from "~/components/loki-page/loki-page";
import { UserService } from "~/services/userService";
import { ApiKeyGenerator } from "./api-key-generator";
import { ApiKeyList } from "./api-key-list";
import styles from "./api-key.scss?inline";

export const onRequest: RequestHandler = async (event: any) => {
  // make a request to the backendend to figure if the user is logged in
  try {
    await UserService.userSession();
  } catch (error) {
    console.log("Error fetching user session", error);
    throw event.redirect(302, `/`);
  }
};

export default component$(() => {
  const loc = useLocation();
  const projectId = loc.params.id;
  const apiKeyGenerated = useSignal(0);
  useStylesScoped$(styles);

  return (
    <LokiPage
      title="API KEYS"
      projectNavigationMenu={true}
      showNavigationMenu={false}
      projectId={projectId}
    >
      <div q:slot="header" class="right-header">
        Project ID: {projectId}
        <sl-copy-button value={projectId}></sl-copy-button>
      </div>
      <div q:slot="content">
        <div class="api-key-generator-container">
          <ApiKeyGenerator
            projectId={projectId}
            apiKeyGenerated={apiKeyGenerated}
          />
        </div>
        <div class="api-key-list-container">
          <ApiKeyList projectId={projectId} apiKeyGenerated={apiKeyGenerated} />
        </div>
      </div>
    </LokiPage>
  );
});

export const head: DocumentHead = {
  title: "API Keys",
};
