/**
 * Add locationId fields to all cities in indonesianCities.ts
 * locationId should be lowercase, kebab-case version of the city name
 */

import fs from 'fs';
import path from 'path';

function generateLocationId(cityName) {
  return cityName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

function processFile() {
  const filePath = path.join(process.cwd(), 'constants', 'indonesianCities.ts');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Find all city objects and add locationId
  const updatedContent = content.replace(
    /{\s*name:\s*"([^"]+)",\s*province:/g,
    (match, cityName) => {
      const locationId = generateLocationId(cityName);
      return `{\n        name: "${cityName}",\n        locationId: "${locationId}",\n        province:`;
    }
  );
  
  fs.writeFileSync(filePath, updatedContent);
  console.log('✅ Successfully added locationId fields to all cities');
}

processFile();