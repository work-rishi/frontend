import Comments from "../../components/Comments";
import styles from "../../styles/Custom.module.css";
import Link from "next/link";
import allPosts from "../../components/allPosts";

const AllComments = () => {
  return (
    <div className={styles.main}>
      <h3>
        <Link href="/forum">Go back to forum</Link>
      </h3>
      {allPosts().map((post) => (
        <>
          <Comments key={post.id} post={post} />
        </>
      ))}
    </div>
  );
};

export default AllComments;
