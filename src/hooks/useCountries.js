// src/hooks/useCountries.js
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const data = await api.getCountries();
      setCountries(data);
    } catch (err) {
      setError('Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return { countries, loading, error, refetch: fetchCountries };
};