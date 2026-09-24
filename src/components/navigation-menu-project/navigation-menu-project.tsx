import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import styles from "./navigation-menu-project.scss?inline";

interface NavigationMenuProjectProps {
  projectId: string;
}
export const NavigationMenuProject = component$<NavigationMenuProjectProps>(
  (props) => {
    useStylesScoped$(styles);
    const loc = useLocation();
    return (
      <div class="menu-wrapper">
        <Link class="unstyled-link" href={`/project/${props.projectId}/files`}>
          <div
            class={
              loc.url.pathname.startsWith(`/project/${props.projectId}/files`)
                ? "menu-item-active"
                : "menu-item"
            }
          >
            <img
              height="24"
              width="24"
              src="/icons/i-loki-new-file.svg"
              title="new-file-icon"
            ></img>
            <span>Files</span>
          </div>
        </Link>

        <Link
          class="unstyled-link"
          href={`/project/${props.projectId}/deployments2`}
        >
          <div
            class={
              loc.url.pathname === `/project/${props.projectId}/deployments2/`
                ? "menu-item-active"
                : "menu-item"
            }
          >
            <img
              height="24"
              width="24"
              src="/icons/i-loki-deploy.svg"
              title="learn-icon"
            ></img>
            <span>Deploy</span>
          </div>
        </Link>

        <Link
          class="unstyled-link"
          href={`/project/${props.projectId}/api-key`}
        >
          <div
            class={
              loc.url.pathname === `/project/${props.projectId}/api-key/`
                ? "menu-item-active"
                : "menu-item"
            }
          >
            <img
              height="24"
              width="24"
              src="/icons/i-loki-key.svg"
              title="key-icon"
            ></img>
            <span>API Keys</span>
          </div>
        </Link>
      </div>
    );
  }
);
