import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TextInput  } from 'react-native';
import axios from 'axios';

type WeatherData = {
  city: string;
  temp: number;
  description: string;
  humidity: number;
  wind_speedy: string;
  sunrise: string;
  sunset: string;
  condition_slug: string;
};

const SearchScreen: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const API_KEY = 'f814685d';

  const handleCityChange = (text: string) => {
    setCity(text);
  };

  const searchCityWeather = async () => {
    if (!city) {
      setError('Por favor, insira o nome de uma cidade.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://api.hgbrasil.com/weather`, {
        params: {
          key: API_KEY,
          city_name: city,
        },
      });
      setWeatherData(response.data.results);
    } catch (err) {
      setError('Não foi possível encontrar a cidade.');
      console.error("Erro ao buscar cidade:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome da cidade"
        onChangeText={handleCityChange}
        value={city}
        onSubmitEditing={searchCityWeather}
      />

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {weatherData && (
        <View style={styles.card}>
          <Text style={styles.city}>{weatherData.city}</Text>
          <Text style={styles.temperature}>{weatherData.temp}°C</Text>
          <Image
            style={styles.icon}
            source={{ uri: `https://assets.hgbrasil.com/weather/icons/conditions/${weatherData.condition_slug}.svg` }}
          />
          <Text style={styles.description}>{weatherData.description}</Text>

          <View style={styles.details}>
            <Text>Umidade: {weatherData.humidity}%</Text>
            <Text>Vento: {weatherData.wind_speedy}</Text>
            <Text>Amanhecer: {weatherData.sunrise}</Text>
            <Text>Pôr do Sol: {weatherData.sunset}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  city: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
  icon: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  description: {
    fontSize: 18,
    color: '#555',
  },
  details: {
    marginTop: 15,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
  }
});
