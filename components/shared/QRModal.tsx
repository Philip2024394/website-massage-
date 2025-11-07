import React from 'react';
import { X, QrCode, LinkIcon, MessageSquare } from 'lucide-react';
import { safeDownload } from '../../utils/domSafeHelpers';

interface QRModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrCodeDataUrl: string;
    qrLink: string;
    entityName: string;
    type: 'hotel' | 'villa';
}

export const QRModal: React.FC<QRModalProps> = ({
    isOpen,
    onClose,
    qrCodeDataUrl,
    qrLink,
    entityName,
    type
}) => {
    if (!isOpen) return null;

    const downloadQR = () => {
        const qrUrl = `https://chart.googleapis.com/chart?chs=600x600&cht=qr&chl=${encodeURIComponent(qrLink)}&choe=UTF-8`;
        const filename = `${entityName.replace(/\s+/g, '-')}-menu-qr.png`;
        safeDownload(qrUrl, filename);
    };

    const shareWhatsApp = () => {
        const message = `Check out our wellness menu: ${qrLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white">Guest Menu QR Code</h3>
                            <p className="text-orange-100 text-xs mt-0.5">Share with your guests</p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-lg" aria-label="Close modal">
                            <X size={20}/>
                        </button>
                    </div>
                </div>

                {/* QR Code Display */}
                <div className="p-6">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            {/* Decorative corners */}
                            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-xl"></div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-xl"></div>
                            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-xl"></div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-xl"></div>
                            
                            <div className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-lg">
                                {qrCodeDataUrl ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-center">
                                            <img 
                                                src={qrCodeDataUrl} 
                                                alt={`QR code for ${entityName || `${type} menu`} - scan to view wellness menu`} 
                                                className="w-64 h-64 object-contain" 
                                                style={{ imageRendering: 'pixelated' }}
                                            />
                                        </div>
                                        <div className="text-center pt-3 border-t-2 border-gray-200">
                                            <div className="text-xs text-gray-500 mb-1">Scan to view menu for</div>
                                            <div className="text-lg font-bold">
                                                <span className="text-gray-900">Inda</span>
                                                <span className="text-orange-500">Street</span>
                                            </div>
                                            <div className="text-base font-semibold text-gray-700 mt-0.5">
                                                {entityName || `Your ${type === 'hotel' ? 'Hotel' : 'Villa'}`}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                                            <p className="text-sm text-gray-500 mt-4">Generating...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-5 w-full space-y-2">
                            <button 
                                onClick={downloadQR} 
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
                                aria-label="Download QR code as PNG image"
                            >
                                <QrCode size={18} aria-hidden="true" /> 
                                <span>Download QR Code</span>
                            </button>
                            
                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(qrLink);
                                        alert('Link copied!');
                                    }} 
                                    className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors border-2 border-gray-200"
                                    aria-label="Copy menu link to clipboard"
                                >
                                    <LinkIcon size={16} aria-hidden="true" />
                                    <span className="text-xs">Copy</span>
                                </button>
                                <button 
                                    onClick={shareWhatsApp} 
                                    className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                    aria-label="Share menu link via WhatsApp"
                                >
                                    <MessageSquare size={16} aria-hidden="true" />
                                    <span className="text-xs">WhatsApp</span>
                                </button>
                                <button 
                                    onClick={() => window.open(`mailto:?subject=Menu%20-%20${encodeURIComponent(entityName || type)}&body=${encodeURIComponent(qrLink)}`)} 
                                    className="flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                                    aria-label="Share menu link via email"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <span className="text-xs">Email</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};