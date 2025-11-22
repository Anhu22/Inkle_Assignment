const BASE_URL = 'https://685013d7e7c42cfd17974a33.mockapi.io';

export const api = {
  // Taxes API
  getTaxes: () => 
    fetch(`${BASE_URL}/taxes`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch taxes');
        return res.json();
      }),
  
  updateTax: (id, data) => 
    fetch(`${BASE_URL}/taxes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update tax');
      return res.json();
    }),

  // Countries API
  getCountries: () => 
    fetch(`${BASE_URL}/countries`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch countries');
        return res.json();
      }),
};