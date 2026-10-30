# Storyblok Support Demo — Task 1

## Part 1 — Storyblok website

I created a simple website using the Storyblok Quickstart reference project.

### Implementation

- The project is a Next.js application using React and TypeScript.
- Content is fetched from Storyblok through the Content Delivery API.
- The application uses the draft/preview token so unpublished content can be previewed.
- Storyblok Live Preview is enabled through the Storyblok Bridge/provider integration.
- The source code is hosted in GitHub.
- The website is deployed on Vercel:

  https://storyblok-support-demo-six.vercel.app/

The website does not require a separate application database for this task. Storyblok stores the content, while the Next.js frontend retrieves and renders it.

### Environment configuration

The Delivery API token is configured as a Vercel environment variable rather than committed to GitHub. The local `.env` file is also excluded from version control.

The public/preview token is used for preview content. A published/public token should be used for a production deployment that only needs published content.

### Troubleshooting

During deployment, requests initially returned authentication errors because the Delivery API token was missing or incorrect. After configuring the correct Storyblok token in Vercel and redeploying, the website loaded correctly.

## Part 2 — Storyblok Management API

The Management API was tested against space `296222285538888` using Postman. Management API requests used a Personal Access Token stored only in Postman/environment variables. The token is not included in this document or repository.

### 1. Create a Content Type component

Endpoint:

```http
POST https://mapi.storyblok.com/v1/spaces/{space_id}/components/
```

Headers:

```http
Authorization: <personal-access-token>
Content-Type: application/json
```

Request body:

```json
{
  "component": {
    "name": "support_article",
    "display_name": "Support Article",
    "is_root": true,
    "is_nestable": false,
    "schema": {
      "title": {
        "type": "text",
        "pos": 0
      },
      "body": {
        "type": "richtext",
        "pos": 1
      },
      "cover_image": {
        "type": "asset",
        "pos": 2
      }
    }
  }
}
```

`is_root: true` makes the component available as a Content Type. The technical component name is `support_article`.

### 2. Create a story from the Content Type

Endpoint:

```http
POST https://mapi.storyblok.com/v1/spaces/{space_id}/stories
```

Request body:

```json
{
  "publish": false,
  "story": {
    "name": "API Asset Upload Example",
    "slug": "api-asset-upload-example",
    "content": {
      "component": "support_article",
      "title": "Article created with the Management API",
      "body": {
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "This story was created through the Storyblok Management API."
              }
            ]
          }
        ]
      }
    }
  }
}
```

The value of `content.component` matches the technical name of the component created in the previous step. The story was left unpublished for preview/review.

### 3. Connect the component to the frontend

After creating the component in Storyblok, I added the matching React component to the local Next.js project. The technical name used in Storyblok is `support_article`.

I created `src/storyblok/SupportArticle.tsx`:

```tsx
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
```

I also imported and registered it in `src/lib/storyblok.ts`:

```tsx
import SupportArticle from '../storyblok/SupportArticle'
```

```tsx
components: {
  page: Page,
  support_article: SupportArticle,
  // other registered components...
}
```

After saving the files, I ran `npm run dev` and reloaded the Storyblok preview. The mapping is needed because the frontend otherwise does not know how to render a story whose root component is `support_article`.

### 4. Upload an image asset

Storyblok documents the upload as a three-step process: request a signed response, upload the file to the returned storage URL, and finish/validate the upload.

#### Step 1: request a signed response

Endpoint:

```http
POST https://mapi.storyblok.com/v1/spaces/{space_id}/assets/
```

Request body:

```json
{
  "filename": "support-cover.jpg",
  "validate_upload": 1
}
```

The response contains a temporary `post_url`, an `id`, a public URL, and a `fields` object. The fields are not invented or modified; they are copied into the next multipart request exactly as returned by Storyblok.

#### Step 2: upload the binary file

The file is uploaded to the `post_url` returned in step 1. This URL points to Storyblok's Amazon S3 storage bucket, not to GitHub or a personal AWS account.

Request:

```http
POST https://s3.amazonaws.com/a.storyblok.com
Content-Type: multipart/form-data
```

The form contains every key from the signed response's `fields` object plus one additional field named `file`. The `file` field contains the local `support-cover.jpg` file. No Management API `Authorization` header is sent to S3 because the signed fields provide temporary authorization for that upload.

The upload returned `204 No Content`, which indicates that S3 accepted the file.

#### Step 3: finish the upload

Because `validate_upload` was set to `1`, the upload was finalized with:

```http
GET https://mapi.storyblok.com/v1/spaces/{space_id}/assets/{asset_id}/finish_upload
```

The request uses the Management API Authorization header and no request body. The successful response returned the asset object and its public Storyblok URL.

The completed asset was:

```text
Filename: support-cover.jpg
Asset ID: 236084692137440
Public URL: https://a.storyblok.com/f/296222285538888/663d25eb06/support-cover.jpg
```

The asset can also be found in the Storyblok space under the Assets/Asset Library section.

### Security notes

- Delivery API tokens and Management API tokens were kept out of the repository.
- Signed upload fields are temporary credentials and should not be published.
- The Management API token should only be used in a secure local/Postman environment variable.
- The public/preview Delivery API token is read-only; it is separate from the Management API token.

## References

- Storyblok APIs overview: https://www.storyblok.com/docs/api
- Create a component: https://www.storyblok.com/docs/api/management/components/create-a-component
- Create a story: https://www.storyblok.com/docs/api/management/stories/create-a-story
- Get a signed asset response: https://www.storyblok.com/docs/api/management/assets/get-signed-response
- Upload and replace assets: https://www.storyblok.com/docs/api/management/assets/upload-and-replace-assets
- Finish an upload: https://www.storyblok.com/docs/api/management/assets/finish-upload
