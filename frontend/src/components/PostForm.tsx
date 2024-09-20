import type { PollFormDetails, PostDetails } from "../types/posts/types";
import { type FormEvent, useState } from "react";
import {
  getAccount,
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import config from "../wagmi";
import type { Address } from "viem";
import { ABI, deployedAddress } from "../contracts/deployed-contract";
import { redirect } from "next/navigation";
import styles from "../styles/Custom.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faPoll, faWarning } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const PostForm = () => {
  const postInitialiser: PostDetails = {
    id: BigInt(0),
    title: "",
    owner: getAccount(config).address as Address,
    description: "",
    spoiler: false,
    likes: BigInt(0),
    timestamp: BigInt(0),
  };
  const [post, setPost] = useState<PostDetails>(postInitialiser);
  const [pollElementVisible, setPollElementVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const pollInitialiser: PollFormDetails = {
    question: "",
    option1: "",
    option2: "",
  };
  const [pollDetails, setPollDetails] =
    useState<PollFormDetails>(pollInitialiser);

  const handlePostCreation = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Block if poll first is visible but one or more details are empty
    if (pollElementVisible) {
      if (
        !pollDetails.question?.trim() ||
        !pollDetails.option1?.trim() ||
        !pollDetails.option2?.trim()
      ) {
        alert(
          "One or more of your poll details are empty. Consider checking your inputs."
        );
        setLoading(false);
        return;
      }
      if (pollDetails.option1.trim() === pollDetails.option2.trim()) {
        alert("Option 1 and 2 are the same. Consider checking your inputs.");
        setLoading(false);
        return;
      }
    }
    // Block post submission if either post title or description is empty
    if (!post.description.trim() || !post.title.trim()) {
      alert("Title or description not allowed to be empty...");
      setLoading(false);
      return;
    }

    const result = await simulateContract(config, {
      abi: ABI,
      address: deployedAddress,
      functionName: "createPost",
      args: [post.title, post.description, post.spoiler],
    });
    console.log(result);
    const postTxHash = await writeContract(config, {
      abi: ABI,
      address: deployedAddress,
      functionName: "createPost",
      args: [post.title, post.description, post.spoiler],
    });

    const transaction = await waitForTransactionReceipt(config, {
      hash: postTxHash,
    });

    if (transaction.status === "reverted") {
      alert("Creating post failed! Transaction was reverted due to an error!");
      return redirect(".");
    }

    const readUserPosts: bigint[] = (await readContract(config, {
      abi: ABI,
      address: deployedAddress,
      functionName: "getPostsFromAddress",
      args: [getAccount(config).address],
    })) as bigint[];

    // this won't affect the contract anyway
    const latestPostId = readUserPosts.pop();

    if (pollElementVisible && latestPostId !== undefined) {
      alert(
        "You created a poll. You have to sign another transaction again 🙏"
      );
      const result = await simulateContract(config, {
        abi: ABI,
        address: deployedAddress,
        functionName: "createPoll",
        args: [
          latestPostId,
          pollDetails.question.trim(),
          pollDetails.option1.trim(),
          pollDetails.option2.trim(),
        ],
      });

      const pollTxHash = await writeContract(config, {
        abi: ABI,
        address: deployedAddress,
        functionName: "createPoll",
        args: [
          latestPostId,
          pollDetails.question.trim(),
          pollDetails.option1.trim(),
          pollDetails.option2.trim(),
        ],
      });

      const transaction = await waitForTransactionReceipt(config, {
        hash: pollTxHash,
      });

      if (transaction.status === "reverted") {
        alert(
          "Creating poll failed! Transaction was reverted due to an error!"
        );
        return;
      }
    }
    console.log(result);
    setLoading(false);
    setSuccess(true);
    alert("Successfully submitted!");
    window.location.reload();
  };

  return (
    <div className={styles.cardPlain}>
      <div className={styles.home}>
        <h3>
          <Link href="/">Go back to main page</Link>{" "}
          <Link href={"/comments"}>See all comments</Link>
        </h3>
      </div>
      <form
        className={styles.form}
        onSubmit={(e) => {
          handlePostCreation(e);
        }}
      >
        <input
          type="text"
          name="post-title"
          value={post.title}
          placeholder="Post title"
          onChange={(e) => setPost({ ...post, title: e.target.value })}
          required
        />
        <textarea
          rows={5}
          name="post-description"
          placeholder="What's on your mind?"
          value={post.description}
          onChange={(e) => setPost({ ...post, description: e.target.value })}
        />
        {pollElementVisible && (
          <>
            <input
              type="text"
              name="poll-question"
              placeholder="What's the poll about?"
              value={pollDetails.question}
              onChange={(e) =>
                setPollDetails({ ...pollDetails, question: e.target.value })
              }
              required
            />
            <input
              type="text"
              name="poll-option1"
              placeholder="Option 1 Description"
              value={pollDetails.option1}
              onChange={(e) =>
                setPollDetails({ ...pollDetails, option1: e.target.value })
              }
              required
            />
            <input
              type="text"
              name="poll-option2"
              placeholder="Option 2 Description"
              value={pollDetails.option2}
              onChange={(e) =>
                setPollDetails({ ...pollDetails, option2: e.target.value })
              }
              required
            />
          </>
        )}
        <div className={styles.bottomPrimary}>
          <div className={styles.secondary}>
            <label htmlFor="spoiler">
              <button
                type="button"
                onClick={() => setPost({ ...post, spoiler: !post.spoiler })}
              >
                <FontAwesomeIcon
                  icon={faWarning}
                  color={!post.spoiler ? "#359AECff" : "#FF5D64ff"}
                />{" "}
                Spoiler
              </button>
            </label>
            <label htmlFor="hasPoll">
              <button
                type="button"
                onClick={() => setPollElementVisible(!pollElementVisible)}
              >
                <FontAwesomeIcon
                  icon={faPoll}
                  color={!pollElementVisible ? "#359AECff" : "#FF5D64ff"}
                />{" "}
                Poll
              </button>
            </label>

            <button type="submit" className={styles.submit}>
              <FontAwesomeIcon
                icon={faPencil}
                color={!isLoading ? "#359AECff" : "#FF5D64ff"}
              />{" "}
              {isLoading ? "Submitting..." : "Submit post"}
            </button>
          </div>
        </div>
        {isSuccess && <p>Successfully submitted</p>}
      </form>
    </div>
  );
};

export default PostForm;
