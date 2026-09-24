import { component$, useSignal, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { AlertService } from "~/services/alertService";
import { OrganizationService } from "~/services/organizationService";
import styles from "./createOrganizationButton.scss?inline";

interface InviteUsersDialogProps {
  numberOfLicenses: number;
  organizationId: number;
}

export const InviteUsersDialog = component$<InviteUsersDialogProps>((props) => {
  useStylesScoped$(styles);
  const componentId = Math.random().toString(36).substring(7);
  const isInviteButtonDisabled = useSignal<boolean>(false);

  useVisibleTask$(() => {
    Promise.all([
      customElements.whenDefined("sl-button"),
      customElements.whenDefined("sl-input"),
    ]).then(() => {
      // Updated to append componentId
      const sendBtn = document.querySelector(`#invite-team-dialog-send-btn-${componentId}`);
      sendBtn?.addEventListener("click", async () => {
        const inputFieldsMap: any = {};
        Array.from({ length: props.numberOfLicenses }).forEach((_, index) => {
          const inputField = document.querySelector(`#invite-team-dialog-input-${index}-${componentId}`);
          if (inputField) {
            inputFieldsMap[`input-${index}`] = (inputField as any).value;
          }
        });
        // create an array of email addresses
        const emailAddresses = Object.values<string>(inputFieldsMap);
        // ignore empty email addresses
        const nonEmptyEmails = emailAddresses.filter((email: string) => email.length > 0);
        // validate email addresses
        const validEmails = nonEmptyEmails.filter((email: string) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        });
        // if there are invalid email addresses, notify the user
        if (nonEmptyEmails.length !== validEmails.length) {
          // include the invalid email addresses in the error message
          const invalidEmails = nonEmptyEmails.filter((email: string) => {
            return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          });
          AlertService.notifyError(`Invalid email address(es) entered: ${invalidEmails.join(", ")}`);
          return;
        }
        // if there are no valid email addresses, notify the user
        if (validEmails.length === 0) {
          AlertService.notifyError("Please enter at least one valid email address.");
          return;
        }
        // if there are duplicate email addresses, notify the user
        const uniqueEmails = Array.from(new Set(validEmails));
        if (uniqueEmails.length !== validEmails.length) {
          AlertService.notifyError("Duplicate email addresses entered.");
          return;
        }
        // send invite to each email address
        isInviteButtonDisabled.value = true;
        await uniqueEmails.forEach((email: string) => {
          OrganizationService.inviteMember(props.organizationId, email).then((response) => {
            AlertService.notify(`Invite sent to ${email}`);
          }).catch((error) => {
            AlertService.notifyError(`Failed to send invite to ${email}`);
          });
        });
        isInviteButtonDisabled.value = false;
        // hide the dialog
        const inviteTeamDialog = document.querySelector(`#invite-team-dialog-${componentId}`);
        (inviteTeamDialog as any)?.hide();
      });
    });
  });

  return (
    <>
      <div class="flex-column">
        <div class="invite-team-dialog-description-1">
          Your organization has been created, invite some team members to join it.
        </div>
        {Array.from({ length: props.numberOfLicenses }).map((_, index) => (
          <sl-input
            key={index}
            id={`invite-team-dialog-input-${index}-${componentId}`}
            type="email"
            placeholder="Email address"
          ></sl-input>
        ))}
        <div class="invite-team-dialog-description-2">
          Your team members will receive an email shortly, with an invite link.
        </div>
        <sl-button
          class="invite-team-dialog-send-btn"
          id={`invite-team-dialog-send-btn-${componentId}`}
          disabled={isInviteButtonDisabled.value}
          variant="primary"
        >
          Send invites
        </sl-button>
        <div class="invite-team-dialog-later-container">
          <div
            class="invite-team-dialog-later-btn"
            id={`invite-team-dialog-later-btn-${componentId}`}
          >
            I'll do it later
          </div>
        </div>
      </div>
    </>
  );
});
