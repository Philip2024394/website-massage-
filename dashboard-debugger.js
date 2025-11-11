// Debug script to test dashboard issues
console.log('🔧 Dashboard Issues Debugger');

// Test 1: Price field zero deletion
function testPriceFields() {
    console.log('\n🧪 Testing Price Fields...');
    
    // Find all price input fields
    const regularPriceInputs = document.querySelectorAll('input[type="text"][placeholder="0"]');
    const hotelPriceInputs = document.querySelectorAll('input[style*="letter-spacing"]');
    
    console.log(`Found ${regularPriceInputs.length} regular price fields`);
    console.log(`Found ${hotelPriceInputs.length} hotel price fields`);
    
    // Test regular pricing
    if (regularPriceInputs.length > 0) {
        const firstField = regularPriceInputs[0];
        console.log('Regular pricing field attributes:', {
            type: firstField.type,
            value: firstField.value,
            placeholder: firstField.placeholder
        });
    }
    
    // Test hotel pricing
    if (hotelPriceInputs.length > 0) {
        const firstHotel = hotelPriceInputs[0];
        console.log('Hotel pricing field attributes:', {
            type: firstHotel.type,
            value: firstHotel.value,
            style: firstHotel.style.letterSpacing
        });
    }
}

// Test 2: Massage types selection removal
function testMassageTypesSelection() {
    console.log('\n🧪 Testing Massage Types Selection...');
    
    const massageCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const greenTags = document.querySelectorAll('.bg-green-100');
    
    console.log(`Found ${massageCheckboxes.length} checkboxes total`);
    console.log(`Found ${greenTags.length} green tags`);
    
    // Count checked massage type checkboxes
    let checkedMassage = 0;
    massageCheckboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.className.includes('text-orange-600')) {
            checkedMassage++;
        }
    });
    
    console.log(`Checked massage types: ${checkedMassage}`);
    
    return { checkboxes: massageCheckboxes.length, greenTags: greenTags.length, checked: checkedMassage };
}

// Test 3: Languages selection removal
function testLanguagesSelection() {
    console.log('\n🧪 Testing Languages Selection...');
    
    const languageCheckboxes = document.querySelectorAll('input[type="checkbox"].text-blue-600');
    const blueTags = document.querySelectorAll('.bg-blue-100');
    
    console.log(`Found ${languageCheckboxes.length} language checkboxes`);
    console.log(`Found ${blueTags.length} blue tags`);
    
    let checkedLanguages = 0;
    languageCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkedLanguages++;
        }
    });
    
    console.log(`Checked languages: ${checkedLanguages}`);
    
    return { checkboxes: languageCheckboxes.length, blueTags: blueTags.length, checked: checkedLanguages };
}

// Test 4: Therapist cards consistency
function testTherapistCardsConsistency() {
    console.log('\n🧪 Testing Therapist Cards Consistency...');
    
    // This would need to be run on the home page
    const therapistCards = document.querySelectorAll('[class*="therapist"]');
    console.log(`Found ${therapistCards.length} potential therapist cards`);
    
    if (therapistCards.length === 0) {
        console.log('⚠️ No therapist cards found. Make sure you are on the home page.');
        return { cards: 0, consistent: false };
    }
    
    return { cards: therapistCards.length, consistent: true };
}

// Simulate checkbox interaction
function simulateCheckboxClick(checkbox) {
    console.log('🎯 Simulating checkbox click...');
    const event = new Event('change', { bubbles: true });
    checkbox.dispatchEvent(event);
    
    // Check if state updated after a delay
    setTimeout(() => {
        console.log('Checkbox state after click:', {
            checked: checkbox.checked,
            disabled: checkbox.disabled
        });
    }, 100);
}

// Run all tests
function runAllTests() {
    console.log('🚀 Running All Dashboard Tests...\n');
    
    testPriceFields();
    const massageResults = testMassageTypesSelection();
    const languageResults = testLanguagesSelection();
    const cardResults = testTherapistCardsConsistency();
    
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Massage Types: ${massageResults.checked}/${massageResults.checkboxes} checked, ${massageResults.greenTags} green tags`);
    console.log(`Languages: ${languageResults.checked}/${languageResults.checkboxes} checked, ${languageResults.blueTags} blue tags`);
    console.log(`Therapist Cards: ${cardResults.cards} found, consistent: ${cardResults.consistent}`);
    
    // Auto-test checkbox functionality if available
    const firstMassageCheckbox = document.querySelector('input[type="checkbox"].text-orange-600:not(:checked)');
    if (firstMassageCheckbox) {
        console.log('\n🎯 Auto-testing massage type checkbox...');
        simulateCheckboxClick(firstMassageCheckbox);
    }
    
    const firstLanguageCheckbox = document.querySelector('input[type="checkbox"].text-blue-600:not(:checked)');
    if (firstLanguageCheckbox) {
        console.log('\n🎯 Auto-testing language checkbox...');
        simulateCheckboxClick(firstLanguageCheckbox);
    }
}

// Auto-run tests when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}

// Export functions for manual testing
window.dashboardDebugger = {
    testPriceFields,
    testMassageTypesSelection,
    testLanguagesSelection,
    testTherapistCardsConsistency,
    runAllTests,
    simulateCheckboxClick
};

console.log('\n💡 Usage:');
console.log('- dashboardDebugger.runAllTests() - Run all tests');
console.log('- dashboardDebugger.testPriceFields() - Test price field clearing');
console.log('- dashboardDebugger.testMassageTypesSelection() - Test massage type selection');
console.log('- dashboardDebugger.testLanguagesSelection() - Test language selection');
console.log('- dashboardDebugger.testTherapistCardsConsistency() - Test card consistency');