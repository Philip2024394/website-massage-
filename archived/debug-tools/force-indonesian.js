// Force Indonesian language on page load
console.log('🌐 Forcing Indonesian language...');
localStorage.setItem('app_language', 'id');
console.log('✅ Language set to Indonesian (id)');
console.log('🔄 Reloading page...');
setTimeout(() => window.location.reload(), 500);
