
import React from 'react';

const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    {...props}
  >
    <path d="M15 4V2" />
    <path d="M15 10V8" />
    <path d="M12.5 7.5L11 6" />
    <path d="M18 11.5L16.5 10" />
    <path d="M20 4h-2" />
    <path d="M8 4H6" />
    <path d="m9 18 3-3 3 3-3 3-3-3z" />
    <path d="M21 15.5 18 14l-1.5 3 3 1.5L21 15.5z" />
    <path d="M12.5 21.5 11 20l-1.5 3 3 1.5 1.5-3z" />
    <path d="M3 15.5 6 14l1.5 3-3 1.5-1.5-3z" />
  </svg>
);

export default MagicWandIcon;
