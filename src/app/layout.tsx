import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Parsagold',
  description: 'خرید و فروش امن طلا، با سرعت و شفافیت',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
