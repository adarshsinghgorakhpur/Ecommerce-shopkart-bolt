'use client';

'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { initializeDarkMode } from '@/redux/slices/uiSlice';
import { TooltipProvider } from '@/components/ui/tooltip';

function ThemeInitializer() {
  useEffect(() => {
    store.dispatch(initializeDarkMode());
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeInitializer />
      <TooltipProvider>{children}</TooltipProvider>
    </Provider>
  );
}
