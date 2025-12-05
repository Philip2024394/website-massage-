// Image pool service for therapist card images
const THERAPIST_MAIN_IMAGES = [
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4181001758526d84/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4182001d05a11a19/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4183001a3a6fd0de/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4184001bba3a3a9d/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418500198158d9d3/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe41860014a143394d/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418700130b19a410/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4188000e00025cea/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4189000abe1fd8d6/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418a0008edd3281a/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418b0007ac3e55ba/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418c0001a5b36c2c/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418c0039995990e9/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418d00337f9be339/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418e0034947bfaa6/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418f0031bcb56ded/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4190002fc09e44fe/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4191002e5db0dfef/view?project=68f23b11000d25eb3664',
];

const LIVE_MENU_THERAPIST_IMAGES = [
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4192003445db55a5/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4193002fea8ca8b3/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4194002b1ef92ede/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe419500258663d862/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4196001f02b409df/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe419700157b08b70c/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4198000f867f6e47/view?project=68f23b11000d25eb3664',
];

const IMAGE_POOL_STORAGE_KEY = 'therapist_main_image_pool_v2';
const IMAGE_POOL_HASH_KEY = 'therapist_main_image_pool_hash_v2';

const hashImageList = (list: string[]): string => {
    const data = list.join('|');
    let h = 0;
    for (let i = 0; i < data.length; i++) {
        h = (h << 5) - h + data.charCodeAt(i);
        h |= 0;
    }
    return String(h);
};

const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

export const getNonRepeatingMainImage = (index: number): string => {
    if (typeof window === 'undefined') {
        return THERAPIST_MAIN_IMAGES[index % THERAPIST_MAIN_IMAGES.length];
    }

    try {
        const storedHash = localStorage.getItem(IMAGE_POOL_HASH_KEY);
        const currentHash = hashImageList(THERAPIST_MAIN_IMAGES);
        let pool: string[] | null = null;

        if (storedHash === currentHash) {
            const raw = localStorage.getItem(IMAGE_POOL_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length === THERAPIST_MAIN_IMAGES.length) {
                    pool = parsed as string[];
                }
            }
        }

        if (!pool) {
            pool = shuffle(THERAPIST_MAIN_IMAGES);
            localStorage.setItem(IMAGE_POOL_STORAGE_KEY, JSON.stringify(pool));
            localStorage.setItem(IMAGE_POOL_HASH_KEY, currentHash);
        }

        return pool[index % pool.length];
    } catch (_e) {
        return THERAPIST_MAIN_IMAGES[index % THERAPIST_MAIN_IMAGES.length];
    }
};

export const getRandomLiveMenuImage = (): string => {
    return LIVE_MENU_THERAPIST_IMAGES[Math.floor(Math.random() * LIVE_MENU_THERAPIST_IMAGES.length)];
};

export const imagePoolService = {
    getNonRepeatingMainImage,
    getRandomLiveMenuImage,
};
