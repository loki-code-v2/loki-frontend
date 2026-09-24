import type { QRL } from "@builder.io/qwik";
import { $, component$, useSignal, useStore, useVisibleTask$ } from "@builder.io/qwik";
import type { SlDialog } from "@shoelace-style/shoelace";
import { GitHubActionsService } from "~/services/gitHub/gitHubArtifactsService";
import ArtifactItem from "./artifactItem";

interface ArtifactListProps {
  projectId: string;
  workflowRunId: string;
  onSelectedArtifact$?: QRL<(artifact: any) => void>;

}
export default component$<ArtifactListProps>(({
  projectId,
  workflowRunId,
  onSelectedArtifact$
}) => {

  const isDialogVisible = useStore<{ visible: boolean }>({ visible: false });

  const randomId = useSignal(Math.random().toString(36).substring(7));

  const selectedArtifact = useStore<{ artifactId: string }>({ artifactId: "" });

  const artifacts2 = useStore<{ artifacts: any[] }>({ artifacts: [] });

  // const artifacts = useResource$<
  //   {
  //     id: string;
  //     name: string;
  //     size_in_bytes: string;
  //     download_url: string;
  //     url: string;
  //     created_at: string;
  //     expires_at: string;
  //     expired: boolean;
  //   }[]
  // >(async ({ track }) => {
  //   track(() => isDialogVisible.visible);
  //   // TODO: needs to fix this, the request is being made on the client side
  //   return GitHubActionsService.getWorkflowRunArtifactsServer(projectId, workflowRunId).then((res) => {
  //     return res.artifacts.map((a: any) => {
  //       const sizeInKB = (a.size_in_bytes / 1024).toFixed(2) + ' KB';
  //       const sizeInMB = (a.size_in_bytes / (1024 * 1024)).toFixed(2) + ' MB';

  //       const size = a.size_in_bytes < 1024 * 1024 ? sizeInKB : sizeInMB;

  //       const createdAt = new Date(a.created_at).toLocaleString();
  //       const expiresAt = new Date(a.expires_at).toLocaleString();

  //       return {
  //         id: a.id,
  //         name: a.name,
  //         size_in_bytes: size,
  //         download_url: a.archive_download_url,
  //         url: a.url,
  //         created_at: createdAt,
  //         expires_at: expiresAt,
  //         expired: a.expired,
  //       };
  //     });
  //   });
  // });

  const handleCardClick = $((artifact: any) => {
    selectedArtifact.artifactId = artifact.id;
    onSelectedArtifact$?.(artifact);
  });



  useVisibleTask$(() => {
    const dialog = document.getElementById(`${workflowRunId}-${randomId.value}`) as SlDialog;
    dialog.addEventListener("sl-show", () => {
      isDialogVisible.visible = true;
    });
  });
  return (
    <>
      <sl-button
        onClick$={() => {
          const dialog = document.getElementById(`${workflowRunId}-${randomId.value}`) as SlDialog;
          dialog.show();
          GitHubActionsService.getWorkflowRunArtifactsServer(projectId, workflowRunId).then((res) => {
            artifacts2.artifacts = res.data.artifacts.map((a: any) => {
              const sizeInKB = (a.size_in_bytes / 1024).toFixed(2) + ' KB';
              const sizeInMB = (a.size_in_bytes / (1024 * 1024)).toFixed(2) + ' MB';

              const size = a.size_in_bytes < 1024 * 1024 ? sizeInKB : sizeInMB;

              const createdAt = new Date(a.created_at).toLocaleString();
              const expiresAt = new Date(a.expires_at).toLocaleString();

              return {
                id: a.id,
                name: a.name,
                size_in_bytes: size,
                download_url: a.archive_download_url,
                url: a.url,
                created_at: createdAt,
                expires_at: expiresAt,
                expired: a.expired,
              };
            });
          });
        }}
      >
        Artifacts
      </sl-button>
      <sl-dialog
        id={`${workflowRunId}-${randomId.value}`}
        class="loki-dialog"
        label={`Artifacts for workflow run: ${workflowRunId}`}
      >
        <div>
          <div class="flex-column">
            {
              artifacts2.artifacts.length > 0 ? (
                artifacts2.artifacts.map((a: any) => {

                  return (
                    <ArtifactItem
                      artifact={a}
                      key={a.name}
                      projectId={projectId}
                      onCardClick$={handleCardClick}
                      isSelected={selectedArtifact.artifactId === a.id} />
                  )
                })
              ) : (
                <div>No artifacts found</div>
              )
            }
          </div>
        </div>

      </sl-dialog>
    </>);
});