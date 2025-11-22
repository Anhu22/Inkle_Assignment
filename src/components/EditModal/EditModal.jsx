import { useState, useEffect } from 'react';
import './EditModal.css';

// Helper function to capitalize first letter
const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const EditModal = ({ isOpen, onClose, tax, countries, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    gender: ''
  });

  useEffect(() => {
    if (tax) {
      setFormData({
        name: capitalizeFirst(tax.name) || '',
        country: capitalizeFirst(tax.country) || '',
        gender: capitalizeFirst(tax.gender) || ''
      });
    }
  }, [tax]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Searchable country dropdown state
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryList, setShowCountryList] = useState(false);

  useEffect(() => {
    if (tax && tax.country) {
      setCountrySearch(capitalizeFirst(tax.country));
    }
  }, [tax]);

  // Build a deduplicated list of countries (normalized by lowercase trimmed name)
  const uniqueCountries = (countries || []).reduce((map, c) => {
    if (!c || !c.name) return map;
    const raw = c.name.toString().trim();
    const key = raw.toLowerCase();
    if (!map.has(key)) map.set(key, { id: c.id ?? key, name: raw });
    return map;
  }, new Map());

  const uniqueCountryList = Array.from(uniqueCountries.values());

  const filteredCountries = uniqueCountryList.filter(c =>
    capitalizeFirst(c.name).toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleCountrySelect = (name) => {
    setFormData(prev => ({ ...prev, country: name }));
    setCountrySearch(name);
    setShowCountryList(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Customer</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Customer name"
              required
            />
          </div>

          {/*<div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>*/}

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <div className="country-select">
              <input
                type="text"
                id="country"
                name="country"
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setShowCountryList(true);
                }}
                onFocus={() => setShowCountryList(true)}
                placeholder="Search or select a country"
                autoComplete="off"
                required
              />
              <input type="hidden" name="country" value={formData.country} />
              {showCountryList && (
                <div className="country-options" role="listbox">
                  {filteredCountries.length === 0 && (
                    <div className="country-option no-options">No countries found</div>
                  )}
                  {filteredCountries.map(country => (
                    <div
                      key={country.id}
                      className="country-option"
                      role="option"
                      onClick={() => handleCountrySelect(capitalizeFirst(country.name))}
                    >
                      {capitalizeFirst(country.name)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};