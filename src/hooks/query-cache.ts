import type { QueryClient, QueryKey } from '@tanstack/react-query';

export const LIST_QUERY_OPTIONS = {
  staleTime: 1000 * 30,
  gcTime: 1000 * 60 * 5,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
} as const;

export const createOptimisticId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const prependItem = <T>(items: T[] | undefined, item: T) => [item, ...(items ?? [])];

export const replaceItemById = <T extends { id: string }>(
  items: T[] | undefined,
  id: string,
  nextItem: T,
) => {
  const currentItems = items ?? [];
  const itemIndex = currentItems.findIndex((item) => item.id === id);

  if (itemIndex === -1) {
    return prependItem(currentItems, nextItem);
  }

  const updatedItems = [...currentItems];
  updatedItems[itemIndex] = nextItem;
  return updatedItems;
};

export const mergeItemById = <T extends { id: string }>(
  items: T[] | undefined,
  id: string,
  updates: Partial<T>,
) => (items ?? []).map((item) => (item.id === id ? ({ ...item, ...updates } as T) : item));

export const removeItemById = <T extends { id: string }>(items: T[] | undefined, id: string) =>
  (items ?? []).filter((item) => item.id !== id);

export const invalidateQueryGroups = (queryClient: QueryClient, queryKeys: QueryKey[]) =>
  Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));