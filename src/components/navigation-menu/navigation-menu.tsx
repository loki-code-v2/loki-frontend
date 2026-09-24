import { component$, useStylesScoped$ } from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import styles from "./navigation-menu.scss?inline";

export const NavigationMenu = component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();

  return (
    <div class="menu-wrapper ">
      <Link class="unstyled-link" href="/dashboard">
        <div
          class={
            loc.url.pathname === "/dashboard/"
              ? "menu-item-active"
              : "menu-item"
          }
        >
          <sl-icon name="stack"></sl-icon>
          <span>Dashboard</span>
        </div>
      </Link>
      <Link class="unstyled-link" href="/projects">
        <div
          class={
            loc.url.pathname === "/projects/" ? "menu-item-active" : "menu-item"
          }
        >
          <img
            width="20"
            height="20"
            src="/icons/i-loki-new-file.svg"
            title="new-file-icon"
          ></img>
          <span>Projects</span>
        </div>
      </Link>

      {/* <Link class="unstyled-link" href="/templates">
        <div
          class={
            loc.url.pathname === "/templates/"
              ? "menu-item-active"
              : "menu-item"
          }
        >
          <img
            width="20"
            height="20"
            src="/icons/i-loki-templates.svg"
            title="templates-icon"
          ></img>
          <span>Templates</span>
        </div>
      </Link> */}
      <Link class="unstyled-link" href="/organization">
        <div
          class={
            loc.url.pathname === "/organization/"
              ? "menu-item-active"
              : "menu-item"
          }
        >
          <sl-icon name="building"></sl-icon>
          <span>Organization</span>
        </div>
      </Link>
      <Link
        class="unstyled-link"
        href="https://loki-code.gitbook.io/loki.code-docs/"
        target="_blank"
      >
        <div class="menu-item">
          <img
            width="20"
            height="20"
            src="/icons/i-loki-books.svg"
            title="templates-icon"
          ></img>
          <span>Learn</span>
        </div>
      </Link>
    </div>
  );
});
