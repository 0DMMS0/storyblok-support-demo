'use client'

import { useState } from 'react'
import { storyblokEditable } from '@storyblok/react/rsc'
import RichTextView from '../components/RichText'

export default function SupportArticle({ blok }: { blok: any }) {
  const options = [
    { value: '01', label: 'test1' },
    { value: '02', label: 'test2' },
  ]
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    blok.Multioption ?? [],
  )

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOptions(
      Array.from(event.target.selectedOptions, (option) => option.value),
    )
  }

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

      <label className="my-6 block">
        <span className="mb-2 block font-semibold">Multi Option</span>
        <select
          multiple
          value={selectedOptions}
          onChange={handleChange}
          className="min-h-24 w-full rounded border border-gray-400 p-2"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <RichTextView doc={blok.body} />
    </main>
  )
}
