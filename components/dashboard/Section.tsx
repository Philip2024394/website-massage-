import React from 'react';

interface SectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    actions?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, description, children, className = '', actions }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    {description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>}
                </div>
                {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
            {children}
        </div>
    );
};

export default Section;
