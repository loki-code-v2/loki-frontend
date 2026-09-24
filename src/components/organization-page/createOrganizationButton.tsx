import {
  component$,
  useSignal,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { SlDialog } from "@shoelace-style/shoelace";
import { AlertService } from "~/services/alertService";
import { OrganizationService } from "~/services/organizationService";
import styles from "./createOrganizationButton.scss?inline";
import { InviteUsersDialog } from "./inviteUsersDialog";

interface CreateOrganizationButtonProps {
  subscription: any;
  label: string;
  organizationUpdated: { value: number };
}

export const CreateOrganizationButton =
  component$<CreateOrganizationButtonProps>((props) => {
    useStylesScoped$(styles);

    // random id for this component
    const componentId = Math.random().toString(36).substring(7);

    const organizationId = useSignal<number>();

    useVisibleTask$(() => {
      Promise.all([
        customElements.whenDefined("sl-dialog"),
        customElements.whenDefined("sl-button"),
        customElements.whenDefined("sl-input"),
      ]).then(() => {
        const createOrgOpenBtn = document.querySelector(
          `#create-org-btn-${componentId}`
        );

        const createOrgDialog = document.querySelector(
          `#create-org-dialog-${componentId}`
        );
        const createOrgDialogInput = document.querySelector(
          `#create-org-dialog-input-${componentId}`
        );
        const createOrgDialogBtn = document.querySelector(
          `#create-org-dialog-btn-${componentId}`
        );

        // const inviteTeamDialog = document.querySelector(
        //   `#invite-team-dialog-${componentId}`
        // );

        createOrgOpenBtn?.addEventListener("click", () =>
          (createOrgDialog as any)?.show()
        );

        createOrgDialogBtn?.addEventListener("click", async () => {
          try {
            const organizationName = (createOrgDialogInput as any)?.value;
            if (!organizationName) {
              AlertService.notifyError("Organization name is required.");
              return;
            }
            OrganizationService.createOrganization({ name: organizationName })
              .then((response) => {
                organizationId.value = response.data.id;
                props.organizationUpdated.value++;
                AlertService.notify("Organization created successfully.");
                // (inviteTeamDialog as SlDialog)?.show();

                // If I bring back the invite team dialog, get rid of the following line.
                (createOrgDialog as any)?.hide();
              })
              .catch((error) => {
                AlertService.notifyError("Failed to create organization.");
              });
          } catch (error) {
            AlertService.notifyError("Failed to create organization.");
          }
        });
        createOrgDialog?.addEventListener("sl-request-close", (event) => {
          if ((event as any).detail.source === "overlay") {
            event.preventDefault();
          }
        });

        // inviteTeamDialog?.addEventListener("sl-request-close", (event) => {
        //   if ((event as any).detail.source === "overlay") {
        //     event.preventDefault();
        //   }
        //   (createOrgDialog as any)?.hide();
        // });
      });
    });

    return (
      <>
        <sl-button
          class="create-org-btn"
          id={`create-org-btn-${componentId}`}
          variant="primary"
        >
          {props.label}
        </sl-button>
        <sl-dialog
          class="create-org-dialog"
          id={`create-org-dialog-${componentId}`}
          label="Create organization"
        >
          <sl-input
            id={`create-org-dialog-input-${componentId}`}
            placeholder="Organization name"
          ></sl-input>
          <div class="create-org-dialog-description">
            This name will be displayed when inviting new members to your
            organization.
          </div>
          <sl-button
            class="create-org-dialog-btn"
            id={`create-org-dialog-btn-${componentId}`}
            variant="primary"
          >
            Create
          </sl-button>
          {/* <sl-dialog
            class="invite-team-dialog"
            id={`invite-team-dialog-${componentId}`}
            label="Invite your team"
          >
            <InviteUsersDialog
              numberOfLicenses={props.subscription.quantity}
              organizationId={organizationId.value!}
            />
          </sl-dialog> */}
        </sl-dialog>
      </>
    );
  });
