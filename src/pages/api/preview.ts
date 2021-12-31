import { NextApiRequest, NextApiResponse } from 'next';
import { getPrismicClient } from '../../services/prismic';
import { Document } from '@prismicio/client/types/documents';

const linkResolver = (doc: Document): string => {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const prismic = getPrismicClient(req);
  const { token: ref, documentId } = req.query;
  const redirectUrl = await prismic
    .getPreviewResolver(String(ref), String(documentId))
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid Token' });
  }

  res.setPreviewData({ ref });

  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );
  res.end();
};
