import type { QRL } from "@builder.io/qwik";
import { $, component$, useStore, useStylesScoped$ } from "@builder.io/qwik";
import { GitHubActionsService } from "~/services/gitHub/gitHubArtifactsService";
import styles from "./artifactItem.scss?inline";

type ArtifactItemProps = {
  artifact: {
    id: string;
    name: string;
    size_in_bytes: string;
    download_url: string;
    url: string;
    created_at: string;
    expires_at: string;
    expired: boolean;
  };
  projectId: string;
  isSelected?: boolean;
  onCardClick$?: QRL<(artifact: any) => void>;
};

export default component$<ArtifactItemProps>(({ artifact, projectId, isSelected, onCardClick$ }) => {
  useStylesScoped$(styles);

  const doesArtifactContainABIandBytecode = useStore<{ visible: boolean | undefined }>({ visible: undefined });

  const artifactData = useStore<{ artifact: any }>({ artifact: {} });


  const handleClick = $(() => {
    // check if data has already been fetched
    if (doesArtifactContainABIandBytecode.visible === false) {
      return;
    }

    if (doesArtifactContainABIandBytecode.visible === true) {
      if (onCardClick$) {
        onCardClick$({ ...artifact, ...artifactData.artifact });
      }
      return;
    }

    // Fetch the data
    GitHubActionsService.getArtifactAbiAndBytecode(projectId, artifact.id).then((res) => {
      if (res.data) {
        // Enable the selection of the card only if the artifact contains an ABI and Bytecode
        doesArtifactContainABIandBytecode.visible = true;
        artifactData.artifact = { ...artifact, ...res.data };
        if (onCardClick$) {
          onCardClick$({ ...artifact, ...artifactData.artifact });
        }
      } else {
        doesArtifactContainABIandBytecode.visible = false;
      }
    }).catch((err) => {
      console.log(err);
      doesArtifactContainABIandBytecode.visible = false;
    });
  });


  return (
    <div class={`artifact-card ${isSelected ? 'selected' : ''}`}
      onClick$={handleClick}
    >
      <div class="flex">
        <div class="flex-column">
          <div class="flex">
            <sl-icon name="box-seam"></sl-icon>
            <p id="artifact-name">{artifact.name}</p>
          </div>
          <div class="flex">
            <sl-icon name="calendar3"></sl-icon>
            <p id="date">{artifact.created_at}</p>
          </div>
          <div class="flex">
            <p id="size">Size:   {artifact.size_in_bytes}</p>
          </div>
          {
            doesArtifactContainABIandBytecode.visible === true ?
              <div class="flex">
                <div class="flex-column">
                  <div class="flex">
                    <sl-icon name="check-circle"></sl-icon>
                    <p id="size">Contains ABI and Bytecode</p>

                  </div>
                  {
                    isSelected ?
                      <div class="flex">
                        <sl-icon name="check-circle"></sl-icon>
                        <p id="size">Selected</p>
                      </div>
                      : null
                  }
                  <div class="flex">
                    <div >
                      <span>ABI</span>
                      <sl-copy-button value={JSON.stringify(artifactData.artifact.abi)} feedback-duration="250">ABI</sl-copy-button>
                    </div>
                    <div >
                      <span>Bytecode</span>
                      <sl-copy-button value={artifactData.artifact.bytecode} feedback-duration="250"></sl-copy-button>
                    </div>
                  </div>
                </div>

              </div>
              : doesArtifactContainABIandBytecode.visible === false ?
                <div class="flex">
                  <sl-icon name="x-circle"></sl-icon>
                  <p id="size">Does not contain ABI and Bytecode</p>
                </div>
                : null
          }
        </div>
      </div>
    </div>
  )
});