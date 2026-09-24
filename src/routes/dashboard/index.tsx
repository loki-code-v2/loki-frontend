import {
  component$,
  useSignal,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { useNavigate, type DocumentHead } from "@builder.io/qwik-city";
import type { SlDialog } from "@shoelace-style/shoelace";
import Web3Service from "~/services/web3Service";
import { GithubButton } from "~/components/dashboard-page/githubButton";
import { NewProjectButton } from "~/components/dashboard-page/newProjectButton";
import { RecentsSection } from "~/components/dashboard-page/recentsSection";
import LokiPage from "~/components/loki-page/loki-page";
import { GitHubAppInstallationService } from "~/services/gitHub/gitHubAppInstallationService";
import { UserService } from "~/services/userService";
import styles from "./dashboard.scss?inline";

export const onRequest: RequestHandler = async (event: any) => {
  // make a request to the backend to figure if the user is logged in
  try {
    await UserService.userSession();
  } catch (error) {
    console.log("Error fetching user session", error);
    throw event.redirect(302, `/`);
  }
};

export default component$(() => {
  useStylesScoped$(styles);
  const showGetStarted = useSignal(true);
  const isGitHubConnected = useSignal<boolean | null>(null);
  const gitHubUserData: {
    username: string;
    installationId: string;
    appName: string;
    repos: [];
  } = useStore({
    username: "",
    installationId: "",
    appName: "",
    repos: [],
  });
  const dialogs = useStore({ github: {} });
  const nav = useNavigate();

  useVisibleTask$(async () => {
    // shared singleton — do not create per-route wagmi/web3modal instances
    await Web3Service.getInstance();

    await GitHubAppInstallationService.getUserGitHubAppInstallation()
      .then((response: any) => {
        if (response.data) {
          isGitHubConnected.value = true;
          gitHubUserData.username = response.data.githubUser;
          gitHubUserData.installationId = response.data.installationId;
          gitHubUserData.appName = response.data.appName;
          gitHubUserData.repos = response.data.repos;
        }
      })
      .catch(() => {
        isGitHubConnected.value = false;
      });
  });

  useVisibleTask$(({ track }) => {
    track(() => isGitHubConnected.value);
    if (isGitHubConnected.value) {
      const disconnectGitHubDialog = document.querySelector(
        "#disconnect-github-dialog"
      )!;
      dialogs.github = disconnectGitHubDialog;
      const disconnectGitHubButton = document.querySelector(
        "#disconnect-github-button"
      )!;
      disconnectGitHubButton.addEventListener("click", () => {
        (dialogs.github as SlDialog).show();
      });
    }
  });

  return (
    <>
      <LokiPage title="DASHBOARD">
        <div q:slot="header">
          <NewProjectButton
            isGitHubConnected={isGitHubConnected.value}
            repos={gitHubUserData.repos}
            variant={1}
          ></NewProjectButton>
        </div>
        <div q:slot="content" class="content">
          {showGetStarted.value && (
            <div class="dashboard-row get-started">
              <div class="get-started-header">
                <h4 class="dashboard-row-header-left">Get Started</h4>
                <div
                  class="get-started-header-right"
                  onClick$={() => (showGetStarted.value = false)}
                >
                  Dismiss
                </div>
              </div>
              <div class="get-started-content">
                <div class="get-started-content-item">
                  <div class="get-started-content-item-header">
                    <img title="github-icon" src="/icons/i-loki-github.svg" />
                    <div>Github</div>
                  </div>
                  <div class="get-started-content-item-body">
                    Connecting with GitHub enables you to create new projects in
                    sync with your repositories.
                  </div>
                  <div class="get-started-content-item-footer">
                    <GithubButton
                      isConnected={isGitHubConnected}
                      dialogs={dialogs}
                    ></GithubButton>
                  </div>
                </div>
                <div class="get-started-content-item">
                  <div class="get-started-content-item-header">
                    <img title="wallet-icon" src="/icons/i-loki-wallet.svg" />
                    <div>Wallet</div>
                  </div>
                  <div class="get-started-content-item-body">
                    Connect your wallet to deploy and interact with your smart
                    contracts.
                  </div>
                  <div class="get-started-content-item-footer">
                    <w3m-core-button></w3m-core-button>
                  </div>
                </div>
                <div class="get-started-content-item">
                  <div class="get-started-content-item-header">
                    <img
                      title="new-project-icon"
                      src="/icons/i-loki-new-project.svg"
                    />
                    <div>Create a project</div>
                  </div>
                  <div class="get-started-content-item-body">
                    Create your first project.
                  </div>
                  <div class="get-started-content-item-footer">
                    <NewProjectButton
                      isGitHubConnected={isGitHubConnected.value}
                      repos={gitHubUserData.repos}
                      variant={2}
                    ></NewProjectButton>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div class="dashboard-row">
            <div class="dashboard-row-header-left">
              <h4>Recents</h4>
            </div>
            <RecentsSection
              isGitHubConnected={isGitHubConnected.value}
              repos={gitHubUserData.repos}
            ></RecentsSection>
          </div>
          <div class="dashboard-row">
            <div class="learn-header">
              <h4 class="dashboard-row-header-left">Learn</h4>
              <div class="learn-header-right">
                <sl-button
                  variant="primary"
                  size="small"
                  outline
                  onClick$={() => {
                    nav("https://loki-code.gitbook.io/loki.code-docs/");
                  }}
                >
                  View All
                </sl-button>
              </div>
            </div>
            <div class="learn-content">
              <div class="learn-card" id="learn-github">
                <a
                  href="https://loki-code.gitbook.io/loki.code-docs/quick-start-guide/link-a-github-repository"
                  target="_blank"
                >
                  <img
                    width="260"
                    height="140"
                    title="learn-icon"
                    src="/learn/learn-github-wide.png"
                    class="learn-img"
                  />
                  <div class="learn-card-body">
                    <div class="learn-card-title">Link a Github Repository</div>
                    <div class="learn-card-text">
                      Learn how to connect your GitHub account.
                    </div>
                  </div>
                </a>
              </div>
              <div class="learn-card" id="learn-project">
                <a
                  href="https://loki-code.gitbook.io/loki.code-docs/quick-start-guide/create-a-new-project"
                  target="_blank"
                >
                  <img
                    width="260"
                    height="140"
                    title="learn-icon"
                    src="/learn/learn-project-wide.png"
                    class="learn-img"
                  />
                  <div class="learn-card-body">
                    <div class="learn-card-title">Create a New Project</div>
                    <div class="learn-card-text">
                      Learn how to create your first project.
                    </div>
                  </div>
                </a>
              </div>
              <div class="learn-card" id="learn-deploy">
                <a
                  href="https://loki-code.gitbook.io/loki.code-docs/quick-start-guide/deploy-a-contract"
                  target="_blank"
                >
                  <img
                    width="260"
                    height="140"
                    title="learn-icon"
                    src="/learn/learn-deploy-wide.png"
                    class="learn-img"
                  />
                  <div class="learn-card-body">
                    <div class="learn-card-title">Deploy a Contract</div>
                    <div class="learn-card-text">
                      Learn how to compile and deploy a contract.
                    </div>
                  </div>
                </a>
              </div>
              <div class="learn-card" id="learn-buildbear">
                <a
                  href="https://loki-code.gitbook.io/loki.code-docs/quick-start-guide/make-a-deploy-request"
                  target="_blank"
                >
                  <img
                    width="260"
                    height="140"
                    title="learn-icon"
                    src="/learn/learn-deploy-request-wide.png"
                    class="learn-img"
                  />
                  <div class="learn-card-body">
                    <div class="learn-card-title">Make a Deploy Request</div>
                    <div class="learn-card-text">
                      Learn how to send a deploy request from your project.
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </LokiPage>
    </>
  );
});

export const head: DocumentHead = {
  title: "Dashboard",
};
