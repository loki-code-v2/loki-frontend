import type { Signal } from "@builder.io/qwik";
import {
  component$,
  createContextId,
  useContextProvider,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import ClerkService from "~/services/clerk/clerkService";
import globalStyles from "./scss/base/global.scss?inline";

export const UserNameContext =
  createContextId<Signal<string>>("user-name-context");

export default component$(() => {
  const userName = useSignal("");

  useContextProvider(UserNameContext, userName);

  // We do this to ensure that the sessions token(stored in cookies) is always up to date
  // We have some issues that requests are being made with an expired token nad therefore failing
  // This alleviates that issue
  useVisibleTask$(async () => {
    const clerk = await ClerkService.getInstance();

    // Show the signed-in user's email (fallback: full name, then username) in the
    // user menu. The user object loads asynchronously after the instance resolves.
    const updateUserName = () => {
      const user = clerk.user;
      if (user) {
        userName.value =
          user.primaryEmailAddress?.emailAddress ??
          user.fullName ??
          user.username ??
          "User";
      } else if (clerk.session?.user) {
        const su: any = clerk.session.user;
        userName.value =
          su.primaryEmailAddress?.emailAddress ?? su.fullName ?? "User";
      }
    };
    updateUserName();
    try {
      clerk.addListener(updateUserName as any);
    } catch (error) {
      // older clerk-js without addListener - fall back to polling below
    }
    // safety net: a few delayed checks in case the listener misses the load
    [500, 1500, 4000].forEach((delay) => setTimeout(updateUserName, delay));

    setInterval(async () => {
      try {
        await clerk.session?.getToken({
          template: "Loki-API-JWT",
        });
        //console.log("refreshed token", token);
      } catch (error) {
        //console.error("trouble refreshing token", error);
      }
    }, 2000); // 10000 milliseconds = 10 seconds
  });


  // We do this to ensure that the custom elements are loaded before the UI is displayed, this prevents 
  // flash of undefiend custom elements : https://www.abeautifulsite.net/posts/flash-of-undefined-custom-elements/
  useVisibleTask$(async () => {
    await Promise.allSettled([
      customElements.whenDefined("sl-button"),
      customElements.whenDefined("sl-card"),
    ]);
    // the `ready` class so the UI fades in.
    document.body.classList.add("ready");
  });


  useStyles$(globalStyles);

  return (
    <QwikCityProvider>
      <head>
        {
          import.meta.env.VITE_ENVIRONMENT === "production" && (
            <>
              <script
                src="https://js.sentry-cdn.com/a84d2301a01ef069e7744c5bd3159a65.min.js"
                crossOrigin="anonymous"
              ></script>
              <script type='text/javascript' src='/scripts/sentry.js'></script>
            </>
          )
        }

        {import.meta.env.VITE_ENVIRONMENT === "production" && (
          <script type="text/javascript" src="/scripts/hotjar.js"></script>
        )}

        {import.meta.env.VITE_ENVIRONMENT === "production" && (
          <script type="text/javascript" src="/scripts/tawk.js"></script>
        )}
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/shoelace/cdn/themes/light.css" />
        <script
          type="module"
          src="/shoelace/cdn/shoelace.js"
          data-shoelace="/shoelace/cdn"
        ></script>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          type="crossOrigin"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>

        <link rel="stylesheet" href="/dark.css" />
        <RouterHead />
      </head>
      <body lang="en">
        <RouterOutlet />
        <ServiceWorkerRegister />
      </body>
    </QwikCityProvider>
  );
});
