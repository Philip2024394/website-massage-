const fs = require('fs');
const path = require('path');
const { Client, Databases, Query } = require('node-appwrite');

// Load environment variables from .env.local (preferred) or .env
try {
	const dotenv = require('dotenv');
	const localEnv = path.resolve(process.cwd(), '.env.local');
	const defaultEnv = path.resolve(process.cwd(), '.env');
	if (fs.existsSync(localEnv)) {
		dotenv.config({ path: localEnv });
	} else if (fs.existsSync(defaultEnv)) {
		dotenv.config({ path: defaultEnv });
	}
} catch (_) {
	// dotenv not installed; script will continue using process.env directly
}

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
const COIN_SHOP_DATABASE_ID = process.env.COIN_SHOP_DATABASE_ID || '68f76ee1000e64ca8d05';
const SHOP_ITEMS_COLLECTION_ID = process.env.SHOP_ITEMS_COLLECTION_ID || 'shopitems';
const OUTPUT_FILE = path.join(__dirname, 'check-output.txt');

const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) {
	console.error('ERROR: APPWRITE_API_KEY environment variable is required.');
	process.exit(1);
}

const client = new Client()
	.setEndpoint(APPWRITE_ENDPOINT)
	.setProject(APPWRITE_PROJECT_ID)
	.setKey(apiKey);

const databases = new Databases(client);

const limit = 100;

async function fetchAllShopItems() {
	const allItems = [];
	let offset = 0;

	while (true) {
		const response = await databases.listDocuments(
			COIN_SHOP_DATABASE_ID,
			SHOP_ITEMS_COLLECTION_ID,
			[Query.limit(limit), Query.offset(offset)]
		);

		const documents = response.documents || [];
		allItems.push(...documents);

		if (documents.length < limit) {
			break;
		}

		offset += documents.length;
	}

	return allItems;
}

function summarizeByCategory(items) {
	const categories = new Map();

	for (const item of items) {
		const label = item.category || 'Uncategorized';
		if (!categories.has(label)) {
			categories.set(label, []);
		}
		categories.get(label).push(item);
	}

	return Array.from(categories.entries()).sort((a, b) => {
		if (a[0] === b[0]) {
			return 0;
		}
		return a[0].localeCompare(b[0], 'en', { sensitivity: 'base' });
	});
}

function formatItemLine(item) {
	const name = item.name || '(Unnamed item)';
	const id = item.$id || item.id || 'unknown';
	const active = item.isActive ? 'yes' : 'no';
	const coins = typeof item.coinPrice === 'number' ? item.coinPrice : Number(item.coinPrice) || 0;
	return `  • ${name} | #${id} | active=${active} | coins=${coins}`;
}

function buildReport(items) {
	const total = items.length;
	const categories = summarizeByCategory(items);

	let lines = [];
	lines.push(`Total documents: ${total} (fetched ${total})`);
	lines.push('Category counts:');

	for (const [category, collection] of categories) {
		lines.push(`- ${category}: ${collection.length}`);
	}

	if (categories.length === 0) {
		lines.push('- (no categories found)');
	}

	lines.push('');

	for (const [category, collection] of categories) {
		lines.push(`${category}: ${collection.length} items`);
		for (const item of collection) {
			lines.push(formatItemLine(item));
		}
		lines.push('');
	}

	return lines.join('\n').trim() + '\n';
}

async function main() {
	try {
		console.log('Fetching shop items from Appwrite...');
		const items = await fetchAllShopItems();
		console.log(`Retrieved ${items.length} items.`);

		const report = buildReport(items);
		fs.writeFileSync(OUTPUT_FILE, report, { encoding: 'utf8' });
		console.log(`Report written to ${OUTPUT_FILE}`);
		console.log('\n' + report);
	} catch (error) {
		console.error('Failed to generate shop items report:', error);
		process.exit(1);
	}
}

main();
