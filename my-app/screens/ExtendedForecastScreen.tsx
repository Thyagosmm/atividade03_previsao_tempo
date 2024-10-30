import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';

type ForecastItem = {
  date: string;
  weekday: string;
  max: number;
  min: number;
  humidity: number;
  rain_probability: number;
  wind_speedy: string;
  description: string;
};

type RouteParams = {
  route: {
    params: {
      city: string;
    };
  };
};

const ExtendedForecastScreen: React.FC<RouteParams> = ({ route }) => {
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { city } = route.params;
  const API_KEY = 'f814685d';

  useEffect(() => {
    const fetchExtendedForecast = async () => {
      try {
        const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://api.hgbrasil.com/weather`, {
          params: {
            key: API_KEY,
            city_name: city,
          },
        });
        setForecastData(response.data.results.forecast);
      } catch (err) {
        setError('Não foi possível carregar a previsão estendida.');
        console.error("Erro ao buscar previsão estendida:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExtendedForecast();
  }, [city]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando previsão estendida...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={forecastData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date} - {item.weekday}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.tempContainer}>
              <Text style={styles.temp}>Máx: {item.max}°C</Text>
              <Text style={styles.temp}>Mín: {item.min}°C</Text>
            </View>
            <Text>Umidade: {item.humidity}%</Text>
            <Text>Probabilidade de chuva: {item.rain_probability}%</Text>
            <Text>Vento: {item.wind_speedy}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ExtendedForecastScreen;

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
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  temp: {
    fontSize: 16,
  },
});
