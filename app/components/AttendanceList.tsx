// @ts-nocheck
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";

import { STAFF_LIST, Staff } from "@/constants/Staff";

export function AttendanceList() {
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await AsyncStorage.getItem("attendance");
      if (data) {
        setAttendance(JSON.parse(data));
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

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
          attendance[item.id] ? styles.presentBadge : styles.absentBadge,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            attendance[item.id] ? styles.presentText : styles.absentText,
          ]}
        >
          {attendance[item.id] ? "Present" : "Absent"}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={STAFF_LIST}
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
});
