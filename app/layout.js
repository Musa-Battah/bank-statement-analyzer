import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Bank Statement Analyzer',
  description: 'Analyze your bank statements, track spending, and get financial insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
};