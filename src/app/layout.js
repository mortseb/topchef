// src/app/layout.js

'use client';

import '../styles/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <title>Top Chef</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="min-h-screen flex flex-col">
          {/* En-tête (si nécessaire) */}
          {/* <header className="bg-blue-500 text-white p-4">
            <h1 className="text-2xl">Top Chef</h1>
          </header> */}

          <main className="flex-grow">{children}</main>

          {/* Pied de page (si nécessaire) */}
          {/* <footer className="bg-gray-200 text-center p-4">
            &copy; {new Date().getFullYear()} Top Chef
          </footer> */}
        </div>
      </body>
    </html>
  );
}
