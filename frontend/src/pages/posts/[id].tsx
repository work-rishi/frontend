import { useRouter } from "next/router";
import { ABI, deployedAddress } from "../../contracts/deployed-contract";
import type { PostDetails } from "../../types/posts/types";
import { useEffect, useState } from "react";
import ShareablePostComponent from "../../components/ShareablePostComponent";
import Comments from "../../components/Comments";
import type { ParsedUrlQuery } from "node:querystring";
import { readContract } from "@wagmi/core";
import config from "../../wagmi";
import Link from "next/link";
import CommentForm from "../../components/CommentForm";
import Poll from "../../components/Poll";
import styles from "../../styles/Custom.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export interface PostIdParams extends ParsedUrlQuery {
  id?: string;
}

export default function Post() {
  const router = useRouter();
  const { id: postId } = router.query as PostIdParams;
  const [postDetails, setPostDetails] = useState<PostDetails | undefined>();

  useEffect(() => {
    if (postId === undefined) {
      return;
    }
    const fetchDetails = async () => {
      const postDetails: PostDetails | undefined | unknown = await readContract(
        config,
        {
          address: deployedAddress,
          functionName: "getPost",
          args: [Number.parseInt(postId.trim(), 10)],
          abi: ABI,
        }
      );

      if (postDetails) {
        setPostDetails(postDetails as PostDetails);
      }
    };

    fetchDetails();
  }, [postId]);

  return (
    <>
      {postDetails?.id && (
        <div className={styles.main}>
          <ConnectButton />
          <h3>
            <Link href="/forum">Go back to forum</Link>{" "}
            <Link href={"/comments"}>See all comments</Link>
          </h3>
          <ShareablePostComponent post={postDetails} />
          <Poll postId={postDetails.id} />
          <CommentForm postId={postDetails.id} />
          <h3>⇓⇓⇓ Comments ⇓⇓⇓</h3>
          <Comments post={postDetails} />
        </div>
      )}
    </>
  );
}
