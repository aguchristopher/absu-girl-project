// @ts-nocheck
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import { STAFF_LIST, Staff } from "@/constants/Staff";

const API_URL = "http://localhost:5000/api"; // You should move this to env config

export function AttendanceList() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      const [staffResponse, attendanceResponse] = await Promise.all([
        fetch(`${API_URL}/staff`),
        fetch(`${API_URL}/attendance/today`),
      ]);

      if (!staffResponse.ok || !attendanceResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const staff = await staffResponse.json();
      const attendance = await attendanceResponse.json();

      // Merge staff and attendance data
      const staffWithAttendance = staff.map((person) => {
        const todayRecord = attendance.find((a) => a.staffId === person._id);
        return {
          ...person,
          present: !!todayRecord,
        };
      });

      setStaffList(staffWithAttendance);

      // Also save to AsyncStorage for offline access
      await AsyncStorage.setItem(
        "attendance",
        JSON.stringify(
          Object.fromEntries(staffWithAttendance.map((s) => [s._id, s.present]))
        )
      );
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error.message);

      // Fallback to local storage if network fails
      const localData = await AsyncStorage.getItem("attendance");
      if (localData) {
        const attendance = JSON.parse(localData);
        // ...handle local data...
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading attendance data</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Staff }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.position}>{item.position}</Text>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          item.present ? styles.presentBadge : styles.absentBadge,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            item.present ? styles.presentText : styles.absentText,
          ]}
        >
          {item.present ? "Present" : "Absent"}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={staffList}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom tab bar
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 0.2,
    borderWidth: 0.7,
    borderColor: "grey",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    color: "#1976D2",
    fontWeight: "600",
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
  },
  position: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  presentBadge: {
    backgroundColor: "#E8F5E9",
  },
  absentBadge: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B5E20",
  },
  presentText: {
    color: "#1B5E20",
  },
  absentText: {
    color: "#B71C1C",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});
