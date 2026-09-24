import {
  $,
  component$,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  OrganizationService,
  type OrganizationData,
} from "~/services/organizationService";
import styles from "./organizationCard.scss?inline";
import { AlertService } from "~/services/alertService";

interface MemberActionsProps {
  organization: OrganizationData;
  memberId?: string;
  inviteeId?: number;
  isMember: boolean;
}

export const MemberActions = component$((props: MemberActionsProps) => {
  useStylesScoped$(styles);
  useVisibleTask$(() => {
    Promise.all([
      customElements.whenDefined("sl-dialog"),
      customElements.whenDefined("sl-button"),
      customElements.whenDefined("sl-input"),
    ]).then(() => {
      // Elements
      const removeBtn = document.querySelector(
        `#remove-btn-${props.organization.id}-${props.memberId}`
      );
      const removeDialog = document.querySelector(
        `#remove-dialog-${props.organization.id}-${props.memberId}`
      );
      const removeDialogBtn = document.querySelector(
        `#remove-dialog-btn-${props.organization.id}-${props.memberId}`
      );
      const leaveButton = document.querySelector(
        `#leave-btn-${props.organization.id}-${props.memberId}`
      );
      const leaveDialog = document.querySelector(
        `#leave-dialog-${props.organization.id}-${props.memberId}`
      );
      const leaveDialogBtn = document.querySelector(
        `#leave-dialog-btn-${props.organization.id}-${props.memberId}`
      );
      const revokeBtn = document.querySelector(
        `#revoke-btn-${props.organization.id}-${props.inviteeId}`
      );
      const revokeDialog = document.querySelector(
        `#revoke-dialog-${props.organization.id}-${props.inviteeId}`
      );
      const revokeDialogBtn = document.querySelector(
        `#revoke-dialog-btn-${props.organization.id}-${props.inviteeId}`
      );

      // Event listeners
      removeBtn?.addEventListener("click", () => (removeDialog as any)?.show());
      removeDialog?.addEventListener("click", async () => {
        (removeDialog as any)?.hide();
      });
      removeDialogBtn?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
        (removeDialog as any)?.hide();
      });

      leaveButton?.addEventListener("click", () =>
        (leaveDialog as any)?.show()
      );
      leaveDialog?.addEventListener("click", async () => {
        (leaveDialog as any)?.hide();
      });
      leaveDialogBtn?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
        (leaveDialog as any)?.hide();
      });

      revokeBtn?.addEventListener("click", () => (revokeDialog as any)?.show());
      revokeDialog?.addEventListener("click", async () => {
        (revokeDialog as any)?.hide();
      });
      revokeDialogBtn?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
        (revokeDialog as any)?.hide();
      });
    });
  });

  const handleRemoveMember$ = $(
    async (orgId: number, memberId: string, isCurrentUserAdmin: boolean) => {
      if (!isCurrentUserAdmin) {
        AlertService.notifyError("Only admins can remove members.");
        return;
      }

      try {
        await OrganizationService.removeMember(orgId, memberId.toString());
        AlertService.notify("Member removed successfully.");
        // Refresh organization data or update local state as necessary
      } catch (error) {
        console.error("Failed to remove member:", error);
        AlertService.notifyError("Failed to remove member. Please try again.");
      }
    }
  );

  const handleLeaveOrganization$ = $(
    async (orgId: number, memberId: string) => {
      try {
        await OrganizationService.leaveOrganization(orgId, memberId.toString());
        AlertService.notify("Left organization successfully.");
        // Refresh organization data or update local state as necessary
      } catch (error) {
        console.error("Failed to leave organization:", error);
        AlertService.notifyError(
          "Failed to leave organization. Please try again."
        );
      }
    }
  );

  const handleRevokeInvitation$ = $(
    async (orgId: number, inviteId: number, isCurrentUserAdmin: boolean) => {
      if (!isCurrentUserAdmin) {
        AlertService.notifyError("Only admins can revoke invites.");
        return;
      }

      try {
        await OrganizationService.revokeOrganizationInvitation(orgId, inviteId);
        AlertService.notify("Invite revoked successfully.");
        // Refresh organization data or update local state as necessary
      } catch (error) {
        console.error("Failed to revoke invite:", error);
        AlertService.notifyError("Failed to revoke invite. Please try again.");
      }
    }
  );

  return (
    <div class="member-actions">
      {/** If the current user is an admin, and the specific row is a member, not an admin, show the remove button. **/}
      {props.isMember === true &&
        props.organization.userRole === "admin" &&
        props.organization.members?.find(
          (member) => member.userId === props.memberId
        )?.role === "member" && (
          <>
            <sl-icon src="/icons/i-loki-bin.svg"></sl-icon>
            <div
              class="remove-btn"
              id={`remove-btn-${props.organization.id}-${props.memberId}`}
            >
              Remove
            </div>
            <sl-dialog
              class="remove-dialog"
              id={`remove-dialog-${props.organization.id}-${props.memberId}`}
              onClick$={() =>
                handleRemoveMember$(
                  props.organization.id,
                  props.memberId!,
                  true
                )
              }
              label="Are you sure?"
            >
              <div>
                <div class="remove-dialog-description">
                  By removing this user, they will not be able to access your
                  organization anymore. You can still invite them back later, if
                  you change your mind.
                </div>
                <sl-button
                  class="remove-dialog-btn"
                  id={`remove-dialog-btn-${props.organization.id}-${props.memberId}`}
                  variant="danger"
                >
                  Remove
                </sl-button>
              </div>
            </sl-dialog>
          </>
        )}
      {props.isMember === true &&
        props.organization.userRole === "member" &&
        props.memberId === props.organization.userId && (
          <>
            <sl-icon src="/icons/i-loki-leave.svg"></sl-icon>
            <div
              class="remove-btn"
              id={`leave-btn-${props.organization.id}-${props.memberId}`}
            >
              Leave
            </div>
            <sl-dialog
              class="leave-dialog"
              id={`leave-dialog-${props.organization.id}-${props.memberId}`}
              label="Are you sure?"
            >
              <div>
                <div class="leave-dialog-description">
                  By leaving this organization, you will not be able to access
                  projects from this organization anymore.
                </div>
                <sl-button
                  class="leave-dialog-btn"
                  id={`leave-dialog-btn-${props.organization.id}-${props.memberId}`}
                  onClick$={() =>
                    handleLeaveOrganization$(
                      props.organization.id,
                      props.memberId!
                    )
                  }
                  variant="danger"
                >
                  Leave
                </sl-button>
              </div>
            </sl-dialog>
          </>
        )}
      {props.isMember === false && (
        <>
          <div
            class="revoke-btn"
            id={`revoke-btn-${props.organization.id}-${props.inviteeId}`}
          >
            <sl-icon src="/icons/i-loki-bin.svg"></sl-icon>
            Revoke
          </div>
          <sl-dialog
            class="revoke-dialog"
            id={`revoke-dialog-${props.organization.id}-${props.inviteeId}`}
            label="Are you sure?"
          >
            <div>
              <div class="revoke-dialog-description">
                By revoking this invitation, the user will not be able to access
                your organization anymore. You can still invite them back later,
                if you change your mind.
              </div>
              <sl-button
                class="remove-dialog-btn"
                id={`revoke-dialog-btn-${props.organization.id}-${props.inviteeId}`}
                variant="danger"
                onClick$={() =>
                  handleRevokeInvitation$(
                    props.organization.id,
                    props.inviteeId!,
                    props.organization.userRole === "admin"
                  )
                }
              >
                Revoke
              </sl-button>
            </div>
          </sl-dialog>
        </>
      )}
    </div>
  );
});
