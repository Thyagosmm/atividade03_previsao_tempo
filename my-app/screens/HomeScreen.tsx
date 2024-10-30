import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, ScrollView } from 'react-native';
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
  forecast: {
    date: string;
    weekday: string;
    max: number;
    min: number;
    description: string;
    condition: string;
  }[];
};

const HomeScreen: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const API_KEY = 'f814685d';
  
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const city = 'Recife';
        const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://api.hgbrasil.com/weather`, {
          params: {
            key: API_KEY,
            city_name: city,
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

  const { city, temp, description, humidity, wind_speedy, forecast } = weatherData;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.city}>{city}</Text>
        <Image
          style={styles.icon}
          source={{ uri: `https://assets.hgbrasil.com/weather/icons/conditions/${weatherData.condition_slug}.svg` }}
        />
        <Text style={styles.temperature}>{temp}°</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.minMax}>Max: {forecast[0].max}° Min: {forecast[0].min}°</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statText}>{humidity}%</Text>
          <Text style={styles.statLabel}>Umidade</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statText}>{wind_speedy}</Text>
          <Text style={styles.statLabel}>Vento</Text>
        </View>
      </View>

      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>Próximos dias</Text>
        {forecast.slice(1, 6).map((day, index) => (
          <View key={index} style={styles.forecastItem}>
            <Text style={styles.forecastDay}>{day.weekday}</Text>
            <Image
              style={styles.forecastIcon}
              source={{ uri: `https://assets.hgbrasil.com/weather/icons/conditions/${day.condition}.svg` }}
            />
            <Text style={styles.forecastTemp}>{day.max}° / {day.min}°</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2A78',
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  city: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  temperature: {
    fontSize: 80,
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  description: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  minMax: {
    fontSize: 16,
    color: '#ddd',
  },
  icon: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2E3B9F',
    borderRadius: 10,
    padding: 15,
    marginVertical: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  forecastContainer: {
    marginVertical: 20,
  },
  forecastTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#2E3B9F',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  forecastDay: {
    fontSize: 16,
    color: '#fff',
  },
  forecastIcon: {
    width: 40,
    height: 40,
  },
  forecastTemp: {
    fontSize: 16,
    color: '#fff',
  },
});
