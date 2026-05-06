/**
 * Returns true when an item should be visible to a user from a given state.
 * - If the item has no available_states (empty/null) → Global, visible everywhere.
 * - If userState is empty → show everything (no profile state set yet).
 * - Otherwise, show only when userState is in available_states.
 */
export const isVisibleInState = (
  availableStates: string[] | null | undefined,
  userState: string | null | undefined,
): boolean => {
  if (!availableStates || availableStates.length === 0) return true;
  if (!userState) return true;
  return availableStates.includes(userState);
};

export const filterByState = <T extends { available_states?: string[] | null }>(
  items: T[],
  userState: string | null | undefined,
): T[] => items.filter((i) => isVisibleInState(i.available_states, userState));
