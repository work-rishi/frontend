import { useAccount, useWriteContract } from "wagmi";
import type { CommentDetails } from "../types/posts/types";
import { useEffect, useState } from "react";
import { getAccount } from "@wagmi/core";
import config from "../wagmi";
import type { Address } from "viem";
import { ABI, deployedAddress } from "../contracts/deployed-contract";
import styles from "../styles/Custom.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faWarning } from "@fortawesome/free-solid-svg-icons";

const CommentForm = ({ postId }: { postId: bigint }) => {
  const initialiser: CommentDetails = {
    id: BigInt(0),
    title: "",
    owner: getAccount(config).address as Address,
    description: "",
    spoiler: false,
    likes: BigInt(0),
    timestamp: BigInt(0),
  };
  const [comment, setComment] = useState<CommentDetails>(initialiser);
  const { writeContract, isPending, isSuccess, isError } = useWriteContract();

  useEffect(() => {
    if (isSuccess) {
      alert("Successfully commented on post");
      window.location.reload();
    }
    if (isError) {
      alert("Failed to comment on post");
      window.location.reload();
    }
  });

  return (
    <div className={styles.card}>
      {useAccount().isConnected ? (
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.title.trim() || !comment.description.trim()) {
              alert("Empty title or description not allowed.");
              return;
            }
            writeContract({
              abi: ABI,
              address: deployedAddress,
              functionName: "createComment",
              args: [
                postId,
                comment.title,
                comment.description,
                comment.spoiler,
              ],
            });
          }}
        >
          <h1>Comment something wonderful!</h1>
          <input
            type="text"
            name="comment-title"
            placeholder="Comment title"
            onChange={(e) => setComment({ ...comment, title: e.target.value })}
            required
          />
          <textarea
            rows={5}
            name="comment-description"
            placeholder="What's on your mind?"
            onChange={(e) =>
              setComment({ ...comment, description: e.target.value })
            }
          />
          <div className={styles.secondary}>
            <label htmlFor="spoiler">
              <button
                type="button"
                onClick={() =>
                  setComment({ ...comment, spoiler: !comment.spoiler })
                }
              >
                <FontAwesomeIcon
                  icon={faWarning}
                  color={!comment.spoiler ? "#359AECff" : "#FF5D64ff"}
                />{" "}
                Spoiler
              </button>
            </label>
            <button type="submit" className={styles.submit}>
              <FontAwesomeIcon
                icon={faPencil}
                color={!isPending ? "#359AECff" : "#FF5D64ff"}
              />{" "}
              {isPending ? "Submitting..." : "Submit comment"}
            </button>
            {isSuccess && <p>Successfully commented</p>}
            {isError && <p>Failed to comment on post</p>}
          </div>
        </form>
      ) : (
        <h3>You must sign in to comment</h3>
      )}
    </div>
  );
};

export default CommentForm;
