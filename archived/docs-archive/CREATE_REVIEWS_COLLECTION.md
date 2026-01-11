# Create Reviews Collection in Appwrite

## Step 1: Go to Appwrite Console
1. Open: https://syd.cloud.appwrite.io/console
2. Login to your account
3. Click on your project
4. Click on "Databases" in the left menu
5. Click on your database

## Step 2: Check if Reviews Collection Exists
Look at the list of collections. Do you see one called "Reviews" or "reviews"?

### If YES - Reviews collection exists:
- Click on it
- Copy the Collection ID (shown at the top)
- Use that ID in the populate-reviews.html file

### If NO - You need to create it:

## Step 3: Create Reviews Collection (if it doesn't exist)
1. Click "Add Collection" button
2. Name it: **Reviews**
3. Click "Create"

## Step 4: Add Attributes to Reviews Collection
Click "Add Attribute" and create these fields:

1. **reviewId** - Type: String, Size: 255
2. **providerId** - Type: String, Size: 255, Required: Yes
3. **providerType** - Type: String, Size: 50, Required: Yes
4. **rating** - Type: Integer, Min: 1, Max: 5, Required: Yes
5. **reviewContent** - Type: String, Size: 5000, Required: Yes
6. **reviewerId** - Type: String, Size: 255, Required: Yes
7. **reviewDate** - Type: String, Size: 255
8. **userName** - Type: String, Size: 255
9. **userId** - Type: String, Size: 255
10. **status** - Type: String, Size: 50, Default: "approved"
11. **likes** - Type: Integer, Default: 0
12. **comment** - Type: String, Size: 2000
13. **createdAt** - Type: String, Size: 255

## Step 5: Set Permissions
1. Go to "Settings" tab in the collection
2. Under "Permissions", add:
   - **Read**: Any
   - **Create**: Any (for anonymous reviews)
   - **Update**: Any
   - **Delete**: Any

## Step 6: Get Collection ID
1. At the top of the collection page, you'll see "Collection ID: xxxxxxxx"
2. Copy this ID
3. Use it in your code!

## Alternative: Check Existing Collections
Your therapists are showing, so you must have a **therapists_collection_id** that works.
The reviews collection might use a similar naming pattern.

Try these common names in the populate-reviews.html input box:
- `Reviews`
- `reviews`
- `Review`
- `review`
- `6767020d001f6bafeea2` (the ID shown in previous console logs)
