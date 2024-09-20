import type { Address } from "viem";

export type PostDetails = {
  owner: Address;
  id: bigint;
  title: string;
  description: string;
  spoiler: boolean;
  likes: bigint;
  timestamp: bigint;
};

// Alias it so we don't get confused. Both have the same fields
export type CommentDetails = PostDetails;

export type PollFormDetails = {
  question: string;
  option1: string;
  option2: string;
};

export type PollAllDetails = {
  id: bigint;
  question: string;
  option1: string;
  option2: string;
  option1Counter: bigint;
  option2Counter: bigint;
};
