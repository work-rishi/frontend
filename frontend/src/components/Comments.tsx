import { useEffect, useState } from "react";
import { ABI, deployedAddress } from "../contracts/deployed-contract";
import type { CommentDetails, PostDetails } from "../types/posts/types";
import { useReadContract } from "wagmi";
import { readContract } from "wagmi/actions";
import config from "../wagmi";
import ShareableCommentComponent from "./ShareableCommentComponent";

const Comments = ({ post }: { post: PostDetails }) => {
  const {
    data: postToCommentIds,
    isLoading,
  }: { data: bigint[] | undefined; isLoading: boolean } = useReadContract({
    abi: ABI,
    address: deployedAddress,
    functionName: "getCommentsFromPost",
    args: [Number(post.id)],
  });

  const [comments, setComments] = useState<CommentDetails[]>([]);

  useEffect(() => {
    if (!postToCommentIds) {
      return;
    }
    const fetchCommentsFromCommentIds = async () => {
      const promised_comments: Promise<CommentDetails | undefined>[] = [];
      const binding = postToCommentIds as bigint[];
      for (const commentId of binding) {
        const comment: Promise<CommentDetails | undefined> = readContract(
          config,
          {
            abi: ABI,
            address: deployedAddress,
            functionName: "getComment",
            args: [commentId],
          }
        ) as Promise<CommentDetails | undefined>;

        promised_comments.push(comment);
      }
      return promised_comments;
    };

    if (!isLoading) {
      fetchCommentsFromCommentIds().then((promises) => {
        Promise.all(promises).then((values) => {
          const binding = values.filter(
            (comment): comment is CommentDetails => !!comment
          );
          setComments(binding);
        });
      });
    }
  }, [isLoading, postToCommentIds]);

  return (
    <>
      {comments.map((comment) => (
        <ShareableCommentComponent
          comment={comment}
          post={post}
          key={comment.id}
        />
      ))}
    </>
  );
};

export default Comments;
