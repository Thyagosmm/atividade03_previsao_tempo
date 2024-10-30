import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Button } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

type RouteParams = {
  route: {
    params: {
      city: string;
    };
  };
};

type HistoryItem = {
  date: string;
  temp: {
    max: number;
    min: number;
    avg: number;
  };
  humidity: {
    avg: number;
  };
  wind_speedy: {
    avg: number;
  };
  cloudiness: {
    avg: number;
  };
};

const HistoryScreen: React.FC<RouteParams> = ({ route }) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const { city } = route.params;
  const API_KEY = 'f814685d';

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`https://cors-anywhere.herokuapp.com/https://api.hgbrasil.com/weather/historical`, {
        params: {
          key: API_KEY,
          city_name: city,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
      });
      setHistoryData(Object.values(response.data.results) as HistoryItem[]);
    } catch (err) {
      setError('Não foi possível carregar os dados históricos.');
      console.error("Erro ao buscar dados históricos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.datePickerContainer}>
        <Text>Data Inicial:</Text>
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(event, date) => setStartDate(date || startDate)}
        />
        <Text>Data Final:</Text>
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(event, date) => setEndDate(date || endDate)}
        />
        <Button title="Buscar Histórico" onPress={fetchHistory} />
      </View>

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

      <FlatList
        data={historyData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.tempContainer}>
              <Text style={styles.temp}>Máx: {item.temp.max}°C</Text>
              <Text style={styles.temp}>Mín: {item.temp.min}°C</Text>
              <Text>Média: {item.temp.avg}°C</Text>
            </View>
            <Text>Umidade Média: {item.humidity.avg}%</Text>
            <Text>Velocidade do Vento Média: {item.wind_speedy.avg} km/h</Text>
            <Text>Nebulosidade Média: {item.cloudiness.avg}%</Text>
          </View>
        )}
      />
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  datePickerContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
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
  tempContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  temp: {
    fontSize: 16,
  },
});
