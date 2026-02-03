/**
 * VAPID Key Generator Script
 * Generates public/private VAPID key pairs for web push notifications
 */

// Method 1: Using web-push library (recommended)
console.log('🔑 VAPID Key Generation Guide\n');

console.log('📋 STEP 1: Install web-push library');
console.log('Run this command in your terminal:');
console.log('npm install -g web-push');
console.log('');

console.log('📋 STEP 2: Generate VAPID keys');
console.log('Run this command:');
console.log('web-push generate-vapid-keys');
console.log('');

console.log('📋 STEP 3: You will get output like this:');
console.log('=======================================');
console.log('Public Key:');
console.log('BHxl3rWqx7r2fVjEp_Al_Cw3g4Bk2fIg...');  // Example
console.log('');
console.log('Private Key:');
console.log('YGBk2fIg3fVjEp_Al_Cw3g4Bk2fIgxl3rWq...');  // Example
console.log('=======================================');
console.log('');

console.log('📋 STEP 4: Add keys to environment');
console.log('Create .env file in your project root with:');
console.log('');
console.log('# VAPID Keys for Web Push Notifications');
console.log('VITE_VAPID_PUBLIC_KEY=YOUR_PUBLIC_KEY_HERE');
console.log('VAPID_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE');
console.log('');

console.log('⚠️  SECURITY NOTE:');
console.log('- Public key: Can be exposed to browser (VITE_ prefix)');
console.log('- Private key: MUST stay server-side only (no VITE_ prefix)');
console.log('');

console.log('📋 STEP 5: Alternative - Online Generator');
console.log('Visit: https://web-push-codelab.glitch.me/');
console.log('Click "Generate Keys" button');
console.log('');

console.log('✅ VERIFICATION:');
console.log('After setup, the console warning will disappear!');

// Method 2: Using browser crypto API (for testing only)
if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
  console.log('\n🔧 BROWSER-BASED GENERATION (Testing Only):');
  
  async function generateVAPIDKeys() {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: 'P-256',
        },
        true,
        ['sign', 'verify']
      );

      const publicKey = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
      const privateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

      // Convert to base64url format
      const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKey)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      console.log('Generated Public Key:', publicKeyBase64);
      console.log('⚠️ Use web-push CLI for production keys!');
      
    } catch (error) {
      console.error('Browser key generation failed:', error);
    }
  }

  // Uncomment to generate test keys in browser
  // generateVAPIDKeys();
}