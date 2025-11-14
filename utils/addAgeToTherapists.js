/**
 * Utility script to add age field to existing therapists
 * This adds realistic age data to therapist profiles for testing
 */

// Add age data based on experience level for realistic profiles
const calculateAge = (yearsOfExperience) => {
    // Minimum age is typically 22-25 for professional therapists
    const baseAge = 23;
    const experience = yearsOfExperience || 1;
    
    // Add some randomness but keep it realistic
    const ageVariation = Math.floor(Math.random() * 5) - 2; // -2 to +2 years variation
    const calculatedAge = baseAge + experience + ageVariation;
    
    // Keep age within reasonable bounds (23-55)
    return Math.min(Math.max(calculatedAge, 23), 55);
};

// Sample ages for different experience levels
const generateTherapistAges = () => {
    const ages = [];
    
    // Generate 20 sample ages
    for (let i = 0; i < 20; i++) {
        const experience = Math.floor(Math.random() * 15) + 1; // 1-15 years experience
        ages.push({
            yearsOfExperience: experience,
            age: calculateAge(experience),
            id: i + 1
        });
    }
    
    return ages;
};

// Log sample data for reference
console.log('Sample therapist ages based on experience:');
console.log(generateTherapistAges());

module.exports = {
    calculateAge,
    generateTherapistAges
};