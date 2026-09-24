import {
  $,
  component$,
  useStore,
  useStylesScoped$,
  useVisibleTask$
} from "@builder.io/qwik";
import { useNavigate, type DocumentHead } from "@builder.io/qwik-city";
import { AlertService } from "~/services/alertService";
import ClerkService from "~/services/clerk/clerkService";
import { GitHubAppInstallationService } from "~/services/gitHub/gitHubAppInstallationService";
import styles from "./github-callback.scss?inline";



export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();
  const loading = useStore({ status: "loading" });

  const getUrlParams = $(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      code: urlParams.get("code"),
      state: urlParams.get("state"),
      installationId: urlParams.get("installation_id"),
      setup_action: urlParams.get("setup_action"),
    };
  });

  const redirectToUrl = $((redirect_uri: string | URL, params: { [x: string]: string; }) => {
    const url = new URL(redirect_uri);
    Object.keys(params).forEach((key) => {
      url.searchParams.append(key, params[key]);
    });
    window.location.href = url.toString();
  });

  const postInstallation = $(async (params: { code: string | null; installationId: string; state: string; setup_action: string; }) => {
    try {
      await GitHubAppInstallationService.postGitHubAppInstallation(params);
      loading.status = "success";
      AlertService.notify("GitHub Installation Saved!");
      // Give the toast a moment to be seen, then continue to the dashboard
      // automatically instead of requiring a click.
      setTimeout(async () => {
        await nav("/dashboard");
        window.location.reload();
      }, 1200);
    } catch (error) {
      loading.status = "error";
      AlertService.notifyError("Error saving GitHub Installation!" + error);
    }
  });

  useVisibleTask$(
    async () => {
      const params = await getUrlParams();

      // GitHub App install flow sends installation_id + state (+ setup_action).
      // The OAuth `code` only appears when user-authorization-during-install is
      // enabled on the app, so it must NOT be required here.
      if (!params.installationId || !params.state) {
        console.error("Invalid URL parameters");
        return;
      }

      // Dev-mode origin hop: GitHub hits the public https callback (tunnel), but the
      // user's Clerk session lives on localhost. Bounce to localhost with the same
      // query params so the install save runs against the session that's logged in.
      // Dev-mode origin hop: GitHub must hit the public https callback (tunnel),
      // but the user's Clerk session lives on localhost. If we're executing on a
      // non-local origin, bounce to localhost with the same query params so the
      // install save runs against the session that is actually logged in.
      if (
        import.meta.env.VITE_ENVIRONMENT !== "production" &&
        typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
      ) {
        redirectToUrl("http://localhost:3000/github-callback", {
          code: params.code!,
          installation_id: params.installationId!,
          setup_action: params.setup_action!,
          state: params.state!,
        });
        return;
      }

      try {
        const clerk = await ClerkService.getInstance();
        try {
          const token = await clerk.session?.getToken({
            template: "Loki-API-JWT",
          });
          //console.log("refreshed token", token);
        } catch (error) {
          console.error("trouble refreshing token", error);
        }


        const response = await GitHubAppInstallationService.gitHubAppInstallationRedirectUrl({ state: params.state! });

        if (response.data.redirect_uri !== import.meta.env.VITE_GITHUB_APP_INSTALLATION_CALLBACK_URL) {
          redirectToUrl(response.data.redirect_uri, {
            code: params.code!,
            installation_id: params.installationId!,
            setup_action: params.setup_action!,
          });
        } else {
          await postInstallation({
            code: params.code,
            installationId: params.installationId!,
            state: params.state!,
            setup_action: params.setup_action!,
          });
        }
      } catch (error) {
        loading.status = "error";
        AlertService.notifyError("Error getting GitHub Installation Redirect URL!" + error);
      }
    },
    { strategy: "document-ready" }
  );
  return (
    <>
      {/* We need this here for now because it tells qwik that something is different and it will trigger the usevisibletask. Some times I hate web dev =| */}

      <div class="invisible">GitHub Callback</div>
      <div class="success-card">
        <sl-card>
          <h1>Success!</h1>
          <br></br>
          <div>
            Your Loki.code account is now being linked to your GitHub account
            through the Loki.code GitHub App. You will now able to create new
            projects using your GitHub repositories.
          </div>
          <br></br>

          {loading.status === "loading" ? (
            <sl-spinner></sl-spinner>
          ) : loading.status === "success" ? (
            <>
              <sl-button variant="primary" class="dashboard-button"
                onClick$={async () => {
                  await nav("/dashboard");
                  window.location.reload();
                }}
              >
                <span style="color: white">Go to Dashboard</span>
              </sl-button>
            </>
          ) : (
            <>
              <div>Error!</div>
            </>
          )}
        </sl-card>

      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "GitHub Callback",
};
