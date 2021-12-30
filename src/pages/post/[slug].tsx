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

interface Post {
  first_publication_date: string | null;
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

          <div className={styles.content}>
            {post.data.content.map(content => {
              return (
                <>
                  <h2>{content.heading}</h2>
                  {content.body.map(body => (
                    <p key={Math.random()}>{body.text}</p>
                  ))}
                </>
              );
            })}
          </div>
        </article>
      </div>
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
