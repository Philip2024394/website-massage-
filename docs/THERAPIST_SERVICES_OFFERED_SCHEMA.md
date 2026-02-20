# Therapist `servicesOffered` and Facial Fields (Appwrite)

Same **therapists** collection powers both "Home Massage" and "Home Facial" tabs. No new collection required.

## 1. Appwrite schema (therapists collection)

Add these attributes to your existing **therapists** collection:

| Attribute            | Type    | Required | Notes |
|----------------------|---------|----------|--------|
| `servicesOffered`    | string[]| No       | e.g. `["massage"]`, `["facial"]`, `["beautician"]`, or any combination. Used to show cards on Home Service tab (Massage / Facial / Beautician buttons). |
| `facialCertifications`| string  | No       | JSON array string or comma-separated. Shown on profile when therapist offers facial. |
| `facialProductsUsed`  | string  | No       | JSON array string or comma-separated. |
| `facialEquipment`     | string  | No       | JSON array string or comma-separated. |
| `facialSpecialties`   | string  | No       | JSON array string or comma-separated. |

- **Massage-only:** `servicesOffered`: `["massage"]` (or omit; app treats missing as massage-only for backward compatibility when filtering facial).
- **Facial-only:** `servicesOffered`: `["facial"]`.
- **Beautician-only:** `servicesOffered`: `["beautician"]`.
- **Multiple:** `servicesOffered`: `["massage","facial"]` or `["massage","facial","beautician"]`, etc.

## 2. Appwrite query examples

**List all therapists (no filter by service):**
```js
const { documents } = await databases.listDocuments(databaseId, therapistsCollectionId);
```

**List therapists who offer facial (filter in app; Appwrite has no “array contains” in SDK for string[]):**
Client-side after fetching all:
```js
const facialTherapists = documents.filter(d => (d.servicesOffered || []).includes('facial'));
```

Alternatively, if you use a **single string** attribute `servicesOffered` (e.g. `"massage,facial"`), you can filter with a query:
```js
// If stored as comma-separated string:
const { documents } = await databases.listDocuments(
  databaseId,
  therapistsCollectionId,
  [Query.search('servicesOffered', 'facial')]  // only if full-text search is enabled on that attribute
);
```
The app currently uses **array of strings** and filters in the frontend (see `useHomePageLocation` and `cityFilteredFacialTherapists`).

## 3. Frontend usage

- **Home tab:** Shows all therapists (city-filtered). No filter by `servicesOffered`.
- **Facial tab:** Shows only therapists where `servicesOffered` includes `"facial"` (same cards and profile as massage; booking unchanged).
- **Profile:** Facial block (Certifications, Products used, Equipment, Specialties) is rendered only when at least one of `facialCertifications`, `facialProductsUsed`, `facialEquipment`, `facialSpecialties` is present.

## 4. Future services

To add another service (e.g. reflexology):

1. Add id to `src/constants/serviceTypes.ts` (e.g. `REFLEXOLOGY: 'reflexology'`).
2. In `useHomePageLocation`, add a filter for that service and a state like `cityFilteredReflexologyTherapists` (or a generic `getTherapistsByService(serviceId)`).
3. Add a new home tab and use the same `TherapistHomeCard` list with that filtered list.

No change to therapist profile UI required unless you add service-specific attributes.
