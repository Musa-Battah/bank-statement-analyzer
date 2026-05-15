'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
          📊 <span>Bank</span> Analyzer
        </Link>
        <div className="nav-links">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            Analyzer
          </Link>
          <Link href="#" className={`nav-link ${pathname === '/transactions' ? 'active' : ''}`}>
            Transactions
          </Link>
          <Link href="#" className={`nav-link ${pathname === '/insights' ? 'active' : ''}`}>
            Insights
          </Link>
        </div>
      </div>
    </nav>
  );
}