import { ArticleImage, type ArticleImageVariant } from './component';

export function createArticleImage(variant: ArticleImageVariant) {
  return function BoundArticleImage() {
    return <ArticleImage variant={variant} />;
  };
}
