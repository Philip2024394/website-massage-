import { therapistService } from '../lib/appwriteService';

(async () => {
  try {
    const therapists = await therapistService.getAll();
    console.log('✅ Therapist documents count:', therapists.length);
    const live = therapists.filter(t => t.isLive === true).length;
    console.log('✅ Live therapists (isLive=true):', live);
    const withDiscount = therapists.filter(t => t.discountPercentage && t.discountPercentage > 0 && t.isDiscountActive === true).length;
    console.log('✅ Active discounts:', withDiscount);
    // Sample name checks (if any lingering demo profiles)
    const demoNames = therapists.filter(t => /demo therapist/i.test(t.name || ''));
    if (demoNames.length) {
      console.log('⚠️ Demo/sample therapist entries detected:', demoNames.map(d => d.name));
    } else {
      console.log('✅ No demo/sample therapist names detected.');
    }
  } catch (e) {
    console.error('❌ Failed to count therapists:', e);
    console.error('Ensure APPWRITE_CONFIG values are correct and network access allowed.');
  }
})();
