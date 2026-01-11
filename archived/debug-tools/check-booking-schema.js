// Check existing bookings to see real schema
import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function checkBookings() {
  try {
    const bookings = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'bookings',
      []
    );
    
    console.log(`Found ${bookings.total} bookings`);
    
    if (bookings.documents.length > 0) {
      console.log('\n✅ Sample booking structure:');
      console.log(JSON.stringify(bookings.documents[0], null, 2));
    } else {
      console.log('No bookings found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBookings();
