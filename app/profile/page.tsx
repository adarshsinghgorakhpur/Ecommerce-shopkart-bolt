'use client';

import { useState, useEffect } from 'react';
import { User, MapPin, Package, LogOut, CreditCard as Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/services/supabase';
import type { User as UserType, Address } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', authUser.id).maybeSingle();
        setUser({ ...profile, email: authUser.email } as UserType);
        setEditName(profile?.full_name || '');
        const { data: addrs } = await supabase.from('addresses').select('*').eq('user_id', authUser.id);
        setAddresses(addrs as Address[] || []);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => { if (!user) return; await supabase.from('users').update({ full_name: editName }).eq('id', user.id); setUser({ ...user, full_name: editName }); setEditing(false); };
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/auth/login'; };

  if (!user) return <div className="container mx-auto px-4 py-20 text-center"><p className="text-muted-foreground">Please login to view your profile</p><a href="/auth/login"><Button className="mt-4">Login</Button></a></div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="h-4 w-4 mr-1" /> Addresses</TabsTrigger>
          <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1" /> Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <div className="rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Personal Information</h3><Button variant="outline" size="sm" onClick={() => setEditing(!editing)}><Edit className="h-3.5 w-3.5 mr-1" /> {editing ? 'Cancel' : 'Edit'}</Button></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs text-muted-foreground">Full Name</Label>{editing ? <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-9 mt-1" /> : <p className="font-medium mt-1">{user.full_name || 'Not set'}</p>}</div>
              <div><Label className="text-xs text-muted-foreground">Email</Label><p className="font-medium mt-1">{user.email}</p></div>
              <div><Label className="text-xs text-muted-foreground">Phone</Label><p className="font-medium mt-1">{user.phone || 'Not set'}</p></div>
            </div>
            {editing && <Button size="sm" onClick={handleSave}>Save Changes</Button>}
          </div>
          <div className="mt-4"><Button variant="outline" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4 mr-2" /> Logout</Button></div>
        </TabsContent>
        <TabsContent value="addresses" className="mt-4">
          <div className="space-y-3">{addresses.map(a => <div key={a.id} className="rounded-lg border p-4"><div className="flex items-center gap-2 mb-1"><span className="font-medium text-sm">{a.full_name}</span><span className="text-xs bg-muted px-2 py-0.5 rounded">{a.label}</span></div><p className="text-sm text-muted-foreground">{a.address_line1}, {a.city}, {a.state} - {a.pincode}</p></div>)}{addresses.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No saved addresses</p>}</div>
        </TabsContent>
        <TabsContent value="orders" className="mt-4"><div className="text-center py-8"><Package className="h-12 w-12 mx-auto text-muted-foreground" /><p className="text-muted-foreground mt-2">View your orders on the dedicated page</p><a href="/orders"><Button className="mt-3" size="sm">View Orders</Button></a></div></TabsContent>
      </Tabs>
    </div>
  );
}
