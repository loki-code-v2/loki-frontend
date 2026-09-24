import {
  component$,
  useStylesScoped$,
  useVisibleTask$
} from "@builder.io/qwik";
import { RequestHandler, type DocumentHead } from "@builder.io/qwik-city";
import LokiPage from "~/components/loki-page/loki-page";
import ClerkService from "~/services/clerk/clerkService";
import { UserService } from "~/services/userService";
import styles from "./account-management.scss?inline";

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

  useVisibleTask$(async () => {
    const userButtonComponent =
      document.querySelector<HTMLDivElement>("#user-button")!;
    (await ClerkService.getInstance()).mountUserProfile(userButtonComponent);
  });


  return (
    <>
      {/* We need this here for now because it tells qwik that something is different and it will trigger the usevisibletask. Some times I hate web dev =| */}
      <div class="invisible">Account Management</div>
      <LokiPage title="Account Management">
        <div q:slot="content" id="connect-with-github" class="flex gap-1">
          <div id="user-button"></div>
        </div>
      </LokiPage>
    </>
  );
});

export const head: DocumentHead = {
  title: "Account Management",
};
