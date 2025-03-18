// @ts-nocheck
import { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://absu-girl-project-1.onrender.com/api";

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

      // Match dashboard format - merge staff and attendance data
      const staffWithAttendance = staff.map((person) => {
        const todayRecord = attendance.find((a) => a.staffId === person._id);
        return {
          ...person,
          status: todayRecord ? todayRecord.status : "Absent",
          checkIn: todayRecord ? todayRecord.checkIn : "-",
        };
      });

      setStaffList(staffWithAttendance);
      await AsyncStorage.setItem(
        "staffList",
        JSON.stringify(staffWithAttendance)
      );
    } catch (error) {
      console.error("Error loading data:", error);
      setError(error.message);

      // Fallback to cached data
      const cached = await AsyncStorage.getItem("staffList");
      if (cached) {
        setStaffList(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = async (staffId) => {
    try {
      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId,
          status: "Present",
          checkIn: new Date().toLocaleTimeString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to mark attendance");

      // Update local state to match dashboard behavior
      setStaffList((currentList) =>
        currentList.map((person) => {
          if (person._id === staffId) {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return {
              ...person,
              status: "Present",
              checkIn: timeString,
            };
          }
          return person;
        })
      );
    } catch (error) {
      console.error("Failed to mark present:", error);
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => item.status !== "Present" && handleMarkPresent(item._id)}
    >
      <View style={styles.cardContent}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.department}>{item.department}</Text>
        </View>

        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              item.status === "Present"
                ? styles.presentBadge
                : styles.absentBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "Present"
                  ? styles.presentText
                  : styles.absentText,
              ]}
            >
              {item.status}
            </Text>
          </View>
          <Text style={styles.checkInText}>{item.checkIn}</Text>
        </View>
      </View>
    </Pressable>
  );

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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={staffList}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  department: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusSection: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  presentBadge: {
    backgroundColor: "#DEF7EC",
  },
  absentBadge: {
    backgroundColor: "#FDE8E8",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  presentText: {
    color: "#057A55",
  },
  absentText: {
    color: "#E02424",
  },
  checkInText: {
    fontSize: 12,
    color: "#6B7280",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#E02424",
    fontSize: 16,
  },
});
