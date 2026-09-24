import { component$, useStore, useStylesScoped$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import History from "~/components/deployments-page/history";
import LokiPage from "~/components/loki-page/loki-page";
import Web3ModalButton from "~/components/web3modal-button/Web3ModalButton";
import { UserService } from "~/services/userService";
import styles from "./deployments2.scss?inline";

export interface Argument {
  name: string;
  type: string;
  internalType: string;
  value: string | null;
}

export interface Constructor {
  compilationId: string;
  args: Argument[];
}

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
  useStylesScoped$(styles);
  const loc = useLocation();
  const deploymentsStore = useStore<{ projectId: string | null }>({
    projectId: loc.url.toString().split("project/")[1].split("/")[0],
  });
  return (
    <LokiPage
      title="DEPLOY"
      projectNavigationMenu={true}
      showNavigationMenu={false}
      projectId={deploymentsStore.projectId!}
    >
      <div q:slot="header" class="header">
        <div class="proj-id">
          Project ID: {deploymentsStore.projectId!}
          <sl-copy-button value={deploymentsStore.projectId!}></sl-copy-button>
        </div>
        <Web3ModalButton></Web3ModalButton>
      </div>
      <div q:slot="content" class="main-content">
        <History projectId={deploymentsStore.projectId!} />
      </div>
    </LokiPage>
  );
});
