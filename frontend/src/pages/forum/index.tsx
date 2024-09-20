import Posts from "../../components/Posts";
import PostForm from "../../components/PostForm";
import styles from "../../styles/Custom.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import allPosts from "../../components/allPosts";
import { useAccount } from "wagmi";

const Forum = () => {
  return (
    <>
      <div className={styles.main}>
        <header>
          <nav>
            <ConnectButton />
          </nav>
        </header>
        {useAccount().isConnected ? (
          <div>
            <PostForm />
          </div>
        ) : (
          <div>
            <h3>You must be signed in to post</h3>
          </div>
        )}
        <section>
          <Posts posts={allPosts()} />
        </section>
      </div>
    </>
  );
};

export default Forum;
