import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  Shop: [
    { label: 'Electronics', href: '/products?category=electronics' },
    { label: 'Fashion', href: '/products?category=fashion' },
    { label: 'Home & Kitchen', href: '/products?category=home-kitchen' },
    { label: 'Sports', href: '/products?category=sports' },
    { label: 'Books', href: '/products?category=books' },
  ],
  Account: [
    { label: 'My Profile', href: '/profile' },
    { label: 'Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Cart', href: '/cart' },
  ],
  Help: [
    { label: 'Help Center', href: '#' },
    { label: 'Returns', href: '#' },
    { label: 'Shipping Info', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">S</div>
              ShopKart
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">Your one-stop destination for everything you need. Quality products, unbeatable prices, and fast delivery.</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> 1800-123-4567</span>
              <span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> support@shopkart.com</span>
              <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Mumbai, India</span>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm uppercase tracking-wider mb-3">{title}</h3>
              <ul className="space-y-2">{links.map(l => <li key={l.label}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">&copy; 2026 ShopKart. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground"><span>Visa</span><span>Mastercard</span><span>UPI</span><span>COD</span></div>
        </div>
      </div>
    </footer>
  );
}
