# 🔒 Quick Reference: Therapist Home Page Lock

## What's Locked? 🚫
- [pages/HomePage.tsx](pages/HomePage.tsx) - Page structure, filtering logic, state management
- [components/TherapistHomeCard.tsx](components/TherapistHomeCard.tsx) - Card layout, UI structure

## What's Unlocked? ✅

### Daily Updates (No Code Needed)
- **Therapist data** → Update in Appwrite dashboard
- **Profile photos** → Upload to Appwrite storage
- **Service prices** → Edit in Appwrite collection
- **Availability** → Toggle in Appwrite

### Content Updates
- **UI translations** → Edit [translations/home.ts](translations/home.ts)
- **City lists** → Edit `constants/indonesianCities.ts`
- **Service categories** → Edit `constants/massageTypes.ts`

### Backend Changes
- **Data queries** → Edit `lib/therapistService.ts`
- **Appwrite integration** → Edit `lib/appwriteService.ts`
- **Collection schemas** → Modify in Appwrite dashboard

## Common Tasks

| Task | Action | Requires Unlock? |
|------|--------|------------------|
| Add new therapist | Add to Appwrite | ❌ No |
| Update translation | Edit translations/home.ts | ❌ No |
| Add city to filter | Edit indonesianCities.ts | ❌ No |
| Change page layout | Edit HomePage.tsx | ✅ Yes (approval) |
| Modify filtering logic | Edit HomePage.tsx | ✅ Yes (approval) |
| Update therapist photo | Upload to Appwrite | ❌ No |
| Change button text | Edit translations/home.ts | ❌ No |
| Adjust styling | Edit CSS/Tailwind | ❌ No |

## Locked By
GitHub Actions workflow: [.github/workflows/block-legacy-edits.yml](.github/workflows/block-legacy-edits.yml)

## Full Documentation
- [LOCKED_FILES.md](LOCKED_FILES.md) - Complete specification
- [THERAPIST_HOME_PAGE_LOCK_SUMMARY.md](THERAPIST_HOME_PAGE_LOCK_SUMMARY.md) - Detailed summary
