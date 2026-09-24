import {
  Resource,
  Slot,
  component$,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { StripeService } from "~/services/stripeService";
import { ActivatePro } from "../activate-pro/activate-pro";
import { NavigationMenuProject } from "../navigation-menu-project/navigation-menu-project";
import { NavigationMenu } from "../navigation-menu/navigation-menu";
import { UserMenu } from "../user-menu/user-menu";
import styles from "./side-bar.scss?inline";

interface SideBarProps {
  showNavigationMenu?: boolean;
  projectNavigationMenu?: boolean;
  projectId?: string;
}

export const SideBar = component$<SideBarProps>((props) => {
  useStylesScoped$(styles);
  const nav = useNavigate();
  const loc = useLocation();

  const showNavigationMenu =
    props.showNavigationMenu === undefined || props.showNavigationMenu
      ? true
      : false;
  const projectNavigationMenu =
    props.projectNavigationMenu === undefined
      ? false
      : props.projectNavigationMenu;

  const checkSubscriptionResource = useResource$(async () => {
    const result = await StripeService.checkSubscription();
    return result.data.userSubscription;
  });
  return (
    <div class="navigation-menu-container ">
      <div class="flex-column flex-1 ">
        <div
          class="flex loki-brand"
          onClick$={() => {
            nav("/dashboard");
          }}
        >
          <img
            width="36"
            height="36"
            src="/icons/i-loki-logo.svg"
            title="loki-logo"
          ></img>
          <h1 class="title">Loki.code</h1>
        </div>
        <Slot></Slot>
        {showNavigationMenu && <NavigationMenu></NavigationMenu>}
        {projectNavigationMenu && (
          <NavigationMenuProject
            projectId={props.projectId!}
          ></NavigationMenuProject>
        )}
      </div>
      {loc.url.pathname !== "/subscribe/" && (
        <Resource
          value={checkSubscriptionResource}
          onPending={() => <sl-spinner />}
          onRejected={(error) => {
            return <div></div>;
          }}
          onResolved={(userSubscription) => {
            return (
              <div>{!userSubscription && <ActivatePro></ActivatePro>}</div>
            );
          }}
        />
      )}
      <UserMenu></UserMenu>
    </div>
  );
});
