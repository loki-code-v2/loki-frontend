import type { QRL } from "@builder.io/qwik";
import { component$, useStore, useTask$ } from "@builder.io/qwik";
import { organizeIntoMap } from "~/routes/project/[id]/repodata";
import { AlertService } from "~/services/alertService";
import { GitHubReposService } from "~/services/gitHub/gitHubReposService";

export interface TreeItem {
  path: string;
  mode: string;
  type: "tree" | "blob";
  sha: string;
  url: string;
  size?: number; // Optional because it's not present on 'tree' type items
}

export interface GitRepositoryTree {
  tree: TreeItem[];
}

interface SelectedFileI {
  fileName: string;
  path: string;
  contents: string;
  projectId: number | null;
}

interface FileTreeProps {
  parentPath: string;
  tree: TreeItem[];
  selectedBranch: string | null;
  projectId: number;
  onSelectedFileChange$: QRL<(file: SelectedFileI) => void>;
  onSelectedFileLoading$: QRL<(isLoading: boolean) => void>;
}

export const FileTree = component$<FileTreeProps>(
  ({
    parentPath,
    tree,
    selectedBranch,
    projectId,
    onSelectedFileChange$,
    onSelectedFileLoading$,
  }) => {
    const children = useStore<{ value: any[] }>({ value: [] });
    const sortedChildren = useStore<{ value: any[] }>({ value: [] });

    useTask$(async () => {
      const map = organizeIntoMap(tree);
      children.value = map!.get(parentPath) || [];
      sortedChildren.value = [...children.value].sort((a, b) => {
        if (a.type === b.type) {
          const pathSegmentsA = a.path.split("/");
          const nameA = pathSegmentsA[pathSegmentsA.length - 1];

          const pathSegmentsB = b.path.split("/");
          const nameB = pathSegmentsB[pathSegmentsB.length - 1];

          return nameA.localeCompare(nameB);
        }

        return a.type === "tree" ? -1 : 1;
      });
    });

    return (
      <>
        {sortedChildren.value.length > 0 && (
          <>
            {sortedChildren.value.map((child, index) => {
              const pathSegments = child.path.split("/");
              const name = pathSegments[pathSegments.length - 1];
              return (
                <sl-tree-item
                  key={index}
                  disabled={
                    child.type === "blob" && name.split(".")[1] !== "sol"
                  }
                  onClick$={() => {
                    if (
                      child.type === "blob" &&
                      child.path.split(".")[1] === "sol"
                    ) {
                      onSelectedFileLoading$(true);
                      GitHubReposService.getFileContents(
                        projectId,
                        child.path,
                        selectedBranch
                      )
                        .then((response) => {
                          onSelectedFileLoading$(false);
                          onSelectedFileChange$({
                            fileName: child.path,
                            path: child.path,
                            contents: response.data,
                            projectId: projectId,
                          });
                        })
                        .catch((error) => {
                          onSelectedFileLoading$(false);
                          AlertService.notifyError(
                            "Error getting file contents!" + error
                          );
                        });
                    }
                  }}
                >
                  {child.type === "tree" ? (
                    <sl-icon name="folder"> </sl-icon>
                  ) : (
                    <sl-icon name="file-earmark-code"></sl-icon>
                  )}
                  {name}
                  <FileTree
                    tree={tree}
                    parentPath={child.path}
                    selectedBranch={selectedBranch}
                    projectId={projectId}
                    onSelectedFileChange$={onSelectedFileChange$}
                    onSelectedFileLoading$={onSelectedFileLoading$}
                  ></FileTree>
                </sl-tree-item>
              );
            })}
          </>
        )}
      </>
    );
  }
);
