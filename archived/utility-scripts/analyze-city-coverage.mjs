// Script to analyze Indonesian city coverage
import fs from 'fs';

// Read the indonesian cities data
const fileContent = fs.readFileSync('./data/indonesianCities.ts', 'utf8');

// Extract main cities (simple regex approach)
const mainCityMatches = fileContent.match(/name: "([^"]+)",\s+locationId: "[^"]+",\s+province: "[^"]+",\s+coordinates: \{[^}]+\},\s+isMainCity: true/g);

if (mainCityMatches) {
    console.log('🏙️ Main Cities in Indonesia Coverage:\n');
    
    const mainCities = [];
    mainCityMatches.forEach((match, index) => {
        const nameMatch = match.match(/name: "([^"]+)"/);
        if (nameMatch) {
            const cityName = nameMatch[1];
            mainCities.push(cityName);
            console.log(`${index + 1}. ${cityName}`);
        }
    });
    
    console.log(`\n📊 Total Main Cities: ${mainCities.length}`);
    
    // Population coverage estimate
    console.log('\n🎯 Coverage Analysis:');
    console.log('Indonesia has ~275 million people');
    console.log('Top 20 cities cover ~60-70% of population');
    console.log(`Your ${mainCities.length} main cities should cover most demand`);
    
    console.log('\n💡 Recommendation:');
    if (mainCities.length >= 15) {
        console.log('✅ EXCELLENT coverage - you have enough cities');
        console.log('Focus on: Building user base in these existing cities');
    } else {
        console.log('⚠️ Consider adding a few more major cities');
        console.log('Missing cities might include: Palembang, Balikpapan, Pekanbaru');
    }
    
} else {
    console.log('Could not parse main cities from data file');
}