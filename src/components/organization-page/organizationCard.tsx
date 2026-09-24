import {
  $,
  component$,
  Resource,
  useResource$,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { OrganizationData } from "~/services/organizationService";
import { OrganizationService } from "~/services/organizationService";
import { MemberActions } from "./memberActions";
import styles from "./organizationCard.scss?inline";
import { InviteMembersBtn } from "./inviteMembersBtn";
import { DeleteOrgBtn } from "./deleteOrgBtn";

interface OrganizationCardProps {
  organization: OrganizationData;
  organizationUpdated: { value: number };
}

export const OrganizationCard = component$((props: OrganizationCardProps) => {
  useStylesScoped$(styles);

  const organizationInvitations = useResource$(async () => {
    const response = await OrganizationService.getOrganizationInvitations(
      props.organization.id
    );
    return response.data;
  });

  const organizationCapacity = useResource$(async () => {
    const response = await OrganizationService.getOrganizationCapacity(
      props.organization.id
    );
    return response.data;
  });

  return (
    <div class="org-container">
      <div class="title">
        <h4 class="title-text">{props.organization.name}</h4>
        <div class="title-right">
          {props.organization.userRole === "admin" && (
            <Resource
              value={organizationCapacity}
              onPending={() => <div>Loading...</div>}
              onRejected={() => <div>Failed to load capacity</div>}
              onResolved={(capacity) => (
                <InviteMembersBtn
                  organization={props.organization}
                  capacity={capacity}
                  organizationUpdated={props.organizationUpdated}
                />
              )}
            />
          )}
          {props.organization.userRole === "admin" && (
            <DeleteOrgBtn
              organization={props.organization}
              organizationUpdated={props.organizationUpdated}
            />
          )}
        </div>
      </div>

      <div class="body">
        {props.organization.members?.map((member) => (
          <div class="member" key={member.userId}>
            <div class="member-avatar">
              <sl-avatar label="Avatar with initials: SL"></sl-avatar>
            </div>
            <div class="member-info">
              <div class="member-title">
                <div class="member-name">{member.userName}</div>
                {member.role === "admin" ? (
                  <sl-badge variant="success">Admin</sl-badge>
                ) : (
                  <sl-badge variant="neutral">Member</sl-badge>
                )}
              </div>
              <div class="member-email">{member.email}</div>
            </div>
            <MemberActions
              organization={props.organization}
              memberId={member.userId}
              isMember={true}
            />
          </div>
        ))}

        {props.organization.invitations?.map((invitation) => (
          <div class="member" key={invitation.id}>
            <div class="member-avatar">
              <sl-avatar
                initials={invitation.email[0].toLocaleUpperCase()}
                label="Avatar with initials: SL"
              ></sl-avatar>
            </div>
            <div class="member-info">
              <div class="member-title">
                <div class="member-name">{invitation.email}</div>
                <sl-badge class="pending-badge" variant="warning">
                  Pending
                </sl-badge>
              </div>
            </div>
            {props.organization.userRole === "admin" && (
              <MemberActions
                organization={props.organization}
                inviteeId={invitation.id}
                isMember={false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
