import { $, component$, useStylesScoped$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import type { SlDialog } from "@shoelace-style/shoelace";
import { AlertService } from "~/services/alertService";
import { ContractService } from "~/services/contractService";
import { LokiProjectService } from "~/services/lokiProjectService";
import styles from "./file-card.scss?inline";
interface FileCardProps {
  name: string;
  date: string;
  cuid: string;
}

export const FileCard = component$<FileCardProps>((props) => {
  useStylesScoped$(styles);
  const nav = useNavigate();

  const navigate = $(async () => {
    ContractService.getContract(props.cuid)
      .then((response) => {
        if (response.data.template === "ERC20") {
          nav(`/erc20/${props.cuid}`);
        } else if (response.data.template === "NFT") {
          nav(`/erc721/${props.cuid}`);
        }
      })
      .catch((error) => {
        AlertService.notifyError("Error getting Contract!" + error);
      });
  });

  // const navigatePlayground = $(async () => {
  //   nav(`/playground/${props.cuid}`);
  // });

  return (
    <div class="project-card">
      <div
        class="project-card-body-new"
        onClick$={() => {
          navigate();
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
        <div>
          {props.name}
          <p class="project-card-text-small">{props.date}</p>
        </div>
        <sl-dropdown>
          <sl-icon-button
            name="three-dots"
            label="three-dots"
            slot="trigger"
          ></sl-icon-button>
          <sl-menu>
            <sl-menu-item
              onClick$={() => {
                const deleteProjectDialog = document.querySelector(
                  "#delete-project-dialog"
                ) as SlDialog;
                deleteProjectDialog.show();
              }}
            >
              delete
            </sl-menu-item>
          </sl-menu>
        </sl-dropdown>
        <sl-dialog id="delete-project-dialog" class="dialog-overview">
          Are you sure you want to delete this project?
          <sl-button
            slot="footer"
            variant="danger"
            onClick$={() => {
              LokiProjectService.deleteLokiTemplateProject(props.cuid)
                .then(() => {
                  document.location.reload();
                  AlertService.notify("Project Deleted Successfully");
                })
                .catch((error: any) => {
                  AlertService.notifyError("Error Deleting Project!!" + error);
                });
            }}
          >
            Delete
          </sl-button>
        </sl-dialog>
      </div>
    </div>
  );
});
