import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleData } from '../data/schedule';

export default function ScheduleScreen() {
  const renderProgram = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="mic" size={30} color="#e91e63" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.programName}>{item.name}</Text>
        <Text style={styles.programTime}>
          <Ionicons name="time-outline" size={14} /> {item.time}
        </Text>
        <Text style={styles.programDays}>
          <Ionicons name="calendar-outline" size={14} /> {item.days}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={scheduleData}
        renderItem={renderProgram}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23058fff',
  },
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: '#f3f1f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  programName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  programTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  programDays: {
    fontSize: 14,
    color: '#e91e63',
    fontWeight: '500',
  },
});