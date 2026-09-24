import {
  $,
  component$,
  Resource,
  useResource$,
  useStore,
  useStylesScoped$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { SlDialog } from "@shoelace-style/shoelace";
import { AlertService } from "~/services/alertService";
import { ContractService } from "~/services/contractService";
import { LokiProjectService } from "~/services/lokiProjectService";
import { FileCard } from "../file-card/file-card";
import styles from "./../../routes/dashboard/dashboard.scss?inline";
import { NewProjectButton } from "./newProjectButton";
import { OrganizationService } from "~/services/organizationService";
import { DisabledCard } from "./disabledCard";

interface RecentsSectionProps {
  isGitHubConnected: boolean | null;
  repos: [];
}

export const RecentsSection = component$<RecentsSectionProps>((props) => {
  useStylesScoped$(styles);
  const nav = useNavigate();
  const contracts = useStore({ list: [] });
  const dialog = useStore<{ element: Element | null }>({ element: null });
  const openDialogButton = useStore<{ element: Element | null }>({
    element: null,
  });
  const githubProjects = useStore<{ list: any[] }>({ list: [] });
  const allProjects = useStore<{ list: any[] }>({ list: [] });

  const projects = useResource$(async () => {
    try {
      // Gets Github projects from backend.
      const response = await LokiProjectService.getLokiProjects();
      if (response.data) {
        githubProjects.list = await Promise.all(
          response.data.map(async (obj: any) => {
            // githubProjects.list = await response.data.map(async (obj: any) => {
            const date = new Date(obj.createdAt);
            const formattedDate = ` ${date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}`;

            // If the project has an organizationId, check if the owner is subscribed
            if (obj.organizationId) {
              const isSubscribedResponse =
                await OrganizationService.ownerIsSubscribed(
                  obj.organizationId.toString()
                );

              let isSubscribed = isSubscribedResponse.data;
              let isSubscribedBool;

              // Explicitly cast isSubscribed to string before converting. I have to do this because it seems the LokiClient always causes the response to be JSON.stringified (I haven't tested this, but that's what ChatGPT told me).
              if (typeof isSubscribed === "string") {
                isSubscribedBool =
                  (isSubscribed as string).toLowerCase() === "true";
              }

              return {
                ...obj,
                createdAtFormatted: formattedDate,
                isGithubProject: true,
                isSubscribed: isSubscribedBool,
              };
            }

            return {
              ...obj,
              createdAtFormatted: formattedDate,
              isGithubProject: true,
            };
          })
        );

        // Populate allProjects with the first 4 projects from githubProjects
        allProjects.list = [...allProjects.list, ...githubProjects.list]
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 4);
      }
    } catch (error: any) {
      AlertService.notifyError("Error getting Loki Projects!! " + error);
    }

    try {
      // Gets non-Github projects from backend.
      const response = await ContractService.getContracts();
      if (!response.status.toString().startsWith("2")) {
        console.error("Error getting Contracts", response);
        return;
      }

      const c = response.data;
      contracts.list = c.map((obj: any) => {
        const date = new Date(obj.createdAt);
        const formattedDate = ` ${date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`;
        return {
          ...obj,
          createdAtFormatted: formattedDate,
          isGithubProject: false,
        };
      });

      // Populate allProjects with the first 4 projects from contracts.
      allProjects.list = [...allProjects.list, ...contracts.list]
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 4);

      // Gets the dialog and open button elements and adds event listeners.
      const dialogSelector = "#new-project-dialog";
      dialog.element = document.querySelector(dialogSelector);
      const buttonOpenDialogSelector = "#open-button";
      openDialogButton.element = document.querySelector(
        buttonOpenDialogSelector
      );

      openDialogButton.element?.addEventListener("click", () =>
        (dialog.element as any)?.show()
      );

      // Prevent the dialog from closing when the user clicks on the overlay
      dialog.element?.addEventListener("sl-request-close", (event) => {
        if ((event as any).detail.source === "overlay") {
          event.preventDefault();
        }
      });
    } catch (error) {
      AlertService.notifyError("Error getting projects!" + error);
      return;
    }
  });

  const orgName = $(async (orgId: number) => {
    try {
      const response = await OrganizationService.getOrganization(
        orgId.toString()
      );
      if (!response.status.toString().startsWith("2")) {
        console.error("Error getting Organization", response);
        return;
      }
      return response.data.name;
    } catch (error) {
      return;
    }
  });

  return (
    <Resource
      value={projects}
      onPending={() => <p>Loading...</p>}
      onResolved={() => (
        <div q:slot="content">
          {contracts.list.length === 0 && githubProjects.list.length === 0 ? (
            <div class="recents-no-projects">
              <sl-icon class="folder-icon" src="/icons/i-loki-folder.svg" />
              <div>Recent projects will show up here</div>
              <NewProjectButton
                isGitHubConnected={props.isGitHubConnected}
                repos={props.repos}
                variant={3}
              ></NewProjectButton>
            </div>
          ) : (
            <div class="recents-section">
              {allProjects.list.map((project: any) =>
                project.isGithubProject ? (
                  project.organizationId && !project.isSubscribed ? (
                    <DisabledCard
                      project={project}
                      orgName={orgName}
                      key={project.id}
                    />
                  ) : (
                    <div class="project-card" key={project.id}>
                      <div
                        class="project-card-body-new"
                        onClick$={() => {
                          nav("/project/" + project.id + "/deployments2/");
                        }}
                      >
                        <img
                          width="38"
                          height="53"
                          class="project-placeholder"
                          src="/icons/i-loki-file.svg"
                          alt=""
                        />
                      </div>
                      <div class="project-card-footer">
                        <div class="project-card-footer-left">
                          {project.name}
                          {project.organizationId && (
                            <sl-badge variant="success" pill class="org-badge">
                              {orgName(project.organizationId)}
                            </sl-badge>
                          )}
                          <p class="project-card-text-small">
                            Project {project.id}
                          </p>
                          <p class="project-card-text-small">
                            {project.createdAtFormatted}
                          </p>
                        </div>
                        <div class="project-card-footer-right">
                          <sl-dropdown>
                            <sl-icon-button
                              name="three-dots"
                              label="three-dots"
                              slot="trigger"
                            ></sl-icon-button>
                            <sl-menu>
                              <sl-menu-item
                                onClick$={() => {
                                  const deleteProjectDialog =
                                    document.querySelector(
                                      "#delete-project-dialog"
                                    ) as SlDialog;
                                  deleteProjectDialog.show();
                                }}
                              >
                                Delete
                              </sl-menu-item>
                            </sl-menu>
                          </sl-dropdown>
                          <sl-dialog
                            id="delete-project-dialog"
                            class="dialog-overview"
                          >
                            Are you sure you want to delete this project?
                            <sl-button
                              slot="footer"
                              variant="danger"
                              onClick$={() => {
                                LokiProjectService.deleteLokiProject(project.id)
                                  .then(() => {
                                    allProjects.list = allProjects.list.filter(
                                      (currentProject: any) =>
                                        currentProject.id !== project.id
                                    );
                                    AlertService.notify(
                                      "Project Deleted Successfully"
                                    );
                                  })
                                  .catch((error: any) => {
                                    AlertService.notifyError(
                                      "Error Deleting Project!!" + error
                                    );
                                  });
                              }}
                            >
                              Delete
                            </sl-button>
                          </sl-dialog>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <FileCard
                    key={project.cuid}
                    name={project.name}
                    date={project.createdAtFormatted}
                    cuid={project.cuid}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    />
  );
});
