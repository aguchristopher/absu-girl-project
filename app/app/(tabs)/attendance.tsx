// @ts-nocheck
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AttendanceList } from "@/components/AttendanceList";

const AttendanceScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>24</Text>
          <Text style={styles.summaryLabel}>Total Staff</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, styles.presentText]}>18</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, styles.absentText]}>6</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
      </View>

      <AttendanceList />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  date: {
    color: "#666",
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
    // elevation: 0.2,
    borderWidth: 0.15,
    borderColor: "grey",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
  },
  presentText: {
    color: "#4CAF50",
  },
  absentText: {
    color: "#F44336",
  },
});

export default AttendanceScreen;
