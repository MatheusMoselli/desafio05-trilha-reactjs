import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import ptBR from 'date-fns/locale/pt-BR';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { useUtterances } from '../../hooks/useUtterances';
import { Fragment } from 'react';
import { usePosts } from '../../hooks/usePosts';
import Link from 'next/link';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  if (router.isFallback) return <p>Carregando...</p>;
  useUtterances('comments');

  const { getNextPost, getPreviousPost } = usePosts();
  const previous_post = getPreviousPost(post.uid);
  const next_post = getNextPost(post.uid);

  const readingTime = post.data.content.reduce((total, current) => {
    const totalWords = RichText.asText(current.body).split(/\s+/).length;
    return (total += totalWords);
  }, 0);

  return (
    <>
      <img src={post.data.banner.url} alt="banner" className={styles.banner} />
      <div className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.information}>
            <span>
              <FiCalendar />{' '}
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
            <span>
              <FiUser /> {post.data.author}
            </span>
            <span>
              <FiClock /> {Math.ceil(readingTime / 200)} min
            </span>
          </div>
          {post.last_publication_date && (
            <span className={styles.lastEdited}>
              * editado em{' '}
              {format(
                new Date(post.last_publication_date),
                "dd MMM yyyy, 'às' hh:mm",
                {
                  locale: ptBR,
                }
              )}
            </span>
          )}

          <div className={styles.content}>
            {post.data.content.map(content => {
              return (
                <Fragment key={Math.random()}>
                  <h2>{content.heading}</h2>
                  {content.body.map(body => (
                    <p key={Math.random()}>{body.text}</p>
                  ))}
                </Fragment>
              );
            })}
          </div>
        </article>

        {(next_post || previous_post) && (
          <div className={styles.changePost}>
            {previous_post && (
              <div className={styles.btnChangePost}>
                <h2>{previous_post.title}</h2>
                <Link href={`/post/${previous_post.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </div>
            )}

            {next_post && (
              <div className={styles.btnChangePost}>
                <h2>{next_post.title}</h2>
                <Link href={`/post/${next_post.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.comments} id="comments" />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20,
    }
  );

  return {
    paths: postsResponse.results.map(post => {
      return {
        params: { slug: post.uid },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: { post },
  };
};
