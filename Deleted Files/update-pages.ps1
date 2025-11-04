# Update remaining massage pages with burger menu and AppDrawer
$pages = @(
    "ReflexologyMassagePage",
    "ShiatsuMassagePage", 
    "SportsMassagePage",
    "PregnancyMassagePage",
    "ReviewsTestimonialsPage"
)

$colors = @{
    "ReflexologyMassagePage" = "blue"
    "ShiatsuMassagePage" = "indigo"
    "SportsMassagePage" = "orange"
    "PregnancyMassagePage" = "pink"
    "ReviewsTestimonialsPage" = "purple"
}

$titles = @{
    "ReflexologyMassagePage" = "Reflexology Massage"
    "ShiatsuMassagePage" = "Shiatsu Massage"
    "SportsMassagePage" = "Sports Massage"
    "PregnancyMassagePage" = "Pregnancy Massage"
    "ReviewsTestimonialsPage" = "Reviews & Testimonials"
}

foreach ($page in $pages) {
    $filePath = "c:\Users\Victus\Downloads\website-massage-FRESH\website-massage--2\pages\$page.tsx"
    $color = $colors[$page]
    $title = $titles[$page]
    
    Write-Host "Updating $page..."
    
    # Read the current file
    $content = Get-Content $filePath -Raw
    
    # Replace the imports and interface
    $newImports = @"
import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';

interface ${page}Props {
    onBack?: () => void;
    onNavigate?: (page: string) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
    t?: any;
}

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const $page
"@
    
    # Replace old imports and component declaration
    $content = $content -replace "import React from 'react';\s*interface.*?const $page", $newImports
    
    Write-Host "Updated $page successfully"
}

Write-Host "All pages updated!"