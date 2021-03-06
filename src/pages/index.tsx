import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';
import { usePosts } from '../hooks/usePosts';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const { setPosts: setGlobalPosts } = usePosts();
  const [posts, setPosts] = useState(postsPagination.results);
  const [hasNextPage, setHasNextPage] = useState(!!postsPagination.next_page);

  useEffect(() => {
    setGlobalPosts(
      posts.map(post => ({
        title: post.data.title,
        uid: post.uid,
      }))
    );
  }, [posts]);

  const handleLoadMorePosts = async () => {
    const response = await fetch(postsPagination.next_page);
    const data = await response.json();
    const newPosts = data.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));
    setPosts([...posts, ...newPosts]);
    setHasNextPage(!!data.next_page);
  };

  return (
    <div className={commonStyles.container}>
      {posts.map(post => {
        return (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.post}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <span>
                  <FiCalendar />{' '}
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    { locale: ptBr }
                  )}
                </span>
                <span>
                  <FiUser /> {post.data.author}
                </span>
              </div>
            </a>
          </Link>
        );
      })}

      {hasNextPage && (
        <p className={styles.loadMorePosts} onClick={handleLoadMorePosts}>
          Carregar mais posts
        </p>
      )}

      {preview && (
        <aside>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    })),
  };

  return {
    props: { postsPagination, preview },
    revalidate: 60 * 60 * 24, // 1 day
  };
};
