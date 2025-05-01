import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import { FiChevronRight, FiChevronLeft, FiGlobe, FiMapPin, FiDollarSign, FiPhone } from 'react-icons/fi';
import { IoLanguage } from 'react-icons/io5';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/',
  cache: new InMemoryCache()
});

// GraphQL query for countries list
const GET_COUNTRIES = gql`
  query GetCountries {
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

// GraphQL query for country details
const GET_COUNTRY_DETAILS = gql`
  query GetCountryDetails($code: ID!) {
    country(code: $code) {
      code
      name
      native
      phone
      capital
      currency
      emoji
      emojiU
      languages {
        code
        name
        native
      }
      continent {
        name
        code
      }
      states {
        name
        code
      }
    }
  }
`;

// CountryList component to display all countries
function CountryList({ onSelectCountry }) {
  const { loading, error, data } = useQuery(GET_COUNTRIES);
  const [searchTerm, setSearchTerm] = useState('');
  
  if (loading) return <div className="text-center py-8">Loading countries...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading countries: {error.message}</div>;
  
  const filteredCountries = data.countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-6">Countries of the World</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search countries..."
            className="w-full p-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCountries.map((country) => (
          <div 
            key={country.code} 
            className="border rounded p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{country.emoji}</span>
                <div>
                  <h2 className="font-bold">{country.name}</h2>
                  <p className="text-sm text-gray-600">{country.continent.name}</p>
                </div>
              </div>
              <button
                onClick={() => onSelectCountry(country.code)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center"
              >
                Details <FiChevronRight className="ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CountryDetails component to display detailed information about a selected country
function CountryDetails({ countryCode, onBack }) {
  const { loading, error, data } = useQuery(GET_COUNTRY_DETAILS, {
    variables: { code: countryCode },
  });

  if (loading) return <div className="text-center py-8">Loading country details...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading country details: {error.message}</div>;

  const country = data.country;

  return (
    <div className="p-4">
      <button 
        onClick={onBack}
        className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
      >
        <FiChevronLeft className="mr-1" /> Back to countries
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="text-4xl mr-3">{country.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold">{country.name}</h1>
              <p className="text-gray-600">{country.native}</p>
            </div>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            Code: {country.code}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <FiGlobe className="text-blue-500 mr-2 mt-1" />
            <div>
              <h2 className="font-semibold">Continent</h2>
              <p>{country.continent.name} ({country.continent.code})</p>
            </div>
          </div>

          {country.capital && (
            <div className="flex items-start">
              <FiMapPin className="text-red-500 mr-2 mt-1" />
              <div>
                <h2 className="font-semibold">Capital</h2>
                <p>{country.capital}</p>
              </div>
            </div>
          )}

          {country.currency && (
            <div className="flex items-start">
              <FiDollarSign className="text-green-500 mr-2 mt-1" />
              <div>
                <h2 className="font-semibold">Currency</h2>
                <p>{country.currency}</p>
              </div>
            </div>
          )}

          {country.phone && (
            <div className="flex items-start">
              <FiPhone className="text-gray-500 mr-2 mt-1" />
              <div>
                <h2 className="font-semibold">Phone Code</h2>
                <p>+{country.phone}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center mb-2">
            <IoLanguage className="text-purple-500 mr-2" />
            <h2 className="font-semibold">Languages</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ml-7">
            {country.languages.map(lang => (
              <div key={lang.code} className="bg-gray-50 p-2 rounded">
                <p className="font-medium">{lang.name}</p>
                <p className="text-sm text-gray-600">{lang.native}</p>
              </div>
            ))}
          </div>
        </div>

        {country.states && country.states.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center mb-2">
              <FiMapPin className="text-orange-500 mr-2" />
              <h2 className="font-semibold">States/Provinces</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ml-7">
              {country.states.map(state => (
                <div key={state.code} className="bg-gray-50 p-2 rounded">
                  <p>{state.name}</p>
                </div>
              ))}
            </div>
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
    <div className="max-w-6xl mx-auto">
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

// Wrap the main app with ApolloProvider
function ApolloApp() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

export default ApolloApp;