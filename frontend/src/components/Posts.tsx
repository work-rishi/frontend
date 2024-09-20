import type { PostDetails } from "../types/posts/types";
import ShareablePostComponent from "./ShareablePostComponent";

const Posts = ({ posts }: { posts: PostDetails[] }) => {
  return (
    <>
      {posts.map((post) => (
        <ShareablePostComponent post={post} key={post.id} />
      ))}
    </>
  );
};

export default Posts;
