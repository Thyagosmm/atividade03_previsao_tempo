import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import axios from 'axios';

// Definindo o tipo para os dados meteorológicos
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

const HomeScreen: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const API_KEY = 'f814685d';
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://api.hgbrasil.com/weather`, {
          params: {
            key: API_KEY,
            user_ip: 'remote',
          },
        });
        setWeatherData(response.data.results);
      } catch (error) {
        console.error("Erro ao buscar dados climáticos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados climáticos...</Text>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={styles.center}>
        <Text>Não foi possível carregar os dados climáticos.</Text>
      </View>
    );
  }

  const { city, temp, description, humidity, wind_speedy, sunrise, sunset, condition_slug } = weatherData;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.city}>{city}</Text>
        <Text style={styles.temperature}>{temp}°C</Text>
        <Image
          style={styles.icon}
          source={{ uri: `https://assets.hgbrasil.com/weather/icons/conditions/${condition_slug}.svg` }}
        />
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.details}>
          <Text>Umidade: {humidity}%</Text>
          <Text>Vento: {wind_speedy}</Text>
          <Text>Amanhecer: {sunrise}</Text>
          <Text>Pôr do Sol: {sunset}</Text>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
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
});
