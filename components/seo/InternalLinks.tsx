import React from 'react';

const INTERNAL_LINKS = [
  { href: '#therapists', label: 'Therapists Online' },
  { href: '#massage-places', label: 'Featured Massage Places' },
  { href: '#facial-spas', label: 'Facial & Spa Experiences' },
  { href: '#reviews', label: 'Customer Reviews' },
  { href: '#contact', label: 'Contact & Support' }
];

const InternalLinks: React.FC = () => (
  <div aria-hidden="true" className="sr-only">
    <ul>
      {INTERNAL_LINKS.map((link) => (
        <li key={link.href}>
          <a href={link.href}>{link.label}</a>
        </li>
      ))}
    </ul>
  </div>
);

export default InternalLinks;
