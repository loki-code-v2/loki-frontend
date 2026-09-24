import { component$, useSignal, useStore, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { SlDialog } from "@shoelace-style/shoelace";
import { AlertService } from "~/services/alertService";
import { GitHubAppInstallationService } from "~/services/gitHub/gitHubAppInstallationService";
import { LokiProjectService } from "~/services/lokiProjectService";
import styles from "./../../routes/dashboard/dashboard.scss?inline";

interface ProjectsSectionProps {
  isGitHubConnected: boolean | null;
  repos: [];
}

export const ProjectsSection = component$<ProjectsSectionProps>((props) => {
  useStylesScoped$(styles);
  const projects = useStore({ data: [] });
  const nav = useNavigate();
  const clickedOnCreateNewProjectWithGitHub = useSignal(false);
  const selectedRepo = useSignal("");
  const createNewProjectDialogLabel = useSignal("Create a new project");
  const filteredRepos = useStore<{ value: any[] }>({ value: props.repos });
  const isUserAdminOfOrganization = useStore({ value: false });
  const organization = useStore<{ value: any }>({ value: null });

  useVisibleTask$(async () => {
    LokiProjectService.getLokiProjects()
      .then((response: any) => {
        if (response.data) {
          projects.data = response.data;
        }
      })
      .catch((error: any) => {
        AlertService.notifyError("Error getting Loki Projects!!" + error);
      });

    const createNewProjectButton = document.querySelector(
      "#create-new-project-button"
    )!;

    const createProjectDialog = document.querySelector(
      "#create-project-dialog"
    )!;
    createProjectDialog.addEventListener("sl-after-hide", () => {
      clickedOnCreateNewProjectWithGitHub.value = false;
      createNewProjectDialogLabel.value = "Create a new project";
    });
    createNewProjectButton.addEventListener("click", () => {
      (createProjectDialog as SlDialog)?.show();
    });
  });



  useVisibleTask$(({ track }) => {
    track(() => clickedOnCreateNewProjectWithGitHub.value);
    if (clickedOnCreateNewProjectWithGitHub.value) {
      filteredRepos.value = props.repos;
      const searchRepoInput = document.querySelector(
        "#search-repo-input"
      )! as HTMLInputElement;
      searchRepoInput.addEventListener("sl-input", (e) => {
        if (e.target) {
          const target = e.target as HTMLInputElement;
          filteredRepos.value = props.repos.filter((i: any) =>
            i.includes(target.value)
          );
        }
      });
    }
  });

  return (
    <>
      <sl-card class="fill-available-width">
        <div slot="header">Projects</div>
        {projects.data.length === 0 ? (
          <div class="empty-state subtle-text">
            <div class="empty-state-title">You don't have any projects</div>
          </div>
        ) : (
          <sl-menu class="recent-projects-menu">
            {projects.data.map((i: any, index) => (
              <>
                <sl-menu-item
                  key={index}
                  onClick$={() => {
                    nav(`/project/${i.id}`);
                  }}
                >
                  {i.name}
                </sl-menu-item>
                <sl-divider style="--spacing: 0;"></sl-divider>
              </>
            ))}
          </sl-menu>
        )}
      </sl-card>
      <sl-button id="create-new-project-button">Create new Project</sl-button>
      <sl-dialog
        label={createNewProjectDialogLabel.value}
        id={`create-project-dialog`}
        class={`loki-dialog`}
      >
        {clickedOnCreateNewProjectWithGitHub.value ? (
          <>
            <sl-input
              placeholder="Search repository by name"
              size="small"
              id="search-repo-input"
            >
              <sl-icon name="search" slot="prefix"></sl-icon>
            </sl-input>
            <div class="repos-list pointer">
              {filteredRepos.value.map((i: any, index) => (
                <>
                  <div
                    key={index}
                    class="repos-list-item"
                    onClick$={() => {
                      selectedRepo.value = i;
                    }}
                  >
                    {i}
                    {selectedRepo.value === i && (
                      <img
                        width="21"
                        height="26"
                        src="/icons/i-loki-check.svg"
                        title="check-repo-icon"
                        class="check-repo-icon"
                      ></img>
                    )}
                  </div>
                </>
              ))}
            </div>
            {selectedRepo.value !== "" && (
              <>
                <div class="flex-column">
                  <sl-button
                    slot="footer"
                    variant="primary"
                    onClick$={() => {
                      LokiProjectService.createLokiProject(
                        selectedRepo.value,
                        selectedRepo.value
                      )
                        .then((response: any) => {
                          nav(`/project/${response.data.id}`);
                        })
                        .catch((error: any) => {
                          AlertService.notifyError(
                            "Error creating project!" + error
                          );
                        });
                    }}
                    style={{ width: "100%" }}
                  >
                    Create Project
                  </sl-button>
                  {isUserAdminOfOrganization.value && (
                    <sl-button
                      slot="footer"
                      variant="primary"
                      onClick$={() => {
                        LokiProjectService.createLokiOrganizationProject(
                          selectedRepo.value,
                          selectedRepo.value,
                          organization.value.id
                        )
                          .then((response: any) => {
                            nav(`/project/${response.data.id}`);
                          })
                          .catch((error: any) => {
                            AlertService.notifyError(
                              "Error creating project!" + error
                            );
                          });
                      }}
                      style={{ width: "100%" }}
                    >
                      Create Organization Project
                    </sl-button>
                  )}
                </div>
              </>

            )}
          </>
        ) : (
          <>
            <div class="create-project-options">
              {/* <div
                class="create-project-container flex-column pointer"
                onClick$={() => {
                  nav("/templates");
                }}
              >
                <div class="icon-container">
                  <sl-icon src="/icons/i-loki-new-file.svg"></sl-icon>
                </div>
                <span class="create-project-title">Template</span>
                <span class="create-project-subtitle">
                  Create a new project using one of our templates
                </span>
              </div> */}
              <div
                class="create-project-container flex-column"
                onClick$={() => {
                  clickedOnCreateNewProjectWithGitHub.value = true;
                  createNewProjectDialogLabel.value = "Select Repository";
                }}
              >
                <div class="icon-container">
                  <sl-icon src="/icons/i-loki-octocat.svg"></sl-icon>
                </div>
                <span class="create-project-title">GitHub</span>
                <span class="create-project-subtitle">
                  Sync your project to a Github repository to collaborate with
                  your team.
                </span>
                {!props.isGitHubConnected && (
                  <sl-button
                    slot="footer"
                    variant="primary"
                    onClick$={() => {
                      GitHubAppInstallationService.getGitHubAppInstallationToken()
                        .then((response: any) => {
                          // the token in the response will contain a redirect URI that will be used when
                          // the user finishes the insllation on github.com and is redirected to lokicode.app/github-callback
                          // when the user access lokicode.app/github-callback a request will be sent to the backend to verify the redirect URI
                          // if the redirect URI received points to localhost:3000/github-callback then we will redirect the user to the right url in development
                          location.href = `${import.meta.env.VITE_GITHUB_APP_URL
                            }/installations/new?state=${response.data}`;
                        })
                        .catch((error: any) => {
                          AlertService.notifyError(
                            "Error connecting to GitHub!" + error
                          );
                        });
                    }}
                    style={{ width: "100%" }}
                  >
                    Connect With GitHub
                  </sl-button>
                )}
              </div>
            </div>
          </>
        )}
      </sl-dialog>
    </>
  );
});