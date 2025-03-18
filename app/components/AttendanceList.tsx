// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "https://absu-girl-project-1.onrender.com/api";

export function AttendanceList() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({});

  useEffect(() => {
    loadAttendanceData();
    loadOfflineData();
    syncOfflineAttendance();
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

  const loadOfflineData = async () => {
    try {
      const offlineData = await AsyncStorage.getItem("offlineAttendance");
      if (offlineData) {
        setSyncStatus(JSON.parse(offlineData));
      }
    } catch (error) {
      console.error("Error loading offline data:", error);
    }
  };

  const syncOfflineAttendance = async () => {
    try {
      const offlineData = await AsyncStorage.getItem("offlineAttendance");
      if (!offlineData) return;

      const attendance = JSON.parse(offlineData);
      const unsyncedEntries = Object.entries(attendance).filter(
        ([_, data]) => !data.synced
      );

      for (const [staffId, data] of unsyncedEntries) {
        try {
          const response = await fetch(`${API_URL}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              staffId,
              status: "Present",
              checkIn: data.timestamp,
            }),
          });

          if (response.ok) {
            setSyncStatus((prev) => ({
              ...prev,
              [staffId]: { ...data, synced: true },
            }));
            await AsyncStorage.setItem(
              "offlineAttendance",
              JSON.stringify({
                ...attendance,
                [staffId]: { ...data, synced: true },
              })
            );
          }
        } catch (error) {
          console.error("Sync failed for staff:", staffId, error);
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAttendanceData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const hasMarkedAttendanceToday = async (staffId) => {
    try {
      const history = await AsyncStorage.getItem("attendanceHistory");
      const attendanceHistory = history ? JSON.parse(history) : {};
      const today = new Date().toISOString().split("T")[0];
      return attendanceHistory[staffId] === today;
    } catch (error) {
      console.error("Error checking attendance:", error);
      return false;
    }
  };

  const handleMarkPresent = async (staffId) => {
    try {
      const alreadyMarked = await hasMarkedAttendanceToday(staffId);
      if (alreadyMarked) return;

      const now = new Date();
      const checkInTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId,
          status: "Present",
          checkIn: checkInTime,
          date: now.toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error("Failed to mark attendance");

      // Save to AsyncStorage with check-in time
      const history = await AsyncStorage.getItem("attendanceHistory");
      const attendanceHistory = history ? JSON.parse(history) : {};
      attendanceHistory[staffId] = {
        date: now.toISOString().split("T")[0],
        checkIn: checkInTime,
      };
      await AsyncStorage.setItem(
        "attendanceHistory",
        JSON.stringify(attendanceHistory)
      );

      // Update local state with check-in time
      setStaffList((currentList) =>
        currentList.map((person) => {
          if (person._id === staffId) {
            return {
              ...person,
              status: "Present",
              checkIn: checkInTime,
            };
          }
          return person;
        })
      );
    } catch (error) {
      console.error("Failed to mark present:", error);
    }
  };

  const renderItem = ({ item }) => {
    const [canMarkAttendance, setCanMarkAttendance] = useState(true);

    useEffect(() => {
      hasMarkedAttendanceToday(item._id).then((marked) =>
        setCanMarkAttendance(!marked)
      );
    }, [item._id]);

    return (
      <Pressable
        style={[styles.card, !canMarkAttendance && styles.cardDisabled]}
        onPress={() =>
          canMarkAttendance &&
          item.status !== "Present" &&
          handleMarkPresent(item._id)
        }
        disabled={!canMarkAttendance}
      >
        <View style={styles.cardContent}>
          <View style={styles.nameSection}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.department}>{item.department}</Text>
          </View>

          <View style={styles.statusSection}>
            {syncStatus[item._id] && !syncStatus[item._id].synced && (
              <Ionicons
                name="sync"
                size={16}
                color="#6B7280"
                style={styles.syncIcon}
              />
            )}
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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
  cardDisabled: {
    opacity: 0.6,
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
  syncIcon: {
    position: "absolute",
    top: -8,
    right: -8,
  },
});
