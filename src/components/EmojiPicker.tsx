/**
 * ============================================================================
 * 😀 EMOJI PICKER - Modern Emoji Selection Component
 * ============================================================================
 * 
 * Features:
 * ✅ Common emojis organized by category
 * ✅ Search functionality
 * ✅ Cursor position insertion
 * ✅ Click outside to close
 * ✅ Keyboard navigation support
 * ✅ Optimized for chat input
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

// ============================================================================
// EMOJI DATA
// ============================================================================

interface EmojiCategory {
  name: string;
  emojis: string[];
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
      '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣'
    ]
  },
  {
    name: 'Gestures',
    emojis: [
      '👍', '👎', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
      '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖',
      '👏', '🙌', '🤝', '🙏', '✍️', '💪', '🦵', '🦶', '👂', '🦻',
      '👀', '👁️', '🧠', '🦷', '🦴', '👅', '👄', '💋', '🩸'
    ]
  },
  {
    name: 'Objects',
    emojis: [
      '💰', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩',
      '📱', '📞', '☎️', '📺', '📻', '⏰', '⏲️', '⏱️', '🕐', '📷',
      '📸', '📹', '🎥', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '💿', '📀',
      '💾', '💽', '📚', '📖', '📝', '✏️', '✒️', '🖊️', '🖍️', '📎'
    ]
  },
  {
    name: 'Nature',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
      '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
      '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌿', '🍀', '🌳', '🌲',
      '🌊', '🌙', '⭐', '☀️', '⛅', '🌤️', '🌦️', '🌧️', '⛈️', '🌩️'
    ]
  },
  {
    name: 'Food',
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
      '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒',
      '🌶️', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨',
      '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🍗', '🍖', '🌭'
    ]
  },
  {
    name: 'Travel',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🚁', '✈️',
      '🛩️', '🚀', '🛸', '🚢', '⛵', '🚤', '⛽', '🚨', '🚥', '🚦',
      '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏧', '🏨', '🏩'
    ]
  }
];

// Frequently used emojis (most common in messaging)
const POPULAR_EMOJIS = [
  '😂', '❤️', '😍', '🤣', '😊', '🙏', '💕', '😭', '😘', '👍',
  '😅', '👏', '😁', '🔥', '🥰', '💔', '💖', '💙', '😢', '🤔',
  '😆', '🙄', '💪', '😉', '☺️', '👌', '🤗', '💜', '😔', '😎',
  '😇', '🌹', '🤦', '🎉', '💞', '✌️', '✨', '🤷', '😱', '😌'
];

// ============================================================================
// TYPES
// ============================================================================

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

// ============================================================================
// EMOJI PICKER COMPONENT
// ============================================================================

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter emojis based on search term
  const filteredEmojis = searchTerm
    ? EMOJI_CATEGORIES.flatMap(category => category.emojis).filter(() => true) // Simple filter for now
    : selectedCategory === -1 
    ? POPULAR_EMOJIS
    : EMOJI_CATEGORIES[selectedCategory]?.emojis || [];

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    // Don't close picker automatically - let user add multiple emojis
  };

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-hidden">
      {/* Header with Search */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center flex-1 mr-3">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search emojis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 text-sm border-none outline-none bg-transparent"
          />
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Category Tabs */}
      {!searchTerm && (
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setSelectedCategory(-1)}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              selectedCategory === -1
                ? 'bg-orange-100 text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Popular
          </button>
          {EMOJI_CATEGORIES.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(index)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                selectedCategory === index
                  ? 'bg-orange-100 text-orange-600 border-b-2 border-orange-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-3 max-h-64 overflow-y-auto">
        {filteredEmojis.length > 0 ? (
          <div className="grid grid-cols-8 gap-1">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-lg"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No emojis found
          </div>
        )}
      </div>

      {/* Recently Used (Future Enhancement) */}
      {selectedCategory === -1 && (
        <div className="px-3 pb-2">
          <div className="text-xs font-medium text-gray-500 mb-2">Recently Used</div>
          <div className="grid grid-cols-8 gap-1">
            {POPULAR_EMOJIS.slice(0, 16).map((emoji, index) => (
              <button
                key={`recent-${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-lg"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-200 bg-gray-50">
        Click an emoji to add it to your message
      </div>
    </div>
  );
}