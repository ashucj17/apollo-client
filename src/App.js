import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import './App.css';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/',
  cache: new InMemoryCache()
});

// GraphQL query to fetch all countries
const GET_COUNTRIES = gql`
  query {
    countries {
      code
      name
      emoji
      continent {
        name
      }
    }
  }
`;

// GraphQL query to fetch details of a specific country
const GET_COUNTRY_DETAILS = gql`
  query GetCountry($code: ID!) {
    country(code: $code) {
      code
      name
      native
      capital
      emoji
      currency
      languages {
        code
        name
        native
      }
      continent {
        name
      }
      states {
        name
        code
      }
      phone
    }
  }
`;

// Component to display the list of countries
function CountryList({ onSelectCountry }) {
  const { loading, error, data } = useQuery(GET_COUNTRIES);
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <p className="loading">Loading countries...</p>;
  if (error) return <p className="error">Error: {error.message}</p>;

  // Filter countries based on search term
  const filteredCountries = data.countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="country-list-container">
      <h1>Countries Directory</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a country..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="countries-grid">
        {filteredCountries.map(country => (
          <div key={country.code} className="country-card">
            <div className="country-info">
              <span className="country-emoji">{country.emoji}</span>
              <div>
                <h2>{country.name}</h2>
                <p>{country.continent.name}</p>
              </div>
            </div>
            <button
              onClick={() => onSelectCountry(country.code)}
              className="details-button"
            >
              Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component to display detailed information about a selected country
function CountryDetails({ countryCode, onBack }) {
  const { loading, error, data } = useQuery(GET_COUNTRY_DETAILS, {
    variables: { code: countryCode }
  });

  if (loading) return <p className="loading">Loading country details...</p>;
  if (error) return <p className="error">Error: {error.message}</p>;

  const country = data.country;

  return (
    <div className="country-details-container">
      <button onClick={onBack} className="back-button">
        &larr; Back to Countries
      </button>

      <div className="country-header">
        <span className="country-emoji-large">{country.emoji}</span>
        <div>
          <h1>{country.name}</h1>
          {country.native && country.native !== country.name && (
            <p className="native-name">Native: {country.native}</p>
          )}
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-card">
          <h3>General Information</h3>
          <p><strong>Code:</strong> {country.code}</p>
          <p><strong>Continent:</strong> {country.continent.name}</p>
          {country.capital && <p><strong>Capital:</strong> {country.capital}</p>}
          {country.currency && <p><strong>Currency:</strong> {country.currency}</p>}
          {country.phone && <p><strong>Phone Code:</strong> +{country.phone}</p>}
        </div>

        <div className="detail-card">
          <h3>Languages</h3>
          {country.languages.length > 0 ? (
            <ul className="languages-list">
              {country.languages.map(language => (
                <li key={language.code} className="language-item">
                  <p><strong>{language.name}</strong></p>
                  {language.native && language.native !== language.name && (
                    <p className="native-language">Native: {language.native}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No language data available</p>
          )}
        </div>

        {country.states && country.states.length > 0 && (
          <div className="detail-card states-card">
            <h3>States/Provinces</h3>
            <ul className="states-list">
              {country.states.map(state => (
                <li key={state.code}>{state.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Main App component
function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <div className="app-container">
      {selectedCountry ? (
        <CountryDetails 
          countryCode={selectedCountry} 
          onBack={() => setSelectedCountry(null)}
        />
      ) : (
        <CountryList 
          onSelectCountry={(code) => setSelectedCountry(code)}
        />
      )}
    </div>
  );
}

// Wrap the App with ApolloProvider
function ApolloApp() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

export default ApolloApp;