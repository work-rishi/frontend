import { useReadContract, useWriteContract } from "wagmi";
import type { PollAllDetails } from "../types/posts/types";
import { ABI, deployedAddress } from "../contracts/deployed-contract";
import { useEffect, useState } from "react";
import styles from "../styles/Custom.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftRight } from "@fortawesome/free-solid-svg-icons";

const Poll = ({ postId }: { postId: bigint }) => {
  const {
    data: poll,
    isLoading,
  }: { data: PollAllDetails | undefined; isLoading: boolean } = useReadContract(
    {
      abi: ABI,
      address: deployedAddress,
      functionName: "getPollFromPost",
      args: [Number(postId)],
    }
  );

  console.log(poll);
  const [pollDetails, setPollDetails] = useState<PollAllDetails | undefined>();

  const {
    writeContract: votingOption1,
    isPending: isPendingOption1,
    isSuccess: isSuccess1,
  } = useWriteContract();
  const {
    writeContract: votingOption2,
    isPending: isPendingOption2,
    isSuccess: isSuccess2,
  } = useWriteContract();

  useEffect(() => {
    if (!isLoading) {
      if (poll === undefined) {
        return;
      }
      setPollDetails(poll);
    }
    if (isSuccess1 || isSuccess2) {
      alert("Successfully submitted your vote!");
      window.location.reload();
    }
  }, [isLoading, isSuccess1, isSuccess2, poll]);

  return (
    <>
      {pollDetails?.id && (
        <div className={styles.card}>
          <div className={styles.form}>
            <h1>Here is the poll: {pollDetails?.question}</h1>
            {isSuccess1 && (
              <h2>Successfully voted on {pollDetails?.option1}</h2>
            )}
            {isSuccess2 && (
              <h2>Successfully voted on {pollDetails?.option2}</h2>
            )}
            <button
              className={styles.pollButton}
              type="button"
              onClick={() => {
                votingOption1({
                  abi: ABI,
                  address: deployedAddress,
                  functionName: "upVotePollOption",
                  args: [postId, pollDetails?.option1.trim()],
                });
              }}
            >
              {pollDetails?.option1}{" "}
              {isPendingOption1 ? (
                "Voting..."
              ) : (
                <FontAwesomeIcon icon={faLeftRight} />
              )}{" "}
              {pollDetails?.option1Counter.toString()}
            </button>
            <button
              className={styles.pollButton}
              type="button"
              onClick={() => {
                votingOption2({
                  abi: ABI,
                  address: deployedAddress,
                  functionName: "upVotePollOption",
                  args: [postId, pollDetails?.option2.trim()],
                });
              }}
            >
              {pollDetails?.option2}{" "}
              {isPendingOption2 ? (
                "Voting..."
              ) : (
                <FontAwesomeIcon icon={faLeftRight} />
              )}{" "}
              {pollDetails?.option2Counter.toString()}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Poll;
