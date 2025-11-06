
import React from 'react';
import { useParams } from 'react-router-dom';
import Button from '../components/Button';
import { Client, Databases, Query } from 'appwrite';
import { DATABASE_ID } from '../lib/appwrite';

const HOTELS_COLLECTION_ID = 'hotels_collection_id';
const PLACES_COLLECTION_ID = 'places_collection_id';

const client = new Client();
client.setEndpoint('https://syd.cloud.appwrite.io/v1').setProject(DATABASE_ID);
const databases = new Databases(client);

const getHotelOrVilla = async (id: string) => {
  return databases.getDocument(DATABASE_ID, HOTELS_COLLECTION_ID, id);
};

const getAvailablePlaces = async (hotelId: string) => {
  const res = await databases.listDocuments(DATABASE_ID, PLACES_COLLECTION_ID, [
    Query.equal('hotelId', hotelId)
  ]);
  return res.documents;
};

const formatPrice = (price: number) => `${price.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false })}K`;

const MenuPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hotel, setHotel] = React.useState<any>(null);
  const [therapists, setTherapists] = React.useState<any[]>([]);
  const [places, setPlaces] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);


  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const hotelData = await getHotelOrVilla(id!);
        setHotel(hotelData);
  // setTherapists(await getAvailableTherapists(id!)); // Removed undefined function
        setPlaces(await getAvailablePlaces(id!));
      } catch (e) {
        setHotel(null);
        setTherapists([]);
        setPlaces([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading || !hotel) return <div className="p-8 text-center">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-2">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-2 text-brand-green">{hotel.name}</h1>
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Massage Service Menu</h2>
  {/* QRCode removed for compatibility. Insert QR code here if needed. */}
  <div className="mb-4 w-full flex justify-center items-center h-32 bg-gray-200 rounded">QR Code Unavailable</div>
        <div className="mb-6 text-center text-gray-500 text-xs">Scan to view this menu online</div>
        <div className="w-full">
          <h3 className="font-bold text-brand-green mb-2">Therapists</h3>
          <div className="grid grid-cols-1 gap-3 mb-4">
            {therapists.map((t) => (
              <div key={t.id} className="bg-brand-green-light rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold text-gray-900">{t.name} <span className="text-xs text-gray-500">#{t.id}</span></div>
                  <div className="flex gap-2 mt-1 text-sm">
                    <span>60m: <span className="font-bold">{formatPrice(t.pricing[60])}</span></span>
                    <span>90m: <span className="font-bold">{formatPrice(t.pricing[90])}</span></span>
                    <span>120m: <span className="font-bold">{formatPrice(t.pricing[120])}</span></span>
                  </div>
                </div>
                <div className={`mt-2 md:mt-0 text-xs font-semibold px-2 py-1 rounded-full ${t.status === 'Available' ? 'bg-green-200 text-green-800' : t.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>{t.status}</div>
              </div>
            ))}
          </div>
          <h3 className="font-bold text-brand-green mb-2">Massage Places</h3>
          <div className="grid grid-cols-1 gap-3 mb-4">
            {places.map((p) => (
              <div key={p.id} className="bg-brand-orange-light rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold text-gray-900">{p.name} <span className="text-xs text-gray-500">#{p.id}</span></div>
                  <div className="flex gap-2 mt-1 text-sm">
                    <span>60m: <span className="font-bold">{formatPrice(p.pricing[60])}</span></span>
                    <span>90m: <span className="font-bold">{formatPrice(p.pricing[90])}</span></span>
                    <span>120m: <span className="font-bold">{formatPrice(p.pricing[120])}</span></span>
                  </div>
                </div>
                <div className={`mt-2 md:mt-0 text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'Available' ? 'bg-green-200 text-green-800' : p.status === 'Busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-600'}`}>{p.status}</div>
              </div>
            ))}
          </div>
        </div>
        <Button className="mt-4 w-full" onClick={() => window.open(`https://wa.me/${hotel.contactNumber.replace(/[^\d]/g, '')}`, '_blank')}>
          Contact Front Desk
        </Button>
      </div>
    </div>

  );
}

export default MenuPage;
