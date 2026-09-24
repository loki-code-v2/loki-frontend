import {
  $,
  component$,
  Resource,
  useResource$,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useNavigate } from "@builder.io/qwik-city";
import type { SlDialog } from "@shoelace-style/shoelace";
import { FileCard } from "~/components/file-card/file-card";
import LokiPage from "~/components/loki-page/loki-page";
import { AlertService } from "~/services/alertService";
import { ContractService } from "~/services/contractService";
import { LokiProjectService } from "~/services/lokiProjectService";
import { NewProjectButton } from "~/components/dashboard-page/newProjectButton";
import { UserService } from "~/services/userService";
import styles from "./projects.scss?inline";
import { OrganizationService } from "~/services/organizationService";
import { DisabledCard } from "~/components/project-card/disabled-card";

interface Project {
  id: number;
  name: string;
  createdAt: string;
  organizationId: number | null;
  isSubscribed?: boolean;
  // Add other properties if necessary
}

export const onRequest: RequestHandler = async (event: any) => {
  // make a request to the backend to figure out if the user is logged in
  try {
    await UserService.userSession();
  } catch (error) {
    console.log("Error fetching user session", error);
    throw event.redirect(302, "/");
  }
};

export default component$(() => {
  const nav = useNavigate();
  const contracts = useStore({ list: [] });
  const dialog = useStore<{ element: Element | null }>({ element: null });
  const openDialogButton = useStore<{ element: Element | null }>({
    element: null,
  });

  const githubProjects = useStore<{ list: Project[] }>({ list: [] });
  useStylesScoped$(styles);

  const projects = useResource$(async () => {
    try {
      const response = await LokiProjectService.getLokiProjects();
      if (response.data) {
        githubProjects.list = await Promise.all(
          response.data.map(async (obj: any) => {
            const date = new Date(obj.createdAt);
            const formattedDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });

            // If the project has an organizationId, check if the owner is subscribed, and update the project object with the isSubscribed property.
            if (obj.organizationId) {
              const isSubscribedResponse =
                await OrganizationService.ownerIsSubscribed(
                  obj.organizationId.toString()
                );

              let isSubscribed = isSubscribedResponse.data;
              let isSubscribedBool;

              // Explicitly cast isSubscribed to string before converting.
              if (typeof isSubscribed === "string") {
                isSubscribedBool =
                  (isSubscribed as string).toLowerCase() === "true";
              }

              return {
                ...obj,
                createdAt: formattedDate,
                isSubscribed: isSubscribedBool,
              };
            }

            return { ...obj, createdAt: formattedDate };
          })
        );
      }
    } catch (error) {
      AlertService.notifyError("Error getting Loki Projects!!" + error);
    }

    try {
      const contractResponse = await ContractService.getContracts();
      if (!contractResponse.status.toString().startsWith("2")) {
        console.error("Error getting Contracts", contractResponse);
        return;
      }

      const c = contractResponse.data;
      contracts.list = c.map((obj: any) => {
        const date = new Date(obj.updatedAt);
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        return { ...obj, updatedAt: formattedDate };
      });

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
    <LokiPage title="PROJECTS">
      <div class="flex" q:slot="header">
        <NewProjectButton
          isGitHubConnected={true}
          repos={[]}
          variant={2}
        ></NewProjectButton>
      </div>
      <div
        class={`main-content ${
          contracts.list.length > 0 || githubProjects.list.length > 0
            ? "project-grid"
            : ""
        }`}
        q:slot="content"
      >
        {contracts.list.length === 0 && githubProjects.list.length === 0 ? (
          <NoProjectsFound></NoProjectsFound>
        ) : (
          <Resource
            value={projects}
            onPending={() => <p>Loading...</p>}
            onResolved={() => (
              <>
                {contracts.list.map((contract: any, index) => (
                  <FileCard
                    name={contract.name}
                    date={contract.updatedAt}
                    cuid={contract.cuid}
                    key={index}
                  ></FileCard>
                ))}
                {githubProjects.list.map((project: Project) =>
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
                          <div class="project-card-title">
                            <div>{project.name}</div>
                            {project.organizationId && (
                              <sl-badge
                                variant="success"
                                pill
                                class="org-badge"
                              >
                                {orgName(project.organizationId!)}
                              </sl-badge>
                            )}
                          </div>
                          <p class="project-card-text-small">
                            Project {project.id}
                          </p>
                          <p class="project-card-text-small">
                            {project.createdAt}
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
                                    githubProjects.list =
                                      githubProjects.list.filter(
                                        (currentProject) =>
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
                )}
              </>
            )}
          />
        )}
      </div>
    </LokiPage>
  );
});

const NoProjectsFound = component$(() => {
  const nav = useNavigate();
  useStylesScoped$(styles);
  return (
    <div class="empty-state">
      <sl-icon name="folder" class="folder"></sl-icon>
      <h3 class="no-projects-title">You don't have any projects</h3>
      <div class="no-projects-description">
        Go to the Dashboard to create a new project
      </div>
      <sl-button
        variant="primary"
        outline
        onClick$={() => {
          nav("/dashboard");
        }}
      >
        Dashboard
      </sl-button>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Projects",
};
