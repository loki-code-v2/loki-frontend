import { component$, useStore, useStylesScoped$ } from "@builder.io/qwik";
import type { SlDialog } from "@shoelace-style/shoelace";
import { RequestStateEnum } from "~/models/request";
import { AlertService, AlertVariant } from "~/services/alertService";
import { LokiProjectService } from "~/services/lokiProjectService";
import styles from "../../routes/project/[id]/project.scss?inline";

export default component$<{
  filePath: string | null;
  highlightedCode: string | undefined;
  isLoading: boolean | null;
  currentCommitSHA: string | null;
  projectId: number;
  branch: string | null;
  containsLocalImport: boolean | undefined;
}>((props) => {
  useStylesScoped$(styles);

  const compilationRequest = useStore<{ state: RequestStateEnum }>({
    state: RequestStateEnum.Undefined,
  });

  return (
    <div class="file-view">
      {!props.filePath ? (
        <div style="flex-grow: 1;" class="grid-center no-selected-file">
          {props.isLoading ? (
            <sl-spinner></sl-spinner>
          ) : (
            <div>Please select a Solidity file</div>
          )}
        </div>
      ) : (
        <>
          {/** TODO: This can be deleted after Loki.code compilation happens in the browser. */}
          {props.containsLocalImport && (
            <div class="compiler-warning">
              Contracts with imports are not supported by in-browser compilation
              yet. Make a{" "}
              <a href={`/project/${props.projectId}/deployments2`}>
                deploy request
              </a>{" "}
              instead.
            </div>
          )}
          <div class="file-view-header flex">
            <div class="flex">
              <img
                width="24"
                height="24"
                class="project-placeholder"
                src="/icons/i-loki-fileview-file.svg"
                alt=""
              />
              {props.isLoading ? (
                <sl-spinner></sl-spinner>
              ) : (
                <>{props.filePath}</>
              )}
            </div>
            <sl-button
              variant="primary"
              disabled={props.containsLocalImport}
              onClick$={() => {
                const dialog = document.getElementById(
                  "compile-dialog"
                ) as SlDialog;
                dialog.show();
              }}
            >
              Compile
            </sl-button>
            <sl-dialog
              class="loki-dialog"
              id="compile-dialog"
              label="Compile Contract"
            >
              <div class="file-container">
                <div class="file-label">File to compile</div>
                <div class="file-name">{props.filePath}</div>
                <sl-button
                  variant="primary"
                  loading={
                    compilationRequest.state === RequestStateEnum.Loading
                  }
                  disabled={
                    compilationRequest.state === RequestStateEnum.Loading
                  }
                  onClick$={() => {
                    compilationRequest.state = RequestStateEnum.Loading;
                    LokiProjectService.compileProjectFile(
                      props.filePath!,
                      props.currentCommitSHA!,
                      props.projectId,
                      props.branch ? props.branch : undefined
                    )
                      .then(() => {
                        compilationRequest.state = RequestStateEnum.Success;
                        AlertService.notify(
                          "Your contract has been compiled successfully!",
                          AlertVariant.success,
                          "check-circle",
                          10000
                        );
                        const dialog = document.getElementById(
                          "compile-dialog"
                        ) as SlDialog;
                        dialog.hide();
                      })
                      .catch((error) => {
                        compilationRequest.state = RequestStateEnum.Error;
                        AlertService.notifyError(
                          "Error compiling contract!" + error
                        );
                        const dialog = document.getElementById(
                          "compile-dialog"
                        ) as SlDialog;
                        dialog.hide();
                      });
                  }}
                >
                  Compile
                </sl-button>
              </div>
            </sl-dialog>
          </div>

          <div class="file-contents">
            {props.isLoading ? (
              <sl-spinner></sl-spinner>
            ) : (
              <>
                {props.highlightedCode && (
                  <pre>
                    <code
                      class="language-solidity file-view-code"
                      dangerouslySetInnerHTML={props.highlightedCode}
                    ></code>
                  </pre>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
});
