'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCartCount } from '@/redux/slices/cartSlice';
import { addToHistory, clearHistory } from '@/redux/slices/searchSlice';
import { useGetProductsQuery } from '@/redux/api/apiSlice';
import { NAV_LINKS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  GitCompare,
  MapPin,
  Package,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const DEBOUNCE_MS = 300;

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const cartCount = useAppSelector(selectCartCount);
  const searchHistory = useAppSelector((state) => state.search.history);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce the search term
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Query products based on debounced search
  const { data: searchResults, isLoading: isSearching } = useGetProductsQuery(
    { search: debouncedSearch, limit: 6 },
    { skip: debouncedSearch.length < 2 }
  );

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      dispatch(addToHistory(trimmed));
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    },
    [dispatch, router]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(searchTerm);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setSearchTerm(name);
    handleSearchSubmit(name);
  };

  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    handleSearchSubmit(term);
  };

  const handleClearHistory = () => {
    dispatch(clearHistory());
  };

  const suggestions = searchResults?.slice(0, 6) ?? [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                ShopKart
              </SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t" />
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cartCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {cartCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Heart className="h-4 w-4" />
                Wishlist
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <GitCompare className="h-4 w-4" />
                Compare
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Package className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">ShopKart</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-4" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => {
                if (searchTerm.length >= 2 || searchHistory.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="pl-9 pr-4"
            />
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg"
                >
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="border-b p-2">
                      <div className="flex items-center justify-between px-2 py-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          Recent Searches
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          onClick={handleClearHistory}
                        >
                          Clear
                        </Button>
                      </div>
                      {searchHistory.slice(0, 5).map((term) => (
                        <button
                          key={term}
                          onClick={() => handleHistoryClick(term)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                        >
                          <Search className="h-3 w-3 text-muted-foreground" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Product Suggestions */}
                  {debouncedSearch.length >= 2 && (
                    <div className="p-2">
                      {isSearching && (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          Searching...
                        </div>
                      )}
                      {!isSearching && suggestions.length === 0 && (
                        <div className="px-2 py-3 text-sm text-muted-foreground">
                          No products found.
                        </div>
                      )}
                      {!isSearching &&
                        suggestions.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSuggestionClick(product.name)}
                            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent"
                          >
                            <Search className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{product.name}</span>
                            {product.selling_price != null && (
                              <span className="ml-auto text-xs font-medium text-muted-foreground shrink-0">
                                Rs.{product.selling_price.toLocaleString()}
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Wishlist */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Link>
          </Button>

          {/* Compare */}
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link href="/compare">
              <GitCompare className="h-5 w-5" />
              <span className="sr-only">Compare</span>
            </Link>
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-2 -top-2 h-5 min-w-5 justify-center px-1 text-[10px]"
                >
                  {cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Link>
          </Button>

          {/* User / Login */}
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link href="/auth/login">
              <User className="h-5 w-5" />
              <span className="sr-only">Login</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
