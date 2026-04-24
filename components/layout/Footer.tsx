import Link from 'next/link';
import { Phone, Mail, MapPin, Package } from 'lucide-react';

const SHOP_LINKS = [
  { label: 'Electronics', href: '/products?category=electronics' },
  { label: 'Fashion', href: '/products?category=fashion' },
  { label: 'Home & Kitchen', href: '/products?category=home-kitchen' },
  { label: 'Sports', href: '/products?category=sports' },
  { label: 'Books', href: '/products?category=books' },
  { label: 'Beauty', href: '/products?category=beauty' },
];

const ACCOUNT_LINKS = [
  { label: 'My Account', href: '/account' },
  { label: 'Order History', href: '/account/orders' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Cart', href: '/cart' },
  { label: 'Login', href: '/auth/login' },
  { label: 'Register', href: '/auth/register' },
];

const HELP_LINKS = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'Shipping Info', href: '/shipping' },
  { label: 'Returns & Exchanges', href: '/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

const PAYMENT_BADGES = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'COD'];

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Branding & Contact */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Package className="h-6 w-6 text-primary" />
              ShopKart
            </Link>
            <p className="text-sm text-muted-foreground">
              Your one-stop destination for quality products at unbeatable prices.
              Shop with confidence and enjoy fast, reliable delivery.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+91 12345 67890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@shopkart.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Bengaluru, Karnataka, India</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Account
            </h3>
            <ul className="space-y-2">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Help
            </h3>
            <ul className="space-y-2">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods & Copyright */}
        <div className="mt-10 border-t pt-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">We accept:</span>
              {PAYMENT_BADGES.map((method) => (
                <span
                  key={method}
                  className="inline-flex items-center rounded-md border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground"
                >
                  {method}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} ShopKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
