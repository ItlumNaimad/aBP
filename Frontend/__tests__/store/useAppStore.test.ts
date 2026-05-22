import { act } from '@testing-library/react-native';
import { useAppStore } from '../../store/useAppStore';

describe('useAppStore', () => {
  const initialStoreState = useAppStore.getState();

  beforeEach(() => {
    useAppStore.setState(initialStoreState, true);
  });

  it('powinien być niezalogowany na starcie', () => {
    const { user } = useAppStore.getState();
    expect(user).toBeNull();
  });

  it('akcja setUser pomyślnie loguje użytkownika', () => {
    act(() => {
      useAppStore.getState().setUser({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
      });
    });

    const state = useAppStore.getState();
    expect(state.user).not.toBeNull();
    expect(state.user?.username).toBe('testuser');
  });

  it('akcja logout wylogowuje użytkownika i czyści dane', () => {
    // Najpierw logujemy
    act(() => {
      useAppStore.getState().setUser({
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
      });
    });

    // Potem wylogowujemy
    act(() => {
      useAppStore.getState().logout();
    });

    const state = useAppStore.getState();
    expect(state.user).toBeNull();
  });

  it('toggleTheme przełącza między trybami ciemnym i jasnym', () => {
    const initialState = useAppStore.getState().isDarkMode;
    
    act(() => {
      useAppStore.getState().toggleTheme();
    });
    
    expect(useAppStore.getState().isDarkMode).toBe(!initialState);
    
    act(() => {
      useAppStore.getState().toggleTheme();
    });
    
    expect(useAppStore.getState().isDarkMode).toBe(initialState);
  });
});
