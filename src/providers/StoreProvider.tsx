import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps the app in the Redux Provider and PersistGate.
 * Import and use this as the outermost wrapper in _layout.tsx.
 */
export default function StoreProvider({ children }: Props) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
