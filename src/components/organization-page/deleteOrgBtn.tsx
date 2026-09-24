import {
  $,
  component$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import styles from "./organizationCard.scss?inline";
import {
  OrganizationData,
  OrganizationService,
} from "~/services/organizationService";
import { AlertService } from "~/services/alertService";

interface DeleteOrgBtn {
  organization: OrganizationData;
  organizationUpdated: { value: number };
}

export const DeleteOrgBtn = component$((props: DeleteOrgBtn) => {
  useStylesScoped$(styles);

  useVisibleTask$(() => {
    Promise.all([
      customElements.whenDefined("sl-dialog"),
      customElements.whenDefined("sl-button"),
    ]).then(() => {
      const deleteBtn = document.querySelector(
        `#title-delete-btn-${props.organization.id}`
      );
      const deleteDialog = document.querySelector(
        `#delete-dialog-${props.organization.id}`
      );
      const deleteDialogBtn = document.querySelector(
        `#delete-dialog-btn-${props.organization.id}`
      );

      deleteBtn?.addEventListener("click", () => (deleteDialog as any)?.show());

      deleteDialogBtn?.addEventListener("click", async () => {
        (deleteDialog as any)?.hide();
      });

      deleteDialog?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
        (deleteDialog as any)?.hide();
      });
    });
  });

  const handleDeleteOrg$ = $(async () => {
    try {
      await OrganizationService.deleteOrganization(props.organization.id);
      AlertService.notify("Organization deleted successfully");
      props.organizationUpdated.value++;
    } catch (error) {
      AlertService.notifyError("Failed to delete organization");
      console.error(error);
    }
  });

  return (
    <div class="title-right">
      <sl-button
        id={`title-delete-btn-${props.organization.id}`}
        class="delete-btn"
        variant="danger"
        size="small"
        outline
      >
        Delete Organization
      </sl-button>
      <sl-dialog
        class="delete-dialog"
        id={`delete-dialog-${props.organization.id}`}
        label="Delete Organization"
      >
        <div>
          <div class="delete-description">
            Are you sure? All Organization Projects belonging to this
            Organization will be deleted. This action cannot be undone.
          </div>
          <sl-button
            class="delete-dialog-btn"
            id={`delete-dialog-btn-${props.organization.id}`}
            variant="danger"
            onClick$={() => handleDeleteOrg$()}
          >
            Delete
          </sl-button>
        </div>
      </sl-dialog>
    </div>
  );
});
