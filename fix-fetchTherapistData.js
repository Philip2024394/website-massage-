// Critical Fix for TherapistDashboardPage.tsx fetchTherapistData function
// This replaces the broken fetchTherapistData function with a properly structured version

const fetchTherapistData = useCallback(async () => {
    setIsLoading(true);
    
    try {
        console.log('📖 Fetching therapist data for ID:', therapistId);
        
        let existingTherapist = null;
        
        // 🔥 CRITICAL FIX: Handle both documentId and userId
        console.log('🔍 CRITICAL FIX: Therapist ID Resolution');
        console.log('📍 Provided therapistId:', therapistId);
        console.log('📍 existingTherapistData:', existingTherapistData);
        
        // 🎯 PRIORITY 1: Use existingTherapistData from AppRouter (best source)
        if (existingTherapistData) {
            console.log('✅ Using existingTherapistData from AppRouter (live home data)');
            existingTherapist = existingTherapistData;
        } else {
            // 🎯 PRIORITY 2: Try direct document lookup by therapistId 
            try {
                console.log('🔍 Trying direct document lookup by ID:', therapistId);
                existingTherapist = await therapistService.getById(therapistId.toString());
                if (existingTherapist) {
                    console.log('✅ Found therapist by direct ID lookup:', existingTherapist.name);
                }
            } catch (directError) {
                console.log('⚠️ Direct ID lookup failed:', directError);
            }
            
            // 🎯 PRIORITY 3: Get current user and find by email (fallback)
            if (!existingTherapist) {
                try {
                    console.log('🔐 Fallback: Getting current user for email lookup...');
                    const currentUser = await therapistService.getCurrentUser();
                    console.log('🔍 Current user result:', currentUser);
                    console.log('📧 User email for lookup:', currentUser?.email);
                    
                    if (currentUser && currentUser.email) {
                        console.log('✅ Found logged-in user:', currentUser.email);
                        
                        // Find therapist profile by email
                        console.log('🔍 Searching for therapist profile by email...');
                        const therapistProfiles = await therapistService.getByEmail(currentUser.email);
                        console.log('📋 Therapist profiles found:', therapistProfiles);
                        
                        if (therapistProfiles && therapistProfiles.length > 0) {
                            existingTherapist = therapistProfiles[0];
                            console.log('✅ Found therapist profile by email:', existingTherapist.name);
                        } else {
                            console.log('⚠️ No therapist profile found for email:', currentUser.email);
                        }
                    } else {
                        console.log('⚠️ No authenticated user found');
                    }
                } catch (emailError) {
                    console.log('⚠️ Email lookup failed:', emailError);
                }
            }
        }
        
        // Process the found therapist data
        if (existingTherapist) {
            console.log('✅ Found existing therapist profile:', existingTherapist);
            console.log('📋 Profile data breakdown:', {
                name: existingTherapist.name,
                description: existingTherapist.description?.substring(0, 50) + '...',
                profilePicture: existingTherapist.profilePicture?.substring(0, 50) + '...',
                location: existingTherapist.location,
                isLive: existingTherapist.isLive,
                whatsappNumber: existingTherapist.whatsappNumber,
                yearsOfExperience: existingTherapist.yearsOfExperience
            });

            // Load form data from existing therapist
            console.log('🔄 About to set form fields. Current state:', {
                currentName: name,
                loadedName: existingTherapist.name,
                currentDescription: description?.substring(0, 30) + '...',
                loadedDescription: existingTherapist.description?.substring(0, 30) + '...'
            });
            
            // Set all the form fields from therapist data
            setTherapist(existingTherapist);
            setName(existingTherapist.name || '');
            setDescription(existingTherapist.description || '');
            setProfilePicture(existingTherapist.profilePicture || '');
            setWhatsappNumber(existingTherapist.whatsappNumber || '');
            setLocation(existingTherapist.location || '');
            setYearsOfExperience(existingTherapist.yearsOfExperience || 0);
            
            // Set complex fields
            setMassageTypes(parseMassageTypes(existingTherapist.massageTypes));
            setLanguages(existingTherapist.languages 
                ? (typeof existingTherapist.languages === 'string' 
                    ? parseLanguages(existingTherapist.languages) 
                    : existingTherapist.languages)
                : []);
                
            // Load pricing
            const loadedPricing = (() => {
                if (existingTherapist.pricing) {
                    return parsePricing(existingTherapist.pricing);
                } else if (existingTherapist.price_home && existingTherapist.price_hotel) {
                    return {
                        "60": existingTherapist.price_home,
                        "90": existingTherapist.price_home,
                        "120": existingTherapist.price_home
                    };
                }
                return { "60": 0, "90": 0, "120": 0 };
            })();
            
            setPricing(loadedPricing);
            
            // Hotel/villa pricing
            const hotelPricing = existingTherapist.hotelVillaPricing 
                ? parsePricing(existingTherapist.hotelVillaPricing)
                : { "60": 0, "90": 0, "120": 0 };
            setHotelVillaPricing(hotelPricing);
            
            // Set status
            const therapistStatus = existingTherapist.status || existingTherapist.availability || 'Offline';
            setStatus(therapistStatus);
            
            setDataLoaded(true);
            console.log('✅ All therapist data loaded successfully');
        } else {
            console.log('📝 No existing therapist found, starting with empty form');
            // Initialize empty form
            setTherapist(null);
            setName('');
            setDescription('');
            setProfilePicture('');
            setWhatsappNumber('');
            setYearsOfExperience(0);
            setMassageTypes([]);
            setLanguages([]);
            setPricing({ "60": 0, "90": 0, "120": 0 });
            setHotelVillaPricing({ "60": 0, "90": 0, "120": 0 });
            setUseSamePricing(true);
            setLocation('');
            setCoordinates({ lat: 0, lng: 0 });
            setStatus(AvailabilityStatus.Offline);
            setIsLicensed(false);
            setLicenseNumber('');
            setDataLoaded(true);
        }
        
    } catch (error) {
        console.error('❌ Error fetching therapist data:', error);
        console.log('📝 Error occurred, starting with empty form');
        setDataLoaded(true); // Mark as "loaded" to prevent retry loops
        
        // Initialize with empty data on error
        setTherapist(null);
        setName('');
        setDescription('');
        setProfilePicture('');
        setWhatsappNumber('');
        setYearsOfExperience(0);
        setMassageTypes([]);
        setLanguages([]);
        setPricing({ "60": 0, "90": 0, "120": 0 });
        setHotelVillaPricing({ "60": 0, "90": 0, "120": 0 });
        setUseSamePricing(true);
        setLocation('');
        setCoordinates({ lat: 0, lng: 0 });
        setStatus(AvailabilityStatus.Offline);
        setIsLicensed(false);
        setLicenseNumber('');
    } finally {
        setIsLoading(false);
    }
}, [therapistId, existingTherapistData]);