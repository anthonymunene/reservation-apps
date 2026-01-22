# S3 & Cloudinary Storage Patterns

## Overview

This project uses AWS S3 for file storage with presigned URLs, and Cloudinary as a CDN for serving images. The pattern enables secure direct uploads without exposing credentials.

## Architecture

```
┌─────────┐    1. Request presigned URL    ┌─────────┐
│ Frontend├─────────────────────────────────▶   API   │
└────┬────┘                                 └────┬────┘
     │                                           │
     │ 2. Upload directly to S3                  │ Generate URL
     ▼                                           ▼
┌─────────┐                                ┌─────────┐
│   S3    │◀───────────────────────────────│ AWS SDK │
└────┬────┘                                └─────────┘
     │
     │ 3. Serve via CDN
     ▼
┌───────────┐
│ Cloudinary│
└───────────┘
```

## Presign URL Service

Located at `apps/api/src/services/presignurl/`:

### Service Registration

```typescript
// presignurl.ts
export const presignurl = (app: Application) => {
  const s3Options = getOptions(app).app.get("storage").s3

  app.use(presignurlPath, new PresignurlService(s3Options), {
    methods: presignurlMethods,
    events: [],
  })
}
```

### Service Class

```typescript
// presignurl.class.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export class PresignurlService {
  private s3Client: S3Client
  private bucket: string

  constructor(options: S3Options) {
    this.s3Client = new S3Client({
      region: options.region,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    })
    this.bucket = options.bucket
  }

  async create(data: { key: string; contentType: string }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: data.key,
      ContentType: data.contentType,
    })

    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    })

    return { url, key: data.key }
  }
}
```

## Configuration

### API Config (`config/default.json`)

```json
{
  "storage": {
    "s3": {
      "region": "eu-west-2",
      "bucket": "reservation-uploads",
      "accessKeyId": "from-infisical",
      "secretAccessKey": "from-infisical"
    },
    "cloudinary": {
      "cloudName": "your-cloud",
      "baseUrl": "https://res.cloudinary.com/your-cloud"
    }
  }
}
```

### Environment Variables (via Infisical)

```
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=eu-west-2
S3_BUCKET=reservation-uploads
CLOUDINARY_URL=cloudinary://xxx
```

## Frontend Integration

### AWS Utilities

Located at `apps/frontend-qwik/src/utils/`:

```typescript
// aws.ts
import { S3Client } from "@aws-sdk/client-s3"

export const s3Client = new S3Client({
  region: import.meta.env.PUBLIC_AWS_REGION,
})
```

### Upload Flow

```typescript
import { api } from "~/client"

async function uploadFile(file: File, folder: string) {
  // 1. Get presigned URL from API
  const { url, key } = await api.service("presignurl").create({
    key: `${folder}/${crypto.randomUUID()}-${file.name}`,
    contentType: file.type,
  })

  // 2. Upload directly to S3
  await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  // 3. Return the key for storage
  return key
}
```

## Image Data Structure

Properties store images with metadata:

```typescript
// In property schema
images: Type.Array(
  Type.Object({
    url: Type.String(),  // S3 key or Cloudinary URL
    metadata: Type.Object({
      status: Type.String(),
      uploadedAt: Type.String({ format: "date-time" }),
      displayOrder: Type.Number(),
      isPrimaryImage: Type.Boolean(),
    }),
  })
)
```

## Image Sanitization Hook

Strip internal metadata from API responses:

```typescript
// hooks/sanitiseImagedata.ts
const sanitise = (images) => images.map(image => ({ url: image.url }))

export const sanitiseImageData = async (context: HookContext) => {
  if (context.method === "get") {
    context.result.images = sanitise(context.result.images)
  }
  if (context.method === "find") {
    context.result.data = context.result.data.map(item => ({
      ...item,
      images: sanitise(item.images),
    }))
  }
  return context
}
```

## Displaying Images

Frontend constructs full URLs using the CDN base:

```typescript
// In Qwik component
<img
  src={`${import.meta.env.PUBLIC_IMAGE_BASE_URL}/properties/${image.url}`}
  alt={property.title}
/>
```

Environment variable:
```
PUBLIC_IMAGE_BASE_URL=https://res.cloudinary.com/your-cloud/image/upload
```

## Key Patterns

### File Key Structure

```
properties/{propertyId}/{uuid}-{filename}
profiles/{userId}/{uuid}-{filename}
```

### Presigned URL Expiry

- Upload URLs: 1 hour (3600 seconds)
- Download URLs: 24 hours for private assets

### Content Types

Always validate and specify content types:

```typescript
const allowedTypes = ["image/jpeg", "image/png", "image/webp"]

if (!allowedTypes.includes(file.type)) {
  throw new Error("Invalid file type")
}
```

## Dependencies

API:
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`
- `cloudinary`

Frontend:
- `@aws-sdk/client-s3` (for direct operations if needed)
