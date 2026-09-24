import {
  component$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { dark } from "@clerk/themes";
import ClerkService from "~/services/clerk/clerkService";
import styles from "./login-signup-card.scss?inline";

export default component$(() => {
  useStylesScoped$(styles);
  const nav = useNavigate();

  useVisibleTask$(async ({ cleanup }) => {
    const clerk = await ClerkService.getInstance();
    if (clerk.user) {
      nav("/dashboard");
      return;
    }
    // v6: navigate as soon as a session appears (e.g. right after modal sign-in)
    // Poll for session: covers dev-browser trust reloads where Clerk events can be missed
    const timer = setInterval(() => {
      if (clerk.user) {
        clearInterval(timer);
        window.location.assign("/dashboard");
      }
    }, 500);
    cleanup(() => clearInterval(timer));
  });

  return (
    <div class="middle-panel">
      <div class="card">
        <img
          width="80"
          height="80"
          class="login-loki-icon"
          src="/icons/i-loki-logo.svg"
          title="loki-logo"
        ></img>
        <h1>Welcome to Loki.code</h1>
        <p class="caption">Login or create an account to continue</p>
        <div class="flex">
          <sl-button
            onClick$={async () => {
              try {
                console.debug("[loki] Log in clicked");
                const clerk = await ClerkService.getInstance();
                console.debug("[loki] Clerk ready, loaded =", clerk.loaded, "- opening sign-in modal");
                if (clerk.user) {
                  nav("/dashboard");
                  return;
                }
                clerk.openSignIn({
                  forceRedirectUrl: "/dashboard",
                  appearance: {
                    baseTheme: dark,
                  },
                });
              } catch (err) {
                console.error("Sign-in failed to open:", err);
                alert("Sign-in failed to load. Please refresh the page and try again.");
              }
            }}
          >
            Log in
          </sl-button>
          <sl-button
            onClick$={async () => {
              try {
                console.debug("[loki] Sign Up clicked");
                const clerk = await ClerkService.getInstance();
                console.debug("[loki] Clerk ready, loaded =", clerk.loaded, "- opening sign-up modal");
                if (clerk.user) {
                  nav("/dashboard");
                  return;
                }
                clerk.openSignUp({
                  forceRedirectUrl: "/dashboard",
                  appearance: {
                    baseTheme: dark,
                  },
                });
              } catch (err) {
                console.error("Sign-up failed to open:", err);
                alert("Sign-up failed to load. Please refresh the page and try again.");
              }
            }}
          >
            Sign Up
          </sl-button>
        </div>
      </div>
    </div>
  );
});
