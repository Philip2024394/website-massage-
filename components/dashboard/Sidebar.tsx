import React from 'react';

interface SidebarProps {
  links: { name: string; url: string; icon: string }[];
  onLinkClick?: (url: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ links, onLinkClick }) => {
  return (
    <aside className="w-56 bg-white border-r h-full flex flex-col py-6 px-4 shadow-md">
      <nav className="flex flex-col gap-2">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded hover:bg-brand-green/10 text-gray-800 hover:text-brand-green transition-colors"
            onClick={e => onLinkClick && (e.preventDefault(), onLinkClick(link.url))}
          >
            {/* Render icon as SVG string or fallback */}
            <span dangerouslySetInnerHTML={{ __html: link.icon }} className="w-5 h-5" />
            <span>{link.name}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
