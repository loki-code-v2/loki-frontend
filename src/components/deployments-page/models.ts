import { Abi } from "abitype";

type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  clerkId: string;
  clerkName: string;
  lastLogin: Date;
  firstName: string;
  lastName: string;
};
export interface GitHubUser {
  login: string;
  url: string;
}

export interface Commit {
  sha: string;
  url: string;
  message: string;
  author: GitHubUser;
  createdAt: Date;
}

export interface Workflow {
  id: number;
  name: string;
  url: string;
}

export interface WorkFlowRun {
  id: number;
  createdAt: Date;
  status: string;
  url: string;
  workflow: Workflow;
  actor: GitHubUser;
  commit: Commit;
}

export interface Artifact {
  id: number;
  name: string;
  createdAt: Date;
  status: "unchecked" | "hasAbiAndBytecode" | "doesNotHaveAbiAndBytecode";
  workflowRun: WorkFlowRun;
  abi?: string;
  bytecode?: string;
}

export interface compilation {
  id: number;
  name: string;
  contractName: string;
  createdAt: Date;
  abi: Abi;
  bytecode: string;
  commit?: Commit;
  user: User;
}

export interface Transaction {
  hash: string;
  senderAddress: string;
}

export interface Argument {
  name: string;
  type: string;
  internalType: string;
  value: string;
}

export interface Network {
  name: string;
  chainId: number;
}

export interface Deployment {
  id: number;
  createdAt: Date;
  network: Network;
  transaction: Transaction;
  trigger: {
    kind: "WorkFlowRun" | "compilation";
    data: WorkFlowRun | compilation;
  };
  user: User;
  constructorArgs?: Argument[];
  status?: "success" | "failure" | "pending";
  errorMessages?: string[];
}
