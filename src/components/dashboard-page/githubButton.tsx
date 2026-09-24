import type { Signal } from "@builder.io/qwik";
import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { SlDialog } from "@shoelace-style/shoelace";
import { AlertService } from "~/services/alertService";
import { GitHubAppInstallationService } from "~/services/gitHub/gitHubAppInstallationService";
import styles from "./../../routes/dashboard/dashboard.scss?inline";

interface GithubButtonProps {
  isConnected: Signal<boolean | null>;
  dialogs: any;
}

export const GithubButton = component$<GithubButtonProps>((props) => {
  useStylesScoped$(styles);

  return (
    <div>
      {props.isConnected.value ? (
        <>
          <sl-button
            size="small"
            variant="danger"
            outline
            id="disconnect-github-button"
            class="disconnect-github-button"
          >
            Disconnect Github account
          </sl-button>
          <sl-dialog
            id="disconnect-github-dialog"
            label="Disconnect GitHub"
            class="loki-dialog"
          >
            Are you sure you want to disconnect your GitHub account?
            Disconnecting will delete all projects created with GitHub.
            <div slot="footer" class="flex">
              <sl-button
                variant="danger"
                outline
                class="disconnect-github-button"
                onClick$={() => {
                  GitHubAppInstallationService.disconnectGitHubApp()
                    .then(() => {
                      document.location.reload();
                    })
                    .catch((error: any) => {
                      AlertService.notifyError(
                        "Error disconnecting from GitHub App!" + error
                      );
                    });
                }}
              >
                Disconnect
              </sl-button>
              <sl-button
                variant="primary"
                onClick$={() => {
                  (props.dialogs.github as SlDialog).hide();
                }}
              >
                Stay connected
              </sl-button>
            </div>
          </sl-dialog>
        </>
      ) : props.isConnected.value === null ? (
        <sl-spinner class="disconnect-github-button"></sl-spinner>
      ) : (
        <sl-button
          variant="primary"
          outline
          class="disconnect-github-button"
          onClick$={() => {
            GitHubAppInstallationService.getGitHubAppInstallationToken()
              .then((response: any) => {
                // the token in the response will contain a redirect URI that will be used when
                // the user finishes the insllation on github.com and is redirected to lokicode.app/github-callback
                // when the user access lokicode.app/github-callback a request will be sent to the backend to verify the redirect URI
                // if the redirect URI received points to localhost:3000/github-callback then we will redirect the user to the right url in development
                location.href = `${
                  import.meta.env.VITE_GITHUB_APP_URL
                }/installations/new?state=${response.data}`;
              })
              .catch((error: any) => {
                AlertService.notifyError("Error connecting to GitHub!" + error);
              });
          }}
        >
          Connect Github account
        </sl-button>
      )}
    </div>
  );
});
