import { createContext, useContext, useState } from 'react';

interface Post {
  title: string;
  uid: string;
}

interface PostContext {
  total_posts: number;
  posts: Post[];
  setPosts: (posts: Post[]) => void;
  getPreviousPost: (uid: string) => Post;
  getNextPost: (uid: string) => Post;
}

const PostsContext = createContext({} as PostContext);

export const usePosts = () => useContext(PostsContext);
export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const getPreviousPost = (uid: string) => {
    const postIndex = posts.findIndex(post => post.uid === uid);
    if (posts[postIndex - 1]) {
      return posts[postIndex - 1];
    }

    return null;
  };

  const getNextPost = (uid: string) => {
    const postIndex = posts.findIndex(post => post.uid === uid);
    if (posts[postIndex + 1]) {
      return posts[postIndex + 1];
    }

    return null;
  };

  return (
    <PostsContext.Provider
      value={{
        total_posts: posts.length,
        posts,
        setPosts,
        getPreviousPost,
        getNextPost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};
