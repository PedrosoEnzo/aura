import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

type SensorData = {
  temperature: number;
  humidity: number;
  timestamp: string;
};

export default function App() {
  const [data, setData] = useState<SensorData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<SensorData[]>('http://10.92.199.29:3000/data');
        setData(res.data);
      } catch (err) {
        console.log('Erro ao buscar dados:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados do Sensor</Text>
      <FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Text>
            Temp: {item.temperature}°C | Hum: {item.humidity}%
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 }
});
