import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Dimensions,
  Modal,
  Alert,
  PanResponder,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  PaintStyle,
  useCanvasRef,
  SkPath,
  StrokeCap,
  StrokeJoin,
} from '@shopify/react-native-skia';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { TensorflowModel, loadTensorflowModel } from 'react-native-fast-tflite';
import { preprocessPathToImage } from './PreprocessPathToImage';

interface Props {
  visible: boolean;
  onPredict: (digit: string) => void;
}

const DrawingMdoal = ({ visible, onPredict }: Props) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
  const canvasRef = useCanvasRef();
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [loading, setLoading] = useState(false);
  const currentPathRef = useRef<SkPath | null>(null);
  
  const touchTimeout = useRef<NodeJS.Timeout | null>(null);

  const pathsRef = useRef<SkPath[]>([]);
  const tfliteModelRef = useRef<TensorflowModel | null>(null);
  const modelLoadedRef = useRef(false);

  // 영역 밖 감지
  const lastXY = useRef<{ x: number, y: number } | null>(null);
  const MAX_JUMP = 600; // px 기준: 이 이상 튀면 비정상으로 간주

  // TFLite 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      try {
        const model = await loadTensorflowModel(require('../../assets/my_emnist_model2.tflite'));
        tfliteModelRef.current = model;
        modelLoadedRef.current = true;
        console.log('TFLite 모델 로드 성공');
      } catch (error) {
        console.error('TFLite 모델 로드 실패:', error);
      }
    };
    loadModel();
  }, []);

  // 캔버스 설정
  const paint = Skia.Paint();
  paint.setColor(Skia.Color('black'));
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(20);
  paint.setAntiAlias(true);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);

  // 그리기 (터치 시작, 활성화, 종료)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {

        // 터치 시작 시 타이머 제거 (새로운 터치로 간주)
        if (touchTimeout.current) {
          clearTimeout(touchTimeout.current);
          touchTimeout.current = null;
        }
        
        // path가 없다면 여기서 시작
        const { locationX, locationY } = evt.nativeEvent;

        if (locationY > SCREEN_HEIGHT - 85) {
          console.log('터치 위치가 그리기 영역 밖입니다');
          return;
        }

        const path = Skia.Path.Make();
        path.moveTo(locationX, locationY);
        currentPathRef.current = path;
        setPaths(prev => [...prev, path]);
      
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;

        if (!currentPathRef.current) return;
        
        if (lastXY.current) {
          const dy = Math.abs(locationY - lastXY.current.y);
          const dx = Math.abs(locationX - lastXY.current.x);
          if (dy > MAX_JUMP || dx > MAX_JUMP) {
            console.log('⛔️ 좌표 점프 감지됨, 무시:', { dx, dy });
            return;
          }
        }       

        currentPathRef.current.lineTo(locationX, locationY);
        lastXY.current = { x: locationX, y: locationY };
        
        setPaths(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = currentPathRef.current!;
          return updated;
        });
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current) {
          const finalizedPath = currentPathRef.current.copy();
          setPaths(prev => {
            const updated =[...prev.  slice(0, -1), finalizedPath];
            pathsRef.current = updated;
            return updated;
          });
          
        }
        currentPathRef.current = null;

        // 터치 종료 후 1초 후 자동 처리
        startPostTouchTimer();
      },
    })
  ).current;

  const startPostTouchTimer = () => {
    if (touchTimeout.current) {
      clearTimeout(touchTimeout.current);
      touchTimeout.current = null;
    }
    touchTimeout.current = setTimeout(() => {
      saveAndProcess();
      clearTimeout(touchTimeout.current!);
      touchTimeout.current = null;
    }, 1000);
  };

  // 초기화
  const onClear = () => {
    setPaths([]);
  };

  // 저장 및 이미지 전처리
  const saveAndProcess = async () => {
    setLoading(true);
    try {
      const image = canvasRef.current?.makeImageSnapshot();
      if (!image) throw new Error('이미지 캡처 실패');

      const base64 = image.encodeToBase64();
      const rawPath = `${RNFS.CachesDirectoryPath}/digit_raw.png`;
      await RNFS.writeFile(rawPath, base64, 'base64');
      await CameraRoll.saveAsset(rawPath, { type: 'photo', album: 'Digits' });

      const imageTensor = await preprocessPathToImage(pathsRef.current);
      // console.log(Array.from(imageTensor).slice(350, 450).join(', '));
      if (!imageTensor) {
        Alert.alert("입력 오류", "숫자가 입력되지 않았습니다.");
        return;
      }
      const predictedNumber = predictNumber(imageTensor);
    } catch (err) {
      console.error(err);
      Alert.alert('에러 발생', (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  // 결과 예측
  const predictNumber = async (inputData: Float32Array) => {
    try {
      if (!tfliteModelRef.current) {
        throw new Error('모델이 없습니다');
      }

      let result;
      if (typeof tfliteModelRef.current.run === 'function') {
      result = await tfliteModelRef.current.run([inputData]);
      if (Array.isArray(result) && result.length > 0) {
        
        const prediction = Object.entries(result[0])
          .reduce((maxEntry, current) => (current[1] > maxEntry[1] ? current : maxEntry))[0]; // key 반환
        console.log('예측된 숫자:', prediction);
        console.log('예측된 결과:', result);

        onPredict(prediction);  // 예측값 전달
        onClear();  // Path 초기화
      } else {
        throw new Error('모델 실행 결과가 예상 형식과 다릅니다');
      }
    } else if (typeof tfliteModelRef.current.runSync === 'function') {
      result = tfliteModelRef.current.runSync([inputData]);
    }
    } catch (modelError) {
      console.error('[TimerBasedDigitInput] 모델 실행 오류:', modelError);
      return;
    } 
  };
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT - 85,
          backgroundColor: 'transparent',
        }}
      >
        <Canvas
          ref={canvasRef}
          style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 85 }}
        >
          {paths.map((p, idx) => (
            <Path
              key={idx}
              path={p}
              paint={paint}
              style="stroke"
              strokeWidth={4}
              strokeJoin="round"
              strokeCap="round"
            />
          ))}
        </Canvas>

        {loading && (
          <ActivityIndicator
            style={{ position: 'absolute', top: '50%', left: '50%' }}
            size="large"
          />
        )}
      </View>

      <View
          style={{
            position: 'absolute',
            bottom: 0,
            alignSelf: 'center',
            flexDirection: 'row',
            gap: 16,
          }}
        >
        </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
});


export default DrawingMdoal;
