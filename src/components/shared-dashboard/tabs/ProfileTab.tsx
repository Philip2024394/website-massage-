/**
 * ProfileTab - Shared profile editing tab
 */

import React from 'react';
import ProfileCard from '../cards/ProfileCard';
import ImageUploadCard from '../cards/ImageUploadCard';

export interface ProfileTabProps {
    provider: {
        name: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        avatar?: string;
        bio?: string;
    };
    onUpdateField: (field: string, value: string) => Promise<void>;
    onUploadImage: (file: File) => Promise<void>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
    provider,
    onUpdateField,
    onUploadImage,
}) => {
    return (
        <div className="space-y-6">
            <ImageUploadCard
                title="Profile Image"
                description="Upload a clear photo of your business"
                currentImage={provider.avatar}
                onUpload={onUploadImage}
            />
            
            <ProfileCard
                title="Basic Information"
                icon="👤"
                fields={[
                    { label: 'Name', value: provider.name, editable: true },
                    { label: 'Email', value: provider.email, type: 'email', editable: true },
                    { label: 'Phone', value: provider.phone, type: 'phone', editable: true },
                ]}
                onEdit={onUpdateField}
            />
            
            {(provider.address || provider.city) && (
                <ProfileCard
                    title="Location"
                    icon="📍"
                    fields={[
                        ...(provider.address ? [{ label: 'Address', value: provider.address, editable: true }] : []),
                        ...(provider.city ? [{ label: 'City', value: provider.city, editable: true }] : []),
                    ]}
                    onEdit={onUpdateField}
                />
            )}
            
            {provider.bio && (
                <ProfileCard
                    title="About"
                    icon="📝"
                    fields={[
                        { label: 'Bio', value: provider.bio, editable: true },
                    ]}
                    onEdit={onUpdateField}
                />
            )}
        </div>
    );
};

export default ProfileTab;
