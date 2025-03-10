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
    const staff = STAFF_LIST.find((s) => s.id === data);

    if (staff) {
      try {
        const existingData = await AsyncStorage.getItem("attendance");
        const attendance = existingData ? JSON.parse(existingData) : {};
        attendance[data] = true;
        await AsyncStorage.setItem("attendance", JSON.stringify(attendance));
        setLoading(false);
        router.push("/attendance");
      } catch (error) {
        console.error("Error saving attendance:", error);
        Alert.alert("Error", "Failed to save attendance. Please try again.");
        setLoading(false);
      }
    } else {
      Alert.alert("Invalid", "Invalid staff ID");
      setLoading(false);
      // Auto reset scanning state after a short delay
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
