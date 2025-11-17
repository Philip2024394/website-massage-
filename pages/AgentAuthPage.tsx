// This page has been deprecated. See deleted/agents/NOTICE.md
import React from 'react';

const AgentAuthPage: React.FC = () => {
    return null;
};

export default AgentAuthPage;

                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isSignUp ? 'Create a password (min 8 characters)' : 'Enter your password'}
                                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                                    {isSignUp ? 'Create Agent Account' : 'Sign In as Agent'}
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            {/* Hide scrollbars */}
            <style>{`
                .max-w-md::-webkit-scrollbar { display: none; }
                @media (max-height: 600px) {
                    .space-y-4 > * + * { margin-top: 0.75rem; }
                    .space-y-6 > * + * { margin-top: 1rem; }
                }
            `}</style>

            {/* Location Popup */}
            <LocationPopup
                isOpen={showLocationPopup}
                onLocationSet={handleLocationSet}
                onSkip={handleLocationSkip}
            />
        </div>
    );
};

export default AgentAuthPage;
