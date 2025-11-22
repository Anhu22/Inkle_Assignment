// src/hooks/useTaxes.js
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useTaxes = () => {
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaxes = async () => {
    try {
      setLoading(true);
      const data = await api.getTaxes();
      setTaxes(data);
    } catch (err) {
      setError('Failed to fetch taxes');
    } finally {
      setLoading(false);
    }
  };

  const updateTax = async (id, updatedData) => {
    try {
      const updatedTax = await api.updateTax(id, updatedData);
      setTaxes(prev => prev.map(tax => 
        tax.id === id ? { ...tax, ...updatedTax } : tax
      ));
      return updatedTax;
    } catch (err) {
      throw new Error('Failed to update tax');
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  return { taxes, loading, error, updateTax, refetch: fetchTaxes };
};