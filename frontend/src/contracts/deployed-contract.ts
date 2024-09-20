import contract from "./Forum.json";
import type { Address } from "viem";

const deployedAddress = process.env
  .NEXT_PUBLIC_DEPLOYED_CONTRACT_ADDRESS as Address;

// WARNING: not const-asserted despite the const
// See https://wagmi.sh/core/typescript#configure-internal-types
const ABI = [...contract.abi] as const;
export { ABI, deployedAddress };
