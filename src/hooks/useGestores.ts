import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Gestor = Database['public']['Tables']['Gestores']['Row'];
type GestorInsert = Database['public']['Tables']['Gestores']['Insert'];
type GestorUpdate = Database['public']['Tables']['Gestores']['Update'];

export const useGestores = () => {
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGestores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('Gestores')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      setGestores(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar gestores');
    } finally {
      setLoading(false);
    }
  };

  const createGestor = async (gestorData: GestorInsert) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Gestores')
        .insert(gestorData)
        .select()
        .single();

      if (error) throw error;
      
      setGestores(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar gestor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateGestor = async (id: number, gestorData: GestorUpdate) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Gestores')
        .update({ ...gestorData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setGestores(prev => 
        prev.map(gestor => gestor.id === id ? data : gestor)
          .sort((a, b) => a.nome.localeCompare(b.nome))
      );
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar gestor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteGestor = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('Gestores')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setGestores(prev => prev.filter(gestor => gestor.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir gestor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGestores();
  }, []);

  return {
    gestores,
    loading,
    error,
    fetchGestores,
    createGestor,
    updateGestor,
    deleteGestor,
  };
};