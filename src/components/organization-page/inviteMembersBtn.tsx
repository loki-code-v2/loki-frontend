import {
  $,
  component$,
  Resource,
  useResource$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import styles from "./organizationCard.scss?inline";
import {
  OrganizationData,
  OrganizationService,
} from "~/services/organizationService";
import { SlInput } from "@shoelace-style/shoelace";
import { AlertService } from "~/services/alertService";

interface InviteMembersBtnProps {
  organization: OrganizationData;
  capacity: number;
  organizationUpdated: { value: number };
}

export const InviteMembersBtn = component$((props: InviteMembersBtnProps) => {
  useStylesScoped$(styles);

  useVisibleTask$(() => {
    Promise.all([
      customElements.whenDefined("sl-dialog"),
      customElements.whenDefined("sl-button"),
      customElements.whenDefined("sl-input"),
    ]).then(() => {
      // Elements
      const titleInviteBtn = document.querySelector(
        `#title-invite-btn-${props.organization.id}`
      );
      const inviteDialog = document.querySelector(
        `#invite-dialog-${props.organization.id}`
      );
      const inviteDialogInput = document.querySelector(
        `#invite-dialog-input-${props.organization.id}`
      );
      const inviteDialogSendBtn = document.querySelector(
        `#invite-dialog-send-btn-${props.organization.id}`
      );

      // Event listeners
      titleInviteBtn?.addEventListener("click", () =>
        (inviteDialog as any)?.show()
      );

      inviteDialogSendBtn?.addEventListener("click", async () => {
        (inviteDialog as any)?.hide();
      });

      inviteDialog?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
        (inviteDialog as any)?.hide();
      });
    });
  });

  const handleInviteMember$ = $(async (orgId: number, emailInput: string) => {
    if (emailInput) {
      try {
        const userAlreadyInvited = await OrganizationService.invitedUser(
          orgId,
          emailInput
        );

        // Cast the returned value to a boolean, because the LokiClient returns it as a string.
        let userAlreadyInvitedBool;
        if (typeof userAlreadyInvited.data === "string") {
          userAlreadyInvitedBool =
            (userAlreadyInvited.data as string).toLowerCase() === "true";
        }

        if (userAlreadyInvitedBool) {
          AlertService.notifyError("User already invited.");
          return;
        }
      } catch (error: any) {
        console.error("Failed to check if user is already invited:", error);
      }

      try {
        await OrganizationService.inviteMember(orgId, emailInput);
        AlertService.notify("Member invited successfully.");
        props.organizationUpdated.value++;
      } catch (error: any) {
        console.log(error);
        // Check if the error message contains a 400 status using RegExp
        const statusCodeMatch = error.message.match(/Status: (\d+)/);
        const statusCode = statusCodeMatch
          ? parseInt(statusCodeMatch[1], 10)
          : null;

        if (statusCode === 400) {
          AlertService.notifyError(
            `${emailInput} must have a Loki.code account to be added to this organization.`,
            undefined,
            20000
          );
        } else {
          AlertService.notifyError("Failed to invite member.");
          console.error("Failed to invite member:", error);
        }
      }
    } else {
      alert("Please enter a valid email address.");
    }
  });

  return (
    <div class="inviteMemberBtn">
      <sl-button
        id={`title-invite-btn-${props.organization.id}`}
        variant="primary"
        size="small"
        disabled={props.organization.members!.length >= props.capacity}
        outline
      >
        Invite members
      </sl-button>
      <sl-dialog
        class="invite-dialog"
        id={`invite-dialog-${props.organization.id}`}
        label="Invite member"
      >
        <div>
          <sl-input
            id={`invite-dialog-input-${props.organization.id}`}
            placeholder="Email address"
            type="email"
          ></sl-input>
          <div class="invite-description">
            Your team member will receive an email shortly with an invite link.
          </div>
          <sl-button
            class="invite-dialog-send-btn"
            id={`invite-dialog-send-btn-${props.organization.id}`}
            variant="primary"
            onClick$={() => {
              const emailInput = (
                document.querySelector(
                  `#invite-dialog-input-${props.organization.id}`
                ) as SlInput
              ).value;

              handleInviteMember$(props.organization.id, emailInput);

              (
                document.querySelector(
                  `#invite-dialog-input-${props.organization.id}`
                ) as SlInput
              ).value = "";
            }}
          >
            Send Invitation
          </sl-button>
        </div>
      </sl-dialog>
      <div class="capacity">
        {props.organization.members!.length} / {props.capacity} members
      </div>
    </div>
  );
});
