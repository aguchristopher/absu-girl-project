// @ts-nocheck
import {
  Camera,
  CameraType,
  BarcodeScanningResult,
  useCameraPermissions,
  CameraView,
} from "expo-camera";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Button,
  Alert,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { STAFF_LIST } from "@/constants/Staff";

const API_URL = "http://localhost:5000/api"; // You should move this to env config

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [loading, setLoading] = useState(false);

  // Request permission on mount if not determined
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <ThemedText>Checking camera permissions...</ThemedText>;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>No access to camera</ThemedText>
        <Button title="Grant Permission" onPress={requestPermission} />
      </ThemedView>
    );
  }

  const handleBarCodeScanned = async ({ data }: BarCodeScanningResult) => {
    setScanned(true);
    setLoading(true);

    try {
      // Parse the QR code data
      const staffData = JSON.parse(data);

      // Mark attendance in the backend
      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: staffData.id,
          status: "Present",
          checkIn: new Date().toLocaleTimeString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark attendance");
      }

      // Save to local storage for offline access
      const existingData = await AsyncStorage.getItem("attendance");
      const attendance = existingData ? JSON.parse(existingData) : {};
      attendance[staffData.id] = true;
      await AsyncStorage.setItem("attendance", JSON.stringify(attendance));

      setLoading(false);
      Alert.alert("Success", "Attendance marked successfully", [
        { text: "OK", onPress: () => router.push("/attendance") },
      ]);
    } catch (error) {
      console.error("Error marking attendance:", error);
      Alert.alert("Error", "Failed to mark attendance. Please try again.");
      setLoading(false);
      setTimeout(() => setScanned(false), 1500);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <CameraView
        style={styles.scanner}
        facing={facing}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{
          barCodeTypes: ["qr", "code128", "code39"],
        }}
      />
      <View style={styles.controls}>
        {/* <Button
          title={`Switch Camera (${facing === facing ? "Back" : "Front"})`}
          onPress={() =>
            setFacing(
              facing === CameraType.back ? CameraType.front : CameraType.back
            )
          }
        /> */}
        {scanned && !loading && (
          <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
        )}
        {loading && <ActivityIndicator size="small" color="#000" />}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  scanner: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
});
