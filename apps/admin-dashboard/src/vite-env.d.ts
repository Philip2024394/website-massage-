/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_BUCKET_ID: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_LEAD_GENERATIONS_COLLECTION_ID: string
  readonly VITE_MEMBERSHIP_AGREEMENTS_COLLECTION_ID: string
  readonly VITE_MEMBERSHIP_UPGRADES_COLLECTION_ID: string
  readonly VITE_DEACTIVATION_REQUESTS_COLLECTION_ID: string
  readonly VITE_BUILD_HASH: string
  readonly VITE_DEBUG_SUPPRESSED_ERRORS: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}