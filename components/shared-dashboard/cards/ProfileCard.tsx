/**
 * ProfileCard - Shared profile information card
 */

import React from 'react';

export interface ProfileCardProps {
    title: string;
    icon?: string;
    fields: Array<{
        label: string;
        value: string | number;
        type?: 'text' | 'email' | 'phone' | 'url';
        editable?: boolean;
    }>;
    onEdit?: (field: string, value: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    title,
    icon,
    fields,
    onEdit,
}) => {
    const [editingField, setEditingField] = React.useState<string | null>(null);
    const [editValue, setEditValue] = React.useState('');

    const handleEdit = (field: string, currentValue: string | number) => {
        setEditingField(field);
        setEditValue(currentValue.toString());
    };

    const handleSave = (field: string) => {
        if (onEdit) {
            onEdit(field, editValue);
        }
        setEditingField(null);
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-2 mb-4">
                {icon && <span className="text-2xl">{icon}</span>}
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3">
                        <label className="text-sm text-gray-600 block mb-1">
                            {field.label}
                        </label>
                        
                        {editingField === field.label && field.editable ? (
                            <div className="flex space-x-2">
                                <input
                                    type={field.type || 'text'}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => handleSave(field.label)}
                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    ✓
                                </button>
                                <button
                                    onClick={() => setEditingField(null)}
                                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-900">{field.value}</span>
                                {field.editable && onEdit && (
                                    <button
                                        onClick={() => handleEdit(field.label, field.value)}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileCard;
