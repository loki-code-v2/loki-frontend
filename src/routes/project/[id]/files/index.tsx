import {
  $,
  Resource,
  component$,
  useResource$,
  useSignal,
  useStore,
  useStylesScoped$,
} from "@builder.io/qwik";
import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";
import { useLocation } from "@builder.io/qwik-city";
import hljs from "highlight.js";
import hljsDefineSolidity from "highlightjs-solidity";
import LokiPage from "~/components/loki-page/loki-page";
import BranchSelector from "~/components/project-page/branchSelector";
import type { TreeItem } from "~/components/project-page/file-tree";
import { FileTree } from "~/components/project-page/file-tree";
import FileView from "~/components/project-page/fileView";
import { AlertService } from "~/services/alertService";
import { GitHubReposService } from "~/services/gitHub/gitHubReposService";
import { LokiProjectService } from "~/services/lokiProjectService";
import { UserService } from "~/services/userService";
import styles from "../project.scss?inline";
import { organizeIntoMap } from "../repodata";

interface SelectedFileI {
  fileName: string;
  path: string;
  contents: string;
  projectId: number | null;
}
export const onRequest: RequestHandler = async (event: any) => {
  // make a request to the backendend to figure if the user is logged in
  try {
    await UserService.userSession();
  } catch (error) {
    console.log("Error fetching user session", error);
    throw event.redirect(302, `/`);
  }
};
export default component$(() => {
  useStylesScoped$(styles);
  const loc = useLocation();
  const projectId = loc.params.id;

  const repoContents = useStore<{ value: any }>({ value: {} });
  const currentCommitSHA = useStore<{ value: string | null }>({ value: null });
  const fileViewLoading = useStore<{ value: boolean | null }>({ value: null });
  const selectedBranch = useSignal<string | null>(null);
  const selectedFilePath = useSignal<string | null>(null);
  const selectedFileContents = useSignal<string | null>(null);
  const selectedFileHighlightedCode = useSignal<string | null>(null);
  // True when the selected file has any import statement (compile button is
  // disabled and a warning shown; the backend enforces the same rule).
  const containsLocalImport = useSignal<boolean>(false);

  const project = useResource$(async () => {
    const reponseData = await LokiProjectService.getLokiProject(
      Number(loc.params.id)
    );
    return reponseData.data;
  });

  const repoContentsResource = useResource$(async () => {
    const responseData = await GitHubReposService.getRepoContents(
      Number(loc.params.id)
    );
    return responseData.data;
  });

  const handleBranchChange = $((branchName: string) => {
    selectedFilePath.value = null;
    selectedFileContents.value = null;
    fileViewLoading.value = true;
    selectedBranch.value = branchName;
    GitHubReposService.getRepoContents(Number(loc.params.id), branchName)
      .then((response) => {
        fileViewLoading.value = false;
        currentCommitSHA.value = response.data.sha;
        repoContents.value = organizeIntoMap(response.data.tree);
        if (selectedFileContents.value && selectedFilePath.value) {
          fileViewLoading.value = true;
          GitHubReposService.getFileContents(
            Number(loc.params.id),
            selectedFilePath.value!,
            branchName
          )
            .then((response) => {
              fileViewLoading.value = false;
              selectedFileContents.value = response.data;
            })
            .catch((error) => {
              fileViewLoading.value = false;
              AlertService.notifyError("Error getting file contents!" + error);
            });
        }
      })
      .catch((error) => {
        fileViewLoading.value = false;
        AlertService.notifyError("Error getting repo contents!" + error);
      });
  });

  // In-browser compilation cannot resolve imports (local files or npm packages),
  // so any import statement disqualifies the file. The backend enforces the same
  // rule before invoking solc.
  const containsImportCheck = $((solidityCode: string) => {
    const importRegex = /^\s*import\s[^;]+;/gm;
    const imports = solidityCode.match(importRegex);
    return imports !== null && imports.length > 0;
  });

  const handleSelectFileChange = $(async (file: SelectedFileI) => {
    selectedFilePath.value = file.path;
    selectedFileContents.value = file.contents;

    // TODO: This can be deleted after Loki.code compilation happens in the browser.
    if (await containsImportCheck(file.contents)) {
      containsLocalImport.value = true;
    } else {
      containsLocalImport.value = false;
    }

    hljsDefineSolidity(hljs);
    hljs.initHighlightingOnLoad();

    const result = hljs.highlight(file.contents, {
      language: "solidity",
    }).value;
    hljs.highlightAll();

    selectedFileHighlightedCode.value = result;
  });

  const handleSelectFileLoading = $((isLoading: boolean) => {
    fileViewLoading.value = isLoading;
  });

  return (
    <LokiPage
      title="FILES"
      projectNavigationMenu={true}
      showNavigationMenu={false}
      projectId={projectId}
    >
      <div q:slot="header" class="right-header">
        <div class="top-warning">
          <sl-icon name="exclamation-triangle"></sl-icon>
          Compiling certain contracts may not be supported at this time. Make a{" "}
          <a href={`/project/${projectId}/deployments2`}>deploy request</a> instead.
        </div>
        Project ID: {projectId}{" "}
        <sl-copy-button value={projectId}></sl-copy-button>
      </div>
      <div q:slot="content" class="main-content">
        <Resource
          value={project}
          onPending={() => <sl-spinner />}
          onRejected={(error) => (
            <div>Error loading project: {error.message}</div>
          )}
          onResolved={(projectDataResponse) => {
            return (
              <>
                <div class="file-tree repository-tree">
                  <span class="project-name">
                    {projectDataResponse.name as string}
                  </span>
                  <BranchSelector
                    projectId={Number(loc.params.id)}
                    onBranchChange$={handleBranchChange}
                  ></BranchSelector>
                  <Resource
                    value={repoContentsResource}
                    onPending={() => <sl-spinner />}
                    onRejected={(error) => (
                      <div>Error loading repo contents: {error.message}</div>
                    )}
                    onResolved={(repoContentsResponse) => {
                      // const repoContent = organizeIntoMap(repoContentsResponse.tree);
                      return (
                        <>
                          <sl-tree>
                            <FileTree
                              tree={repoContentsResponse.tree as TreeItem[]}
                              parentPath=""
                              selectedBranch={selectedBranch.value}
                              projectId={Number(loc.params.id)}
                              onSelectedFileChange$={handleSelectFileChange}
                              onSelectedFileLoading$={handleSelectFileLoading}
                            ></FileTree>
                          </sl-tree>
                        </>
                      );
                    }}
                  ></Resource>
                </div>
                <Resource
                  value={repoContentsResource}
                  onPending={() => <sl-spinner />}
                  onRejected={(error) => (
                    <div>Error loading repo contents: {error.message}</div>
                  )}
                  onResolved={(repoContentsResponse) => {
                    return (
                      <>
                        <FileView
                          filePath={selectedFilePath.value}
                          highlightedCode={selectedFileHighlightedCode.value!}
                          isLoading={fileViewLoading.value!}
                          currentCommitSHA={repoContentsResponse.sha}
                          projectId={Number(loc.params.id)}
                          branch={selectedBranch.value}
                          containsLocalImport={containsLocalImport.value}
                        ></FileView>
                      </>
                    );
                  }}
                ></Resource>
              </>
            );
          }}
        />
      </div>
    </LokiPage>
  );
});

export const head: DocumentHead = {
  title: "Project",
};
