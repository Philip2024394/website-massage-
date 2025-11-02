import React from 'react';

interface ReviewsTestimonialsPageProps {
    onBack: () => void;
    onNavigate: (page: string) => void;
    t: any;
}

const ReviewsTestimonialsPage: React.FC<ReviewsTestimonialsPageProps> = ({ onBack, onNavigate, t: _t }) => {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Client Reviews & Testimonials</h1>
                </div>

                {/* Content */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Review 1 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            "Amazing experience! The Swedish massage was exactly what I needed after a stressful week. 
                            The therapist was professional and the atmosphere was so relaxing."
                        </p>
                        <p className="text-sm text-gray-500 font-semibold">- Sarah M.</p>
                    </div>

                    {/* Review 2 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            "The deep tissue massage helped tremendously with my chronic back pain. I've been to many 
                            places but this was by far the best treatment I've received."
                        </p>
                        <p className="text-sm text-gray-500 font-semibold">- Michael R.</p>
                    </div>

                    {/* Review 3 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            "Prenatal massage during my pregnancy was incredible. The therapist was so knowledgeable 
                            and made me feel comfortable and safe throughout the entire session."
                        </p>
                        <p className="text-sm text-gray-500 font-semibold">- Jennifer L.</p>
                    </div>

                    {/* Review 4 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(4)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <svg className="w-5 h-5 text-gray-300" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            "Great hot stone massage! Very relaxing environment. The only reason I didn't give 5 stars 
                            is the parking was a bit difficult to find."
                        </p>
                        <p className="text-sm text-gray-500 font-semibold">- David K.</p>
                    </div>

                    {/* Review 5 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            "The aromatherapy massage was divine! The essential oils were perfectly chosen and the 
                            whole experience left me feeling renewed and energized."
                        </p>
                        <p className="text-sm text-gray-500 font-semibold">- Lisa W.</p>
                    </div>

                    {/* Review 6 */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4">
                            "As an athlete, the sports massage here is exactly what I need for recovery. They understand 
                            the specific needs of athletes and provide excellent care."
                        </p>
                        <p className="text-sm text-gray-500 font-semibold">- Alex T.</p>
                    </div>
                </div>

                {/* Rating Summary */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overall Rating</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex text-yellow-400 text-2xl">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-8 h-8 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-800">4.8</p>
                            <p className="text-gray-600">Based on 150+ reviews</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    <button 
                        onClick={() => onNavigate('home')}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Book Your Session
                    </button>
                    <button 
                        onClick={() => onNavigate('massageTypes')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        View All Services
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewsTestimonialsPage;