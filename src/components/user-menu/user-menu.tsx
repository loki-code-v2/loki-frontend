import {
  component$,
  useContext,
  useStylesScoped$
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { UserNameContext } from "~/root";
import ClerkService from "~/services/clerk/clerkService";
import styles from "./user-menu.scss?inline";

export const UserMenu = component$(
  () => {

    const userName = useContext(UserNameContext);
    const nav = useNavigate();

    useStylesScoped$(styles);


    return (
      <div class="username ">
        <sl-icon name="person"></sl-icon>
        <sl-dropdown>
          <p class="pointer" slot="trigger">
            {userName.value ? userName.value : "User"}
          </p>
          <sl-menu>
            <sl-menu-item
              value="logout"
              onClick$={async () => {

                (await ClerkService.getInstance()).signOut().then(() => {
                  nav("/");
                });
              }}
            >
              Log out
            </sl-menu-item>
            <sl-menu-item value="settings" onClick$={() => {
              nav("/account-management");
            }}>
              Manage Account
            </sl-menu-item>
            <sl-menu-item
              value="subscription"
              onClick$={() => {
                nav("/subscribe");
              }}
            >
              Manage Subscription
            </sl-menu-item>
          </sl-menu>
        </sl-dropdown>
      </div>
    );
  }
);
