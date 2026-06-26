// web/app/layout.js
import './globals.css';

export const metadata = {
  title: 'CM Services',
  description: 'Carga móvil de informes técnicos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
