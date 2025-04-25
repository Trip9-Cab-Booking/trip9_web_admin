// app/providers.tsx (or your own file name, e.g., "redux-provider.tsx")
'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}
