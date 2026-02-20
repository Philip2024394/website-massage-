# Appwrite therapist `locationId` – reference and checklist

## Setup status

City filtering is wired so that:

1. **Appwrite query** (when a city is selected) uses:
   - `locationId = "<city_slug>"` (e.g. `yogyakarta`, `bandung`)
   - `isLive = true`
   - `country = "Indonesia"`

2. **Client-side filter** (HomePage) uses therapist `locationId` first, then fallbacks.

3. **URLs** like `/indonesia/yogyakarta/home-massage` set the selected city to that slug and load only that city’s therapists.

So therapists appear in the correct city **only if** each therapist document in Appwrite has **`locationId`** set to one of the **exact** slugs below (lowercase, no spaces; use hyphen for multi-word).

---

## Valid `locationId` values (use exactly in Appwrite)

These are the canonical slugs the app uses. Each therapist’s **locationId** must be one of these (or that therapist will not show on any city page).

| locationId | Display name |
|------------|--------------|
| denpasar | Denpasar |
| ubud | Ubud |
| canggu | Canggu |
| seminyak | Seminyak |
| kuta | Kuta |
| sanur | Sanur |
| nusa-dua | Nusa Dua |
| jimbaran | Jimbaran |
| jakarta-pusat | Jakarta Pusat |
| jakarta-barat | Jakarta Barat |
| jakarta-selatan | Jakarta Selatan |
| jakarta-timur | Jakarta Timur |
| jakarta-utara | Jakarta Utara |
| jakarta | Jakarta |
| surabaya | Surabaya |
| bandung | Bandung |
| yogyakarta | Yogyakarta |
| semarang | Semarang |
| solo | Solo |
| malang | Malang |
| bekasi | Bekasi |
| depok | Depok |
| bogor | Bogor |
| banyuwangi | Banyuwangi |
| bromo-area | Bromo Area |
| karimunjawa | Karimunjawa |
| mataram | Mataram |
| senggigi | Senggigi |
| gili-trawangan | Gili Trawangan |
| gili-air | Gili Air |
| gili-meno | Gili Meno |
| labuan-bajo | Labuan Bajo |
| ende | Ende |
| maumere | Maumere |
| medan | Medan |
| palembang | Palembang |
| padang | Padang |
| pekanbaru | Pekanbaru |
| bandar-lampung | Bandar Lampung |
| lake-toba | Lake Toba |
| banda-aceh | Banda Aceh |
| sabang | Sabang |
| nias-island | Nias Island |
| bukittinggi | Bukittinggi |
| jambi | Jambi |
| bengkulu | Bengkulu |
| dumai | Dumai |
| batam-sumatra | Batam (Sumatra) |
| tanjung-pinang | Tanjung Pinang |
| pangkal-pinang | Pangkal Pinang |
| binjai | Binjai |
| pematang-siantar | Pematang Siantar |
| lubuklinggau | Lubuklinggau |
| mentawai-islands | Mentawai Islands |
| banjarmasin | Banjarmasin |
| balikpapan | Balikpapan |
| pontianak | Pontianak |
| palangka-raya | Palangka Raya |
| samarinda | Samarinda |
| tarakan | Tarakan |
| singkawang | Singkawang |
| makassar | Makassar |
| manado | Manado |
| palu | Palu |
| kendari | Kendari |
| mamuju | Mamuju |
| gorontalo | Gorontalo |
| bunaken | Bunaken |
| toraja | Toraja |
| wakatobi | Wakatobi |
| bitung | Bitung |
| jayapura | Jayapura |
| sorong | Sorong |
| raja-ampat | Raja Ampat |
| ambon | Ambon |
| ternate | Ternate |
| merauke | Merauke |
| manokwari | Manokwari |
| banda-islands | Banda Islands |
| tasikmalaya | Tasikmalaya |
| cirebon | Cirebon |
| sukabumi | Sukabumi |
| purwokerto | Purwokerto |
| tegal | Tegal |
| magelang | Magelang |
| salatiga | Salatiga |
| jember | Jember |
| kediri | Kediri |
| blitar | Blitar |
| probolinggo | Probolinggo |
| mount-bromo | Mount Bromo |

---

## Checklist for correct city display

1. **In Appwrite (Therapists collection)**  
   For each therapist document:
   - Set **locationId** to **exactly** one of the values in the table above (e.g. `yogyakarta`, `bandung`, `denpasar`).
   - Set **country** to `Indonesia` (or leave default if already "Indonesia").
   - Set **isLive** to `true` if they should appear on the site.

2. **No typos**  
   Values are case-sensitive in the query; the app uses **lowercase** slugs. So:
   - ✅ `yogyakarta`
   - ❌ `Yogyakarta` (will not match the query)
   - ❌ `jogja` (not a valid locationId; use `yogyakarta`)

3. **Missing locationId**  
   If **locationId** is empty or wrong, that therapist will **not** show on the right city page (and may not show on any city page when a city is selected).

4. **Therapist dashboard**  
   When therapists set their location (or it’s derived from coordinates), the app saves **locationId** to Appwrite. Ensure the dashboard uses the same canonical slugs (e.g. from `findCityByLocationIdOrName` / `deriveLocationIdFromGeopoint`) so stored values match this list.

---

## Quick verification

- Open a city page (e.g. Yogyakarta) and confirm only therapists with **locationId** = `yogyakarta` appear.
- In Appwrite, run a quick check: list therapists with **locationId** empty or null and fill them with the correct slug from the table above.
