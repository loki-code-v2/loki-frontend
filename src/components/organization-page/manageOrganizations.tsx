import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { OrganizationData } from "~/services/organizationService";
import styles from "./manageOrganizations.scss?inline";
import { OrganizationCard } from "./organizationCard";

interface OrganizationProps {
  organizations: OrganizationData[];
  organizationUpdated: { value: number };
}

export const ManageOrganizations = component$((props: OrganizationProps) => {
  useStylesScoped$(styles);
  return (
    <div class="flex-column padding-5 manage-organizations">
      {props.organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          organization={org}
          organizationUpdated={props.organizationUpdated}
        ></OrganizationCard>
      ))}
    </div>
  );
});
