import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook personnalisé pour les requêtes Supabase
 * @param {string} table - Nom de la table
 * @param {object} options - Options de requête
 * @returns {object} - { data, loading, error, refetch }
 */
export const useSupabaseQuery = (table, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select(options.select || '*');

      // Appliquer les filtres
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Appliquer le tri
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending !== false
        });
      }

      // Appliquer la limite
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData(result);
    } catch (err) {
      console.error('Supabase query error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table, JSON.stringify(options)]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook pour insérer des données
 */
export const useSupabaseInsert = (table) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const insert = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: insertError } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (insertError) throw insertError;

      return { success: true, data: result };
    } catch (err) {
      console.error('Supabase insert error:', err);
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { insert, loading, error };
};

/**
 * Hook pour mettre à jour des données
 */
export const useSupabaseUpdate = (table) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, data) => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();

      if (updateError) throw updateError;

      return { success: true, data: result };
    } catch (err) {
      console.error('Supabase update error:', err);
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

/**
 * Hook pour supprimer des données
 */
export const useSupabaseDelete = (table) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteRecord = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      return { success: true };
    } catch (err) {
      console.error('Supabase delete error:', err);
      setError(err.message);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { deleteRecord, loading, error };
};
