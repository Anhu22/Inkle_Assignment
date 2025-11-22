import { useState } from 'react';
import { TaxTable } from './components/TaxTable/TaxTable';
import { EditModal } from './components/EditModal/EditModal';
import { Loading } from './components/Loading/Loading';
import { useTaxes } from './hooks/useTaxes';
import { useCountries } from './hooks/useCountries';
import './App.css';

// Helper function to capitalize first letter
const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

function App() {
  const { taxes, loading: taxesLoading, error: taxesError, updateTax } = useTaxes();
  const { countries, loading: countriesLoading } = useCountries();
  
  const [editingTax, setEditingTax] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Helper function to format date with capitalized month
  function formatDate(dateString) {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    // Capitalize the month (toLocaleDateString returns lowercase month)
    return formattedDate.split(' ').map(part => capitalizeFirst(part)).join(' ');
  }

  // Transform tax data to match the design columns - USE ACTUAL GENDER FROM API
  const transformedTaxes = taxes.map(tax => ({
    ...tax,
    name: capitalizeFirst(tax.name),
    country: capitalizeFirst(tax.country),
    gender: capitalizeFirst(tax.gender),
    date: formatDate(tax.createdAt) // Format the actual createdAt date
  }));

  const handleEdit = (tax) => {
    setEditingTax(tax);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTax(null);
  };

  const handleSave = async (updatedData) => {
    try {
      setSaveLoading(true);
      await updateTax(editingTax.id, updatedData);
      handleCloseModal();
    } catch (error) {
      console.error('Failed to update tax:', error);
      alert('Failed to update tax. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (taxesLoading) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>Customer Management</h1>
        </div>
        <Loading />
      </div>
    );
  }

  if (taxesError) {
    return (
      <div className="app">
        <div className="app-header">
          <h1>Customer Management</h1>
        </div>
        <div className="error-container">
          <h2>Error Loading Data</h2>
          <p>{taxesError}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Customer Management</h1>
      </header>
      
      <main className="app-main">
        <TaxTable data={transformedTaxes} onEdit={handleEdit} />
      </main>

      <EditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tax={editingTax}
        countries={countries}
        onSave={handleSave}
        loading={saveLoading}
      />
    </div>
  );
}

export default App;