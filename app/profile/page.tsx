'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabase';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setUser, logoutAction } from '@/redux/slices/authSlice';
import type { User, Address } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, MapPin, ShoppingBag, LogOut, Pencil, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [profile, setProfile] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        const [profileRes, addressesRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', session.user.id).single(),
          supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false }),
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
          setEditName(profileRes.data.full_name);
          dispatch(setUser({ ...profileRes.data, email: session.user.email }));
        }
        if (addressesRes.data) {
          setAddresses(addressesRes.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch, router]);

  const handleSaveName = async () => {
    if (!profile || !editName.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ full_name: editName.trim() })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
        dispatch(setUser({ ...data, email: profile.email }));
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating name:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logoutAction());
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <UserIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-bold">Profile not found</h2>
          <p className="mt-2 text-muted-foreground">Please log in to view your profile.</p>
          <Button asChild className="mt-4">
            <Link href="/auth/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Account</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editMode ? (
                    <div className="flex items-center gap-2">
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter your name"
                      />
                      <Button
                        size="icon"
                        onClick={handleSaveName}
                        disabled={saving || !editName.trim()}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditMode(false);
                          setEditName(profile.full_name);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{profile.full_name || 'Not set'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditMode(true)}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">{profile.email || 'Not available'}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <p className="text-sm text-muted-foreground">{profile.phone || 'Not set'}</p>
                </div>
              </div>

              <Separator />

              <Button
                variant="destructive"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          {addresses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No saved addresses</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You haven&apos;t saved any addresses yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{address.full_name}</span>
                          {address.is_default && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        {address.label && (
                          <p className="text-xs text-muted-foreground">{address.label}</p>
                        )}
                        <p className="text-sm">
                          {address.address_line1}
                          {address.address_line2 && `, ${address.address_line2}`}
                        </p>
                        <p className="text-sm">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {address.phone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">View your orders</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Track and manage all your orders.
              </p>
              <Button asChild className="mt-4">
                <Link href="/orders">Go to Orders</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
