import {
  Slot,
  component$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import Header from "../header/header";
import { SideBar } from "../side-bar/side-bar";
import styles from "./loki-page.scss?inline";
import { EmptySidebBar } from "../side-bar/empty-side-bar";

interface LokiPageProps {
  title?: string;
  showNavigationMenu?: boolean;
  projectNavigationMenu?: boolean;
  showSidebar?: boolean;
  projectId?: string;
}

export default component$<LokiPageProps>((props) => {
  const hasShoelaceLoaded = useSignal(true);
  const showNavigationMenu =
    props.showNavigationMenu === undefined || props.showNavigationMenu
      ? true
      : false;
  const projectNavigationMenu =
    props.projectNavigationMenu === undefined
      ? false
      : props.projectNavigationMenu;
  const showSidebar =
    props.showSidebar === undefined ? true : props.showSidebar;
  useStylesScoped$(styles);

  useVisibleTask$(() => {
    // cehck that custom elements are loaded
    // if (window.customElements.get("sl-card")) {
    //   hasShoelaceLoaded.value = true;
    // }
  });

  return (
    <>
      {hasShoelaceLoaded.value && (
        <>
          {showSidebar && (
            <SideBar
              showNavigationMenu={showNavigationMenu}
              projectNavigationMenu={projectNavigationMenu}
              projectId={props.projectId}
            >
              <Slot name="sidebar"></Slot>
            </SideBar>
          )}
          {!showSidebar && <EmptySidebBar></EmptySidebBar>}
          <div class="loki-page__content ">
            <Header title={props.title}>
              <Slot name="header"></Slot>
            </Header>
            <Slot name="content"></Slot>
          </div>
        </>
      )}
    </>
  );
});
