// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  CameraType,
  BarcodeScanningResult,
  useCameraPermissions,
  CameraView,
} from "expo-camera";
import { router } from "expo-router";
import {
  StyleSheet,
  Button,
  Alert,
  View,
  ActivityIndicator,
  Vibration,
  Dimensions,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { STAFF_LIST } from "@/constants/Staff";

const API_URL = "https://your-server-address.com/api"; // Change API_URL to your actual server address

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [loading, setLoading] = useState(false);
  const [isDetected, setIsDetected] = useState(false);
  const [camera, setCamera] = useState<Camera | null>(null);
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // Request permission on mount if not determined
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status === "granted") {
        setPermission(true);
      } else {
        setPermission(false);
        Alert.alert("Camera permission required");
      }
    })();
  }, []);

  // Optimized animation
  useEffect(() => {
    let isSubscribed = true;
    const animate = () => {
      if (!isSubscribed) return;
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: scanAreaSize,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    animate();
    return () => {
      isSubscribed = false;
    };
  }, []);

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

  const validateQRData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      return parsed && parsed.id && typeof parsed.id === "string";
    } catch {
      return false;
    }
  };

  const handleBarCodeScanned = async ({
    data,
    bounds,
  }: BarcodeScanningResult) => {
    if (scanned || loading) return; // Prevent multiple scans

    try {
      if (!validateQRData(data)) {
        Vibration.vibrate(100);
        Alert.alert("Invalid QR Code", "Please scan a valid staff QR code.");
        return;
      }

      setIsDetected(true);
      setScanned(true);
      setLoading(true);
      Vibration.vibrate([100, 100, 100]);

      const staffData = JSON.parse(data);
      const response = await fetch(`${API_URL}/attendance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: staffData.id,
          status: "Present",
          checkIn: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to mark attendance");

      // Handle offline storage
      await handleOfflineStorage(staffData.id);

      Alert.alert("Success", "Attendance marked successfully", [
        { text: "OK", onPress: () => router.push("/attendance") },
      ]);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to mark attendance. Please try again.");
    } finally {
      setLoading(false);
      setIsDetected(false);
      setTimeout(() => setScanned(false), 1500);
    }
  };

  const handleOfflineStorage = async (staffId: string) => {
    try {
      const existingData = await AsyncStorage.getItem("attendance");
      const attendance = existingData ? JSON.parse(existingData) : {};
      attendance[staffId] = {
        timestamp: new Date().toISOString(),
        synced: true,
      };
      await AsyncStorage.setItem("attendance", JSON.stringify(attendance));
    } catch (error) {
      console.error("Offline storage error:", error);
    }
  };

  const onCameraReady = () => {
    console.log("Camera is ready");
  };

  return (
    <ThemedView style={styles.container}>
      <CameraView
        ref={setCamera}
        style={styles.scanner}
        facing={facing}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        onMountError={(error) => console.error("Camera mount error", error)}
        onCameraReady={onCameraReady}
        barCodeScannerSettings={{
          barCodeTypes: ["qr"],
          interval: 300,
        }}
      >
        <View style={styles.overlay}>
          <View
            style={[styles.scanArea, isDetected && styles.scanAreaDetected]}
          >
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineAnim }] },
              ]}
            />
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <ThemedText
            style={[
              styles.instructions,
              { color: isDetected ? "#4CAF50" : "#fff" },
            ]}
          >
            {isDetected ? "QR Code Detected!" : "Position QR code within frame"}
          </ThemedText>
        </View>
      </CameraView>
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

const { width } = Dimensions.get("window");
const scanAreaSize = width * 0.7;
const cornerSize = 20;

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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  scanAreaDetected: {
    borderColor: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  scanLine: {
    height: 2,
    width: "100%",
    backgroundColor: "#4CAF50",
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: cornerSize,
    height: cornerSize,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#4CAF50",
  },
  cornerTR: {
    position: "absolute",
    top: 0,
    right: 0,
    width: cornerSize,
    height: cornerSize,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#4CAF50",
  },
  cornerBL: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: cornerSize,
    height: cornerSize,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#4CAF50",
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: cornerSize,
    height: cornerSize,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#4CAF50",
  },
  instructions: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
});
