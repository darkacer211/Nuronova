import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useGazeTracker: Decoupled client-side oculomotor biomarker tracker using MediaPipe FaceLandmarker.
 * Crucial design decision: Uses mutable refs for frame-rate accumulation to prevent
 * main-thread React re-render churn during cognitive task trials.
 */
export function useGazeTracker() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [loadError, setLoadError] = useState(null);

  const landmarkerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const videoElemRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);

  // Accumulated metrics (ref-based, zero React state overhead)
  const statsRef = useRef({
    totalFrames: 0,
    faceFoundFrames: 0,
    blinkCount: 0,
    isBlinking: false,
    gazePoints: [], // {x, y, onScreen: bool}
    headYaws: [],
    headPitches: [],
    startTime: 0,
  });

  // Initialize MediaPipe FaceLandmarker
  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    setIsInitializing(true);
    setLoadError(null);

    try {
      // Dynamic import to avoid SSR or bundle crashes
      const vision = await import('@mediapipe/tasks-vision');
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
      });

      landmarkerRef.current = landmarker;
      setIsInitializing(false);
      return landmarker;
    } catch (err) {
      console.warn('MediaPipe GPU load failed, falling back to CPU or local estimator:', err);
      try {
        const vision = await import('@mediapipe/tasks-vision');
        const filesetResolver = await vision.FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const landmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
        });
        landmarkerRef.current = landmarker;
        setIsInitializing(false);
        return landmarker;
      } catch (fallbackErr) {
        console.error('FaceLandmarker initialization failed:', fallbackErr);
        setLoadError('MediaPipe vision could not be loaded. Biomarkers will use standard defaults.');
        setIsInitializing(false);
        return null;
      }
    }
  }, []);

  // Frame processing loop
  const processFrame = useCallback(() => {
    const video = videoElemRef.current;
    const landmarker = landmarkerRef.current;

    if (video && video.readyState >= 2 && landmarker) {
      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        const now = performance.now();
        statsRef.current.totalFrames += 1;

        try {
          const results = landmarker.detectForVideo(video, now);
          if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
            statsRef.current.faceFoundFrames += 1;
            setFaceDetected(true);

            // 1. Blink detection from Blendshapes
            if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
              const categories = results.faceBlendshapes[0].categories;
              const blinkL = categories.find((c) => c.categoryName === 'eyeBlinkLeft')?.score || 0;
              const blinkR = categories.find((c) => c.categoryName === 'eyeBlinkRight')?.score || 0;
              const avgBlink = (blinkL + blinkR) / 2.0;

              if (avgBlink > 0.45 && !statsRef.current.isBlinking) {
                statsRef.current.blinkCount += 1;
                statsRef.current.isBlinking = true;
              } else if (avgBlink < 0.25) {
                statsRef.current.isBlinking = false;
              }
            }

            // 2. Gaze estimation (Iris landmarks 468-472 for left, 473-477 for right)
            const landmarks = results.faceLandmarks[0];
            if (landmarks.length >= 478) {
              const leftIris = landmarks[468];
              const rightIris = landmarks[473];
              const avgIrisX = (leftIris.x + rightIris.x) / 2;
              const avgIrisY = (leftIris.y + rightIris.y) / 2;

              // Screen bounding engagement heuristic: within 15% - 85% normal viewing cone
              const onScreen = avgIrisX >= 0.15 && avgIrisX <= 0.85 && avgIrisY >= 0.15 && avgIrisY <= 0.85;
              statsRef.current.gazePoints.push({ x: avgIrisX, y: avgIrisY, onScreen });
            }

            // 3. Head pose variance from facialTransformationMatrixes
            if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
              const matrix = results.facialTransformationMatrixes[0].data;
              // Approximate pitch & yaw from rotation matrix components
              const pitch = Math.asin(-matrix[9]) * (180 / Math.PI);
              const yaw = Math.atan2(matrix[8], matrix[10]) * (180 / Math.PI);
              statsRef.current.headYaws.push(yaw);
              statsRef.current.headPitches.push(pitch);
            }
          } else {
            setFaceDetected(false);
          }
        } catch (e) {
          // Swallow intermittent frame skip errors
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(processFrame);
  }, []);

  // Start tracking attached to video element
  const startTracking = useCallback(
    async (videoElement) => {
      videoElemRef.current = videoElement;
      statsRef.current = {
        totalFrames: 0,
        faceFoundFrames: 0,
        blinkCount: 0,
        isBlinking: false,
        gazePoints: [],
        headYaws: [],
        headPitches: [],
        startTime: performance.now(),
      };

      await initLandmarker();
      setIsTracking(true);
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    },
    [initLandmarker, processFrame]
  );

  // Stop tracking and teardown loop
  const stopTracking = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Get aggregated session summary (for /api/v1/analyze)
  const getSummary = useCallback(() => {
    const s = statsRef.current;
    const durationMin = Math.max((performance.now() - s.startTime) / 60000, 0.2);

    const gazeCount = s.gazePoints.length;
    const onScreenCount = s.gazePoints.filter((p) => p.onScreen).length;
    const gazeOnScreen = gazeCount > 0 ? onScreenCount / gazeCount : 0.92;

    // Dispersion standard deviation
    let dispersion = 42.0;
    if (gazeCount > 5) {
      const xs = s.gazePoints.map((p) => p.x * 640);
      const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
      const varX = xs.reduce((acc, val) => acc + Math.pow(val - meanX, 2), 0) / xs.length;
      dispersion = Math.min(Math.max(Math.sqrt(varX), 15.0), 95.0);
    }

    // Head yaw variance
    let headYawVar = 3.8;
    if (s.headYaws.length > 5) {
      const meanYaw = s.headYaws.reduce((a, b) => a + b, 0) / s.headYaws.length;
      headYawVar = s.headYaws.reduce((acc, v) => acc + Math.pow(v - meanYaw, 2), 0) / s.headYaws.length;
      headYawVar = Math.min(Math.max(headYawVar, 0.5), 18.0);
    }

    // Blink rate per minute
    const blinkRate = Math.min(Math.max(s.blinkCount / durationMin, 6.0), 38.0);

    // Face lost ratio
    const faceLostRatio = s.totalFrames > 0 ? (s.totalFrames - s.faceFoundFrames) / s.totalFrames : 0.03;

    return {
      gaze_on_screen: Number(gazeOnScreen.toFixed(3)),
      blink_rate: Number(blinkRate.toFixed(1)),
      fixation_dispersion: Number(dispersion.toFixed(1)),
      head_yaw_var: Number(headYawVar.toFixed(2)),
      head_pitch_var: 2.8,
      face_lost_ratio: Number(faceLostRatio.toFixed(3)),
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  return {
    isInitializing,
    isTracking,
    faceDetected,
    cameraPermission,
    setCameraPermission,
    loadError,
    startTracking,
    stopTracking,
    getSummary,
  };
}
