import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location';
import axios from 'axios';

type WeatherData = {
  city: string;
  temp: number;
  description: string;
  humidity: number;
  wind_speedy: string;
  cloudiness: number;
  currently: string;
  condition_slug: string;
  forecast: {
    date: string;
    weekday: string;
    max: number;
    min: number;
    description: string;
    condition: string;
    cloudiness: number;
    temp: number;
  }[];
};

// Definindo o tipo para as sugestões de cidade
type CitySuggestion = {
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
};

const HomeScreen: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [cityQuery, setCityQuery] = useState<string>('');
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>([]);
  const [allCities, setAllCities] = useState<CitySuggestion[]>([]);
  const API_KEY = 'f814685d';

  useEffect(() => {
    const getLocationAndFetchWeather = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização negada');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    };

    const fetchAllCities = async () => {
      try {
        const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
        setAllCities(response.data);
      } catch (error) {
        console.error("Erro ao buscar lista de todas as cidades:", error);
      }
    };

    fetchAllCities();
    getLocationAndFetchWeather();
  }, []);

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(`https://api.hgbrasil.com/weather`, {
        params: {
          key: API_KEY,
          lat: latitude,
          lon: longitude,
        },
      });
      const data = response.data.results;
      setWeatherData(data);
      setTheme(data.currently === 'dia' ? 'light' : 'dark');
    } catch (error) {
      console.error("Erro ao buscar dados climáticos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city: string, state: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://api.hgbrasil.com/weather`, {
        params: {
          key: API_KEY,
          city_name: `${city},${state}`,
        },
      });
      const data = response.data.results;
      setWeatherData(data);
      setTheme(data.currently === 'dia' ? 'light' : 'dark');
    } catch (error) {
      console.error("Erro ao buscar dados climáticos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterCities = (query: string) => {
    setCityQuery(query);
    if (query.length < 2) {
      setCitySuggestions([]);
      return;
    }
    const filtered = allCities
      .filter(city => city.nome.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 10);
    setCitySuggestions(filtered);
  };

  const handleCitySelect = (city: string, state: string) => {
    setCityQuery(`${city}, ${state}`);
    setCitySuggestions([]);
    fetchWeatherByCity(city, state);
  };

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

  const { city, temp, description, humidity, wind_speedy, cloudiness, forecast } = weatherData;
  const currentDate = new Date();
  const month = currentDate.toLocaleString('default', { month: 'short' });
  const day = currentDate.getDate();


  // Calcula uma "temperatura média" entre máxima e mínima para simular dados horários
  const calculateHourlyTemp = (max: number, min: number) => Math.round((max + min) / 2);

  // Gera as próximas 4 horas a partir da hora atual
  const generateNextHours = (startHour: number) => {
    const hours = [];
    for (let i = 1; i < 5; i++) {
      hours.push((startHour + i) % 24); // Garante que a hora não passe de 24
    }
    return hours;
  };

  const nextHours = generateNextHours(currentDate.getHours());
  const hourlyTemp = calculateHourlyTemp(forecast[0].max, forecast[0].min);

  return (
    <SafeAreaView style={[styles.container, theme === 'light' ? styles.lightTheme : styles.darkTheme]}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Digite a cidade"
          value={cityQuery}
          onChangeText={(text) => filterCities(text)}
        />
        {citySuggestions.length > 0 && (
          <FlatList
            data={citySuggestions}
            keyExtractor={(item) => item.nome}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleCitySelect(item.nome, item.microrregiao.mesorregiao.UF.sigla)}>
                <Text style={styles.suggestionItem}>{item.nome} - {item.microrregiao.mesorregiao.UF.sigla}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}
      </View>

      <FlatList
        data={[{ key: 'weather' }]}
        renderItem={() => (
          <>
            <View style={styles.header}>
              <Text style={styles.city}>{city}</Text>
              <SvgUri
                width="100"
                height="100"
                uri={`https://assets.hgbrasil.com/weather/icons/conditions/${weatherData.condition_slug}.svg`}
              />
              <Text style={styles.temperature}>{temp}°</Text>
              <Text style={styles.description}>{description}</Text>
              <Text style={styles.minMax}>Max: {forecast[0].max}° Min: {forecast[0].min}°</Text>
            </View>

            <View style={[styles.statsContainer, theme === 'light' ? styles.containerLight : styles.containerDark]}>
              <View style={styles.stat}>
                <Text style={styles.statText}>{humidity}%</Text>
                <Text style={styles.statLabel}>Umidade</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statText}>{wind_speedy}</Text>
                <Text style={styles.statLabel}>Vento</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statText}>{cloudiness}%</Text>
                <Text style={styles.statLabel}>Nebulosidade</Text>
              </View>
            </View>

            <View style={[styles.todayContainer, theme === 'light' ? styles.containerLight : styles.containerDark]}>
              <View style={styles.todayHeader}>
                <Text style={styles.todayTitle}>Hoje</Text>
                <Text style={styles.todayDate}>{`${month}, ${day}`}</Text>
              </View>
              <FlatList
                data={nextHours}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.hourlyItem}>
                    <Text style={styles.hourlyTemp}>{hourlyTemp}°</Text>
                    <SvgUri
                      width="40"
                      height="40"
                      uri={`https://assets.hgbrasil.com/weather/icons/conditions/${forecast[0].condition}.svg`}
                    />
                    <Text style={styles.hourlyTime}>{`${item}:00`}</Text>
                  </View>
                )}
              />
            </View>

            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>Próximos dias</Text>
              {forecast.slice(1, 8).map((day, index) => (
                <View key={index} style={[styles.forecastItem, theme === 'light' ? styles.containerLight : styles.containerDark]}>
                  <Text style={styles.forecastDay}>{day.weekday}</Text>
                  <SvgUri
                    width="40"
                    height="40"
                    uri={`https://assets.hgbrasil.com/weather/icons/conditions/${day.condition}.svg`}
                  />
                  <Text style={styles.forecastTemp}>{day.max}° / {day.min}°</Text>
                </View>
              ))}
            </View>
          </>
        )}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  lightTheme: {
    backgroundColor: '#87CEEB', // Fundo azul claro para o tema diurno
  },
  darkTheme: {
    backgroundColor: '#1E2A78', // Fundo azul escuro para o tema noturno
  },
  containerLight:{
    backgroundColor:'#6ca6a3',
  },
  containerDark:{
    backgroundColor:'#2E3B9F'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
  },
  suggestionItem: {
    padding: 10,
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
    color: '#fff',
  },
  todayContainer: {
    backgroundColor: '#2E3B9F',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  todayTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  todayDate: {
    fontSize: 16,
    color: '#ddd',
  },
  hourlyItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  hourlyTime: {
    color: '#fff',
    fontSize: 14,
  },
  hourlyIcon: {
    width: 40,
    height: 40,
    marginVertical: 5,
  },
  hourlyTemp: {
    color: '#fff',
    fontSize: 14,
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
