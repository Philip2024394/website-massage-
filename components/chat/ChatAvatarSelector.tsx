import { AVATAR_OPTIONS } from '../../constants/chatAvatars';

interface ChatAvatarSelectorProps {
    selectedAvatar: string;
    setSelectedAvatar: (avatar: string) => void;
    language: 'en' | 'id';
}

const ChatAvatarSelector = ({
    selectedAvatar,
    setSelectedAvatar,
    language
}: ChatAvatarSelectorProps): JSX.Element => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'id' ? 'Pilih Avatar Anda' : 'Choose Your Avatar'}
            </label>
            <div className="grid grid-cols-5 gap-2">
                {AVATAR_OPTIONS.map((avatar) => (
                    <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar.imageUrl)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            selectedAvatar === avatar.imageUrl 
                                ? 'border-orange-500 ring-2 ring-orange-300' 
                                : 'border-gray-300 hover:border-orange-400'
                        }`}
                    >
                        <img
                            src={avatar.imageUrl}
                            alt={avatar.label}
                            className="w-full h-full object-cover aspect-square"
                        />
                        {selectedAvatar === avatar.imageUrl && (
                            <div className="absolute inset-0 bg-orange-500 bg-opacity-30 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatAvatarSelector;
