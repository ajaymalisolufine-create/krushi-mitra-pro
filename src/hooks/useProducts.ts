import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  LIST_QUERY_OPTIONS,
  createOptimisticId,
  mergeItemById,
  prependItem,
  removeItemById,
  replaceItemById,
} from './query-cache';

export interface Product {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  category: string;
  crops: string[] | null;
  dosage: string | null;
  mrp: number;
  image_url: string | null;
  icon: string | null;
  status: string;
  benefits: string[] | null;
  available_states: string[] | null;
  is_trending: boolean;
  is_best_seller: boolean;
  translations: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

const PRODUCTS_QUERY_KEY = ['products'] as const;
const PRODUCT_FIELDS = 'id,name,tagline,description,category,crops,dosage,mrp,image_url,icon,status,benefits,available_states,is_trending,is_best_seller,translations,created_at,updated_at';

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    ...LIST_QUERY_OPTIONS,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select(PRODUCT_FIELDS)
        .single();

      if (error) throw error;
      return data as Product;
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      const previous = queryClient.getQueryData<Product[]>(PRODUCTS_QUERY_KEY);
      const optimisticId = createOptimisticId();
      const now = new Date().toISOString();

      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old) =>
        prependItem(old, {
          ...product,
          id: optimisticId,
          created_at: now,
          updated_at: now,
        }),
      );

      return { previous, optimisticId };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previous);
      toast.error('Failed to create product: ' + error.message);
    },
    onSuccess: (createdProduct, _, context) => {
      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old) =>
        replaceItemById(old, context?.optimisticId ?? createdProduct.id, createdProduct),
      );
      toast.success('Product created successfully');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProductUpdate }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select(PRODUCT_FIELDS)
        .single();

      if (error) throw error;
      return data as Product;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      const previous = queryClient.getQueryData<Product[]>(PRODUCTS_QUERY_KEY);
      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old) =>
        mergeItemById(old, id, { ...updates, updated_at: new Date().toISOString() } as Partial<Product>),
      );
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previous);
      toast.error('Failed to update product: ' + error.message);
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old) =>
        replaceItemById(old, updatedProduct.id, updatedProduct),
      );
      toast.success('Product updated successfully');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      const previous = queryClient.getQueryData<Product[]>(PRODUCTS_QUERY_KEY);
      queryClient.setQueryData<Product[]>(PRODUCTS_QUERY_KEY, (old) => removeItemById(old, id));
      return { previous };
    },
    onError: (error, _, context) => {
      if (context?.previous) queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previous);
      toast.error('Failed to delete product: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
    },
  });
};
