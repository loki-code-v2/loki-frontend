import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./../../routes/dashboard/dashboard.scss?inline";

// I had to make a bunch of optional properties because both the RecentsSection and Projects components use this component, and they pass in slightly different Project objects.
interface Project {
  id: number;
  name: string;
  createdAt: string;
  organizationId: number | null;
  isSubscribed: boolean;
  createdAtFormatted: string;
  isGithubProject: boolean;
  // Add other properties if necessary
}

interface RecentsSectionProps {
  project: Project;
  orgName: (orgId: number) => Promise<string | undefined>;
}

export const DisabledCard = component$<RecentsSectionProps>(
  ({ project, orgName }: RecentsSectionProps) => {
    useStylesScoped$(styles);

    return (
      <div class="project-card" key={project.id} style={{ opacity: 0.5 }}>
        <div class="project-card-body-new-disabled">
          <img
            width="38"
            height="53"
            class="project-placeholder"
            src="/icons/i-loki-file.svg"
            alt=""
          />
          <span class="expired-msg">Owner's subscription has expired</span>
        </div>
        <div class="project-card-footer">
          <div class="project-card-footer-left">
            <div class="project-card-title">
              <div>{project.name}</div>
              {project.organizationId && (
                <sl-badge variant="success" pill class="org-badge">
                  {orgName(project.organizationId)}
                </sl-badge>
              )}
            </div>
            <p class="project-card-text-small">Project {project.id}</p>
            <p class="project-card-text-small">{project.createdAtFormatted}</p>
          </div>
          <div class="project-card-footer-right"></div>
        </div>
      </div>
    );
  }
);
