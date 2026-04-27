'use client';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase } from '@/services/supabase';
import { useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const syncAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            ...session.user.user_metadata,
          } as any)
        );
      }
    };

    syncAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        dispatch(
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            ...session.user.user_metadata,
          } as any)
        );
      } else {
        dispatch(setUser(null));
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [dispatch]);

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <TooltipProvider>
        <AuthHydrator>{children}</AuthHydrator>
      </TooltipProvider>
    </Provider>
  );
}
