import {
  $,
  component$,
  useSignal,
  useStylesScoped$,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import styles from "./deployment-import.scss?inline";
import { ChainService, Network, NetworkNames } from "~/services/chainService";
import { NetworkSelect } from "../network-selector/network-selector";
import { LokiProjectDeploymentsService } from "~/services/LokiProjectDeploymentsService";
import { AlertService } from "~/services/alertService";

interface DeploymentImportProps {
  projectId: string;
  importDeploymentHappened: { value: number };
}

export const DeploymentImport = component$<DeploymentImportProps>((props) => {
  useStylesScoped$(styles);
  const contractName = useSignal<string>("");
  const network = useSignal<NetworkNames>(NetworkNames.Ethereum);
  const address = useSignal<string>("");
  const abi = useSignal<string>("");
  const abiPlaceholder = `[
    {
        "constant": false,
        "inputs": [
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "setValue",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getValue",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]`;

  useVisibleTask$(async () => {
    document
      .querySelector("#contract-name-input")
      ?.addEventListener("sl-input", (event) => {
        contractName.value = (event as any).target.value;
      });
    document
      .querySelector("#address-input")
      ?.addEventListener("sl-input", (event) => {
        address.value = (event as any).target.value;
      });
    document
      .querySelector("#abi-input")
      ?.addEventListener("sl-input", (event) => {
        abi.value = (event as any).target.value;
      });
  });

  /**
   * Handles the selection of a network.
   * @param network The selected network.
   */
  const handleNetworkSelect = $(
    async (selectedNetwork: Network | NetworkNames) => {
      network.value =
        typeof selectedNetwork === "string"
          ? selectedNetwork
          : selectedNetwork.name;
    }
  );

  const isValidEthereumAddress = $(
    (address: string | undefined | null): boolean => {
      if (!address || typeof address !== "string" || address.trim() === "") {
        return false;
      }

      const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      return ethAddressRegex.test(address);
    }
  );

  const isValidAbi = $((abiString: string | undefined | null): boolean => {
    if (
      !abiString ||
      typeof abiString !== "string" ||
      abiString.trim() === ""
    ) {
      return false;
    }

    try {
      const abi = JSON.parse(abiString.trim());

      // Check that the ABI is an array
      if (!Array.isArray(abi)) {
        return false;
      }

      // Optionally, perform further checks on the ABI structure
      // For example, check that each item is an object with certain properties
      for (const item of abi) {
        if (typeof item !== "object" || item === null) {
          return false;
        }
        if (!item.type) {
          return false;
        }
        // You can add more checks here if needed
      }

      return true; // The ABI is valid
    } catch (error) {
      // JSON parsing failed, so the ABI is invalid
      return false;
    }
  });

  const handleSubmit = $(async () => {
    if (!contractName.value) {
      AlertService.notifyError("Contract name is required");
      return;
    }

    if (!(await isValidEthereumAddress(address.value))) {
      AlertService.notifyError("Invalid Ethereum address");
      return;
    }

    if (!(await isValidAbi(abi.value))) {
      AlertService.notifyError("Invalid ABI");
      return;
    }

    try {
      const response =
        await LokiProjectDeploymentsService.saveImportedDeployment(
          props.projectId,
          contractName.value,
          network.value,
          address.value,
          abi.value
        );
      AlertService.notify("Deployment imported successfully");
      props.importDeploymentHappened.value++;

      // Clear the input fields after a successful submission
      contractName.value = "";
      address.value = "";
      abi.value = "";

      // Reset UI inputs
      (document.querySelector("#contract-name-input") as any).value = "";
      (document.querySelector("#address-input") as any).value = "";
      (document.querySelector("#abi-input") as any).value = "";
    } catch (error) {
      console.error(error);
      AlertService.notifyError("Failed to import deployment");
    }
  });

  return (
    <div class="container">
      <div class="description">
        Import a contract that was deployed outside of Loki.code, to begin using
        our DevOps tools with it.
      </div>
      <div class="card">
        <div>
          <sl-input
            label="Contract Name"
            id="contract-name-input"
            placeholder="MyContract"
          ></sl-input>
        </div>
        <div>
          <div>Network</div>
          <NetworkSelect
            onNetworkChange$={handleNetworkSelect}
            enableBuildBear={false} // TODO: Change this to true when Buildbear bug is fixed.
            chainId={
              network.value ? ChainService.getChainId(network.value) : undefined
            }
          />
        </div>
        <div>
          <sl-input
            label="Address"
            id="address-input"
            placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
          ></sl-input>
        </div>
        <div>
          <sl-textarea
            label="ABI"
            rows={8}
            id="abi-input"
            placeholder={abiPlaceholder}
          ></sl-textarea>
        </div>
        <div class="import-btn">
          <sl-button variant="primary" onClick$={handleSubmit}>
            Import Deployment
          </sl-button>
        </div>
      </div>
    </div>
  );
});
