import type { AbiFunction } from "abitype";
import type { abiFuncProps } from "./chainService";

export const isReadFunc = (func: abiFuncProps | AbiFunction) => {
  if (func.stateMutability === "view" || func.stateMutability === "pure") {
    return true;
  }
  return false;
};

export const isWriteFunc = (func: abiFuncProps | AbiFunction) => {
  if (
    func.stateMutability === "payable" ||
    func.stateMutability === "nonpayable"
  ) {
    return true;
  }
  return false;
};
