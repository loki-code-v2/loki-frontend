import {
  Slot,
  component$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import styles from "./template-card.scss?inline";

interface TemplateCardProps {
  name: string;
  description: string;
  icon: string;
  id: number;
  link: string;
}
export const TemplateCard = component$<TemplateCardProps>(
  ({ name, description, icon, id, link }) => {
    useStylesScoped$(styles);

    useVisibleTask$(() => {
      const selector = `#loki-dialog-${id}`;
      const dialog = document.querySelector(selector);

      const openButton = dialog?.nextElementSibling;
      const closeButton = dialog?.querySelector('sl-button[slot="footer"]');

      openButton?.addEventListener("click", () => (dialog as any)?.show());
      closeButton?.addEventListener("click", () => (dialog as any)?.hide());

      // Prevent the dialog from closing when the user clicks on the overlay
      dialog?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
      });
    });

    return (
      <div class="project-card">
        <div class="card-body-wrapper">
          <div class="project-card-body-new">
            <sl-icon-button
              class="project-placeholder icon-size-large"
              src={icon}
            />
          </div>
        </div>
        <div class="project-card-footer">
          <div class="project-description">
            {name}
            <p class="project-card-text-small">{description}</p>
            {/* <p class="template-read-more">Read More...</p> */}
            <div class="flex template-labels">
              <div>
                <sl-icon
                  class="icon-spacing"
                  src="/icons/i-loki-audited.svg"
                ></sl-icon>
                Audited
              </div>
              <div class="pointer" onClick$={() => {
                window.open(link)
              }}>
                <sl-icon
                  class="icon-spacing"
                  src="/icons/i-loki-octocat.svg"
                ></sl-icon>
                Open Source
              </div>
            </div>
            <Slot></Slot>
            <sl-button variant="primary" outline>
              Use this template
            </sl-button>
          </div>
        </div>
      </div>
    );
  }
);
