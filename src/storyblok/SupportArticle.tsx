import { storyblokEditable } from '@storyblok/react/rsc'
import RichTextView from '../components/RichText'

export default function SupportArticle({ blok }: { blok: any }) {
  return (
    <main {...storyblokEditable(blok)} className="mx-auto max-w-4xl p-8">
      <h1 className="text-4xl font-bold">{blok.title}</h1>

      {blok.cover_image?.filename && (
        <img
          src={blok.cover_image.filename}
          alt={blok.cover_image.alt ?? ''}
          className="my-6 w-full rounded"
        />
      )}

      <RichTextView doc={blok.body} />
    </main>
  )
}