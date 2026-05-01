'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/services/supabase';

const schema = z.object({ email: z.string().email('Enter a valid email'), password: z.string().min(6, 'Password must be at least 6 characters') });
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const form = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: Form) => {
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) { setError(error.message); setLoading(false); } else { router.push('/'); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-black mx-auto">S</div>
          <h1 className="text-2xl font-bold mt-4">Login to ShopKart</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your credentials to continue</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-600">{error}</div>}
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input {...field} type="email" placeholder="you@example.com" className="pl-10" /></div></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input {...field} type={showPassword ? 'text' : 'password'} placeholder="Enter password" className="pl-10 pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormControl><FormMessage /></FormItem>)} />
            <Button type="submit" className="w-full h-11" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</Button>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground">New to ShopKart? <Link href="/auth/register" className="text-primary font-medium hover:underline">Create an account</Link></p>
      </div>
    </div>
  );
}
