import React, { useState, useRef } from 'react';
import { Home, Download, Share2, Printer } from 'lucide-react';
import QRCode from 'qrcode';

interface QRCodePageProps {
    onNavigate?: (page: string) => void;
}

const QRCodePage: React.FC<QRCodePageProps> = ({ onNavigate }) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const websiteUrl = 'https://indastreet.com'; // Replace with actual URL

    // Generate QR Code on mount
    React.useEffect(() => {
        generateQRCode();
    }, []);

    const generateQRCode = async () => {
        setIsGenerating(true);
        try {
            const canvas = canvasRef.current;
            if (canvas) {
                await QRCode.toCanvas(canvas, websiteUrl, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                });
                
                // Also generate data URL for sharing
                const dataUrl = await QRCode.toDataURL(websiteUrl, {
                    width: 600,
                    margin: 2,
                });
                setQrCodeUrl(dataUrl);
            }
        } catch (error) {
            console.error('Error generating QR code:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (qrCodeUrl) {
            const link = document.createElement('a');
            link.download = 'indastreet-qrcode.png';
            link.href = qrCodeUrl;
            link.click();
        }
    };

    const handlePrint = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>IndaStreet QR Code</title>
                        <style>
                            @media print {
                                body {
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    min-height: 100vh;
                                }
                                .brand {
                                    font-size: 32px;
                                    font-weight: bold;
                                    margin-bottom: 20px;
                                    text-align: center;
                                }
                                .qr-container {
                                    text-align: center;
                                    page-break-inside: avoid;
                                }
                                canvas {
                                    max-width: 400px;
                                    height: auto;
                                }
                                .url {
                                    margin-top: 20px;
                                    font-size: 18px;
                                    color: #666;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="brand">
                            <span style="color: #000;">Inda</span><span style="color: #f97316;">Street</span>
                        </div>
                        <div class="qr-container">
                            <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 400px;" />
                            <div class="url">${websiteUrl}</div>
                        </div>
                    </body>
                    </html>
                `);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            }
        }
    };

    const handleShare = async () => {
        if (navigator.share && qrCodeUrl) {
            try {
                // Convert data URL to blob
                const response = await fetch(qrCodeUrl);
                const blob = await response.blob();
                const file = new File([blob], 'indastreet-qrcode.png', { type: 'image/png' });

                await navigator.share({
                    title: 'IndaStreet QR Code',
                    text: `Scan this QR code to visit IndaStreet - ${websiteUrl}`,
                    files: [file],
                });
            } catch (error) {
                console.error('Error sharing:', error);
                // Fallback to copying link
                copyToClipboard();
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(websiteUrl).then(() => {
            alert('Link copied to clipboard!');
        });
    };

    const shareViaWhatsApp = () => {
        const text = encodeURIComponent(`Check out IndaStreet! ${websiteUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareViaFacebook = () => {
        const url = encodeURIComponent(websiteUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    const shareViaTwitter = () => {
        const text = encodeURIComponent('Check out IndaStreet!');
        const url = encodeURIComponent(websiteUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    const shareViaLinkedIn = () => {
        const url = encodeURIComponent(websiteUrl);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };

    const shareViaEmail = () => {
        const subject = encodeURIComponent('Check out IndaStreet');
        const body = encodeURIComponent(`I wanted to share this amazing platform with you: ${websiteUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {/* Header */}
            <header className="bg-white shadow-md p-4 sticky top-0 z-40">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <button 
                        onClick={() => onNavigate && onNavigate('home')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Home"
                    >
                        <Home className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                {/* Title Section */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                        Share <span className="text-orange-500">IndaStreet</span>
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Scan or share our QR code to spread the word
                    </p>
                </div>

                {/* QR Code Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 mb-8">
                    <div className="flex flex-col items-center">
                        {/* QR Code Display */}
                        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border-4 border-orange-500">
                            {isGenerating ? (
                                <div className="w-[300px] h-[300px] flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                                </div>
                            ) : (
                                <canvas ref={canvasRef} className="max-w-full h-auto" />
                            )}
                        </div>

                        {/* URL Display */}
                        <div className="text-center mb-8">
                            <p className="text-sm text-gray-500 mb-2">Scan to visit</p>
                            <p className="text-xl font-semibold text-gray-900">{websiteUrl}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
                            <button
                                onClick={handleDownload}
                                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md min-h-[48px]"
                            >
                                <Download className="w-5 h-5" />
                                Download
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md min-h-[48px]"
                            >
                                <Share2 className="w-5 h-5" />
                                Share
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md min-h-[48px]"
                            >
                                <Printer className="w-5 h-5" />
                                Print
                            </button>
                        </div>

                        {/* Social Media Share Section */}
                        <div className="w-full max-w-2xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                                Share on Social Media
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {/* WhatsApp */}
                                <button
                                    onClick={shareViaWhatsApp}
                                    className="flex flex-col items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors shadow-md min-h-[80px]"
                                >
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    <span className="text-xs font-medium">WhatsApp</span>
                                </button>

                                {/* Facebook */}
                                <button
                                    onClick={shareViaFacebook}
                                    className="flex flex-col items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors shadow-md min-h-[80px]"
                                >
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    <span className="text-xs font-medium">Facebook</span>
                                </button>

                                {/* Twitter */}
                                <button
                                    onClick={shareViaTwitter}
                                    className="flex flex-col items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-lg transition-colors shadow-md min-h-[80px]"
                                >
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                    </svg>
                                    <span className="text-xs font-medium">Twitter</span>
                                </button>

                                {/* LinkedIn */}
                                <button
                                    onClick={shareViaLinkedIn}
                                    className="flex flex-col items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-lg transition-colors shadow-md min-h-[80px]"
                                >
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    <span className="text-xs font-medium">LinkedIn</span>
                                </button>

                                {/* Email */}
                                <button
                                    onClick={shareViaEmail}
                                    className="flex flex-col items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg transition-colors shadow-md min-h-[80px]"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-medium">Email</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        About IndaStreet QR Code
                    </h3>
                    <p className="text-gray-600 mb-4">
                        This QR code links directly to IndaStreet's platform. Share it with clients, partners, 
                        or display it at your business location to help people easily discover our services.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-3xl mb-2">📱</div>
                            <p className="text-sm font-medium text-gray-900">Mobile Friendly</p>
                            <p className="text-xs text-gray-600 mt-1">Works on all devices</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-3xl mb-2">🔗</div>
                            <p className="text-sm font-medium text-gray-900">Direct Link</p>
                            <p className="text-xs text-gray-600 mt-1">Instant access to platform</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-3xl mb-2">✨</div>
                            <p className="text-sm font-medium text-gray-900">Professional</p>
                            <p className="text-xs text-gray-600 mt-1">High quality design</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodePage;
