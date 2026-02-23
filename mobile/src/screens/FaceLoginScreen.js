import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const FaceLoginScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { faceLogin, registerFace } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [faceData, setFaceData] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const cameraRef = useRef(null);
  const mode = route.params?.mode || 'login';

  useEffect(() => {
    // Check if running on web - face recognition not supported
    if (Platform.OS === 'web') {
      Alert.alert(
        'Face Recognition Not Available on Web',
        'Face recognition requires a physical device with a camera. Please use the Expo Go app on your phone or an emulator.\n\n' +
        'Would you like to learn how to set up Expo Go?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Learn More',
            onPress: () => Linking.openURL('https://docs.expo.dev/get-started/expo-go/'),
          },
        ]
      );
      navigation.goBack();
      return;
    }

    // Request camera permission
    (async () => {
      try {
        const { granted } = await requestPermission();
        if (granted) {
          // Permission granted
        } else {
          Alert.alert(
            'Camera Permission Denied',
            'Camera access is required for face recognition. Please grant permission in your device settings.',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } catch (error) {
        console.error('Camera permission error:', error);
        Alert.alert(
          'Camera Error',
          'Unable to access camera. Please make sure you are running this on a physical device or emulator, not in a web browser.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    })();
  }, []);

  const handleFacesDetected = ({ faces }) => {
    if (faces.length > 0 && !isDetecting) {
      setFaceData(faces[0]);
    }
  };

  const handleCapture = async () => {
    if (!faceData) {
      Alert.alert('No Face Detected', 'Please position your face in the frame');
      return;
    }

    setIsDetecting(true);

    // Generate a simple face descriptor from face bounds
    // In a real app, you'd use a more sophisticated face recognition library
    const faceDescriptor = [
      faceData.bounds.origin.x,
      faceData.bounds.origin.y,
      faceData.bounds.size.width,
      faceData.bounds.size.height,
      ...(faceData.rollAngle ? [faceData.rollAngle] : []),
      ...(faceData.yawAngle ? [faceData.yawAngle] : []),
    ];

    // Pad to 128 values for consistency with backend
    const paddedDescriptor = Array(128).fill(0).map((_, i) => 
      faceDescriptor[i] || Math.random() * 0.5
    );

    if (mode === 'register') {
      const result = await registerFace(paddedDescriptor);
      if (result.success) {
        Alert.alert('Success', 'Face registered successfully!', [
          { text: 'OK', onPress: () => navigation.replace('Main') }
        ]);
      } else {
        Alert.alert('Error', result.error);
      }
    } else {
      const result = await faceLogin(paddedDescriptor);
      if (result.success) {
        // Navigation will happen automatically via auth state change
      } else {
        Alert.alert('Face Not Recognized', result.error);
      }
    }

    setIsDetecting(false);
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          onFacesDetected={handleFacesDetected}
        >
          {/* Face Guide Overlay */}
          <View style={styles.overlay}>
            <View style={[styles.faceGuide, faceData ? styles.faceDetected : null]} />
            {faceData && (
              <View style={styles.detectedBadge}>
                <Text style={styles.detectedText}>Face Detected</Text>
              </View>
            )}
          </View>
        </CameraView>
      </View>

      <View style={styles.controls}>
        <Text style={[styles.instruction, { color: colors.text }]}>
          Position your face within the oval
        </Text>
        <Text style={[styles.subInstruction, { color: colors.textSecondary }]}>
          Ensure good lighting and remove glasses if possible
        </Text>

        <TouchableOpacity
          style={[
            styles.captureButton,
            { backgroundColor: faceData ? colors.primary : colors.border },
          ]}
          onPress={handleCapture}
          disabled={!faceData || isDetecting}
        >
          <Icon name="camera" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: width * 0.6,
    height: width * 0.75,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: width * 0.3,
    borderStyle: 'dashed',
  },
  faceDetected: {
    borderColor: '#22c55e',
    borderStyle: 'solid',
  },
  detectedBadge: {
    position: 'absolute',
    top: '20%',
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  controls: {
    padding: 24,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  subInstruction: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    fontSize: 16,
  },
});

export default FaceLoginScreen;
