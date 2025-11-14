import React, { useState } from 'react';
import { getLockedPages, getUnlockedPages, PAGE_REGISTRY } from '../config/pageRegistry';

interface PageManagementPanelProps {
    onLockPage: (pageNumber: number) => void;
    onUnlockPage: (pageNumber: number) => void;
    onTogglePageNumbers: (show: boolean) => void;
    showPageNumbers: boolean;
}

const PageManagementPanel: React.FC<PageManagementPanelProps> = ({
    onLockPage,
    onUnlockPage,
    onTogglePageNumbers,
    showPageNumbers
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'locked' | 'unlocked'>('all');

    const lockedPages = getLockedPages();
    const unlockedPages = getUnlockedPages();

    // Filter pages based on search and filter type
    const filteredPages = Object.entries(PAGE_REGISTRY)
        .filter(([num, info]) => {
            const matchesSearch = info.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                info.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                num.includes(searchTerm);
            
            const matchesFilter = filterType === 'all' || 
                                (filterType === 'locked' && info.locked) ||
                                (filterType === 'unlocked' && !info.locked);
            
            return matchesSearch && matchesFilter;
        })
        .map(([num, info]) => ({ number: parseInt(num), ...info }));

    return (
        <>
            {/* Floating Admin Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-[9998] w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all"
                title="Page Management Panel"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {/* Panel Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[9999]" onClick={() => setIsOpen(false)}>
                    <div 
                        className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-hidden flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-purple-600 text-white p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Page Management</h2>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Toggle Page Numbers */}
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm">Show Page Numbers</span>
                                <button
                                    onClick={() => onTogglePageNumbers(!showPageNumbers)}
                                    className={`w-12 h-6 rounded-full transition-colors ${
                                        showPageNumbers ? 'bg-green-500' : 'bg-gray-400'
                                    }`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                        showPageNumbers ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="bg-purple-700 rounded p-2 text-center">
                                    <div className="font-bold">{Object.keys(PAGE_REGISTRY).length}</div>
                                    <div>Total</div>
                                </div>
                                <div className="bg-red-600 rounded p-2 text-center">
                                    <div className="font-bold">{lockedPages.length}</div>
                                    <div>Locked</div>
                                </div>
                                <div className="bg-green-600 rounded p-2 text-center">
                                    <div className="font-bold">{unlockedPages.length}</div>
                                    <div>Unlocked</div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="p-4 border-b space-y-3">
                            <input
                                type="text"
                                placeholder="Search pages..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                            
                            <div className="flex gap-2">
                                {(['all', 'locked', 'unlocked'] as const).map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setFilterType(filter)}
                                        className={`px-3 py-1 rounded text-xs font-medium ${
                                            filterType === filter
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Page List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredPages.map(page => (
                                <div 
                                    key={page.number}
                                    className={`p-3 border-b hover:bg-gray-50 ${
                                        page.locked ? 'bg-red-50' : 'bg-green-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`
                                                    inline-flex items-center justify-center w-8 h-6 rounded text-xs font-bold
                                                    ${page.locked ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}
                                                `}>
                                                    #{page.number}
                                                </span>
                                                {page.locked && (
                                                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="font-medium text-sm text-gray-900 truncate">
                                                {page.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                {page.file}
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => page.locked ? onUnlockPage(page.number) : onLockPage(page.number)}
                                            className={`ml-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                                                page.locked
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                            }`}
                                        >
                                            {page.locked ? 'Unlock' : 'Lock'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PageManagementPanel;