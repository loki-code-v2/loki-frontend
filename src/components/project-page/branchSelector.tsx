import type { QRL } from "@builder.io/qwik";
import { $, component$, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { SlSelect } from "@shoelace-style/shoelace";
import { AlertService } from "~/services/alertService";
import { GitHubReposService } from "~/services/gitHub/gitHubReposService";

type BranchSelectorProps = {
  projectId: number;
  onBranchChange$: QRL<(branchName: string) => void>;
};

export default component$<BranchSelectorProps>(
  ({ projectId, onBranchChange$ }) => {
    const branchSelectorStore = useStore<{
      branches: any[];
      isLoading: boolean;
      error: string | null;
    }>({
      branches: [],
      isLoading: false,
      error: null,
    });

    const selectedBranch = useStore<{ value: string | null }>({ value: null });

    const handleSelectBranch = $((branchName: string) => {
      selectedBranch.value = branchName;
      onBranchChange$(branchName);
    });

    useVisibleTask$(async () => {
      branchSelectorStore.isLoading = true;
      branchSelectorStore.error = null;

      try {
        const response = await GitHubReposService.getBranches(projectId);
        branchSelectorStore.branches = response.data;
      } catch (e) {
        branchSelectorStore.error = "Error getting branches";
        AlertService.notifyError(branchSelectorStore.error);
      } finally {
        branchSelectorStore.isLoading = false;
      }
    });

    //track changes on the isloading
    useVisibleTask$(({ track }) => {
      track(() => branchSelectorStore.isLoading);
      if (!branchSelectorStore.isLoading) {
        if (branchSelectorStore.branches.length > 1) {
          const branchSelector = document.getElementById(
            "branch-selector"
          ) as SlSelect;
          branchSelector.addEventListener("sl-change", (e) => {
            handleSelectBranch(branchSelector.value as string);
          });
        }
      }
    });

    return (
      <>
        {branchSelectorStore.isLoading ? (
          <div>Loading branches...</div>
        ) : branchSelectorStore.error ? (
          <div>{branchSelectorStore.error}</div>
        ) : branchSelectorStore.branches.length === 1 ? (
          <sl-badge variant="neutral">
            {branchSelectorStore.branches[0].name}
          </sl-badge>
        ) : (
          <sl-select placeholder="Branch" id="branch-selector">
            {branchSelectorStore.branches.map((branch, index) => (
              <sl-option key={index} value={branch.name}>
                {branch.name}
              </sl-option>
            ))}
          </sl-select>
        )}
      </>
    );
  }
);
