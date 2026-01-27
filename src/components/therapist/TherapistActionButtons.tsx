import { MessageCircle } from 'lucide-react';

interface TherapistActionButtonsProps {
  onBookNow: () => void;
  onSchedule: () => void;
  bookNowText: string;
  scheduleText: string;
  CalendarIcon: React.ComponentType<{ className?: string }>;
}

const TherapistActionButtons = ({
  onBookNow,
  onSchedule,
  bookNowText,
  scheduleText,
  CalendarIcon
}: TherapistActionButtonsProps): JSX.Element => {
  return (
    <div className="flex gap-2 mt-4">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          // Prevent multiple rapid clicks
          if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
            return;
          }
          (e.target as HTMLElement).setAttribute('data-clicking', 'true');
          requestAnimationFrame(() => {
            (e.target as HTMLElement).removeAttribute('data-clicking');
          });

          onBookNow();
        }}
        className="w-1/2 flex items-center justify-center gap-1.5 bg-green-500 text-white font-bold py-4 px-3 rounded-lg hover:bg-green-600 active:bg-green-700 active:scale-95 transition-all duration-100 transform touch-manipulation min-h-[48px]"
      >
        {/* @ts-ignore - Lucide React 19 compat */}
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm">{bookNowText}</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          // Prevent multiple rapid clicks
          if ((e.target as HTMLElement).hasAttribute('data-clicking')) {
            return;
          }
          (e.target as HTMLElement).setAttribute('data-clicking', 'true');
          requestAnimationFrame(() => {
            (e.target as HTMLElement).removeAttribute('data-clicking');
          });

          onSchedule();
        }}
        className="w-1/2 flex items-center justify-center gap-1.5 bg-orange-500 text-white font-bold py-4 px-3 rounded-lg hover:bg-orange-600 active:bg-orange-700 active:scale-95 transition-all duration-100 transform touch-manipulation min-h-[48px]"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="text-sm">{scheduleText}</span>
      </button>
    </div>
  );
};

export default TherapistActionButtons;
