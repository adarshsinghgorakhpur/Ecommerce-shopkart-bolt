'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Heart, User, Menu, Sun, Moon, GitCompare, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCartCount } from '@/redux/slices/cartSlice';
import { toggleDarkMode } from '@/redux/slices/uiSlice';
import { addToHistory, clearHistory } from '@/redux/slices/searchSlice';
import { useGetProductsQuery } from '@/redux/api/apiSlice';
import { NAV_LINKS } from '@/constants';

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useAppSelector(selectCartCount);
  const darkMode = useAppSelector(s => s.ui.darkMode);
  const searchHistory = useAppSelector(s => s.search.history);
  const [mounted, setMounted] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const { data: suggestions } = useGetProductsQuery({ search: localQuery, limit: 5 }, { skip: localQuery.length < 2 });

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    dispatch(addToHistory(q.trim()));
    setShowSuggestions(false);
    router.push(`/products?search=${encodeURIComponent(q.trim())}`);
  }, [dispatch, router]);

  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { if (value.length >= 2) setShowSuggestions(true); }, 300);
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="hidden md:block border-b bg-muted/30 text-xs">
          <div className="container mx-auto flex items-center justify-between px-4 py-1">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Deliver to: India</span>
              <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Track Order</span>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>Help Center</span><span>Sell on ShopKart</span>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">S</div>
              <span className="hidden sm:inline">ShopKart</span>
            </Link>
            <div className="relative flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search for products, brands and more..." className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus-visible:ring-1" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="hidden sm:flex"><Moon className="h-4 w-4" /></Button>
              <Link href="/compare"><Button variant="ghost" size="icon" className="hidden sm:flex"><GitCompare className="h-4 w-4" /></Button></Link>
              <Link href="/wishlist"><Button variant="ghost" size="icon" className="hidden sm:flex"><Heart className="h-4 w-4" /></Button></Link>
              <Link href="/cart"><Button variant="ghost" size="icon" className="relative"><ShoppingCart className="h-4 w-4" /></Button></Link>
              <Link href="/auth/login"><Button variant="ghost" size="icon" className="hidden sm:flex"><User className="h-4 w-4" /></Button></Link>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 pb-2 -mt-1 overflow-x-auto">
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent text-muted-foreground">{l.label}</Link>
            ))}
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="hidden md:block border-b bg-muted/30 text-xs">
        <div className="container mx-auto flex items-center justify-between px-4 py-1">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Deliver to: India</span>
            <span className="flex items-center gap-1"><Package className="h-3 w-3" /> Track Order</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Help Center</span><span>Sell on ShopKart</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                {NAV_LINKS.map(l => <Link key={l.label} href={l.href} onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">{l.label}</Link>)}
                <div className="my-2 border-t" />
                <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-accent">My Profile</Link>
                <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-accent">My Orders</Link>
                <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm hover:bg-accent">Wishlist</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-black">S</div>
            <span className="hidden sm:inline">ShopKart</span>
          </Link>
          <div ref={searchRef} className="relative flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={localQuery} onChange={e => handleInputChange(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch(localQuery)} onFocus={() => localQuery.length >= 2 && setShowSuggestions(true)} placeholder="Search for products, brands and more..." className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus-visible:ring-1" />
            </div>
            <AnimatePresence>
              {showSuggestions && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-background shadow-lg">
                  {localQuery.length >= 2 && suggestions?.map(p => (
                    <button key={p.id} onClick={() => handleSearch(p.name)} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors">
                      <Search className="h-3.5 w-3.5 text-muted-foreground" /><span>{p.name}</span><span className="ml-auto text-xs text-muted-foreground">{p.brand}</span>
                    </button>
                  ))}
                  {searchHistory.length > 0 && localQuery.length < 2 && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                        <button onClick={() => dispatch(clearHistory())} className="text-xs text-primary hover:underline">Clear</button>
                      </div>
                      {searchHistory.slice(0, 5).map(h => (
                        <button key={h} onClick={() => handleSearch(h)} className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-accent"><Search className="h-3 w-3 text-muted-foreground" />{h}</button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => dispatch(toggleDarkMode())} className="hidden sm:flex">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link href="/compare"><Button variant="ghost" size="icon" className="hidden sm:flex"><GitCompare className="h-4 w-4" /></Button></Link>
            <Link href="/wishlist"><Button variant="ghost" size="icon" className="hidden sm:flex"><Heart className="h-4 w-4" /></Button></Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">{cartCount}</Badge>}
              </Button>
            </Link>
            <Link href="/auth/login"><Button variant="ghost" size="icon" className="hidden sm:flex"><User className="h-4 w-4" /></Button></Link>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-1 pb-2 -mt-1 overflow-x-auto">
          {NAV_LINKS.map(l => (
            <Link key={l.label} href={l.href} className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent ${pathname === l.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
