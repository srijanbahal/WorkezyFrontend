import { useNavigationState } from '@react-navigation/native';

/**
 * A custom hook to get the name of the currently focused screen.
 * This can be used outside of screen components, as long as it's
 * a descendant of the NavigationContainer.
 */
export function useCurrentRouteName() {
  return useNavigationState(state =>
    state ? state.routes[state.index]?.name : undefined
  );
}