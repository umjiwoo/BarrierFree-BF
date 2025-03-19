import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  PanResponder,
  Dimensions,
  Animated
} from 'react-native';
import {
  Canvas,
  Path,
  Group,
  useCanvasRef,
  SkPath,
  Skia,
} from '@shopify/react-native-skia';

// 점 사이의 거리 계산 함수
const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const DoubleTapDigitInput = ({
  visible, 
  onClose, 
  onDigitRecognized,
  currentDigitIndex,
  maxDigits
}: {
  visible: boolean; 
  onClose: () => void;
  onDigitRecognized: (digit: string) => void;
  currentDigitIndex: number;
  maxDigits: number;
}) => {
  // 상태 관리
  const [paths, setPaths] = useState<Array<{path: SkPath; width: number}>>([]);
  const [points, setPoints] = useState<Array<[number, number]>>([]);
  const [strokeWidth, setStrokeWidth] = useState<number>(8);
  
  // 애니메이션 상태
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // 컴포넌트가 마운트/언마운트될 때 페이드 애니메이션 처리
  useEffect(() => {
    if (visible) {
      // 초기화
      setPaths([]);
      setPoints([]);
      currentPathRef.current = null;
      
      // 페이드 인
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // 페이드 아웃
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);
  
  // Refs
  const canvasRef = useCanvasRef();
  const currentPathRef = useRef<SkPath | null>(null);
  const doubleTapRef = useRef<{lastTap: number}>({lastTap: 0});
  const lastPointTime = useRef<number>(0);
  
  // 랜덤 숫자 인식 함수
  const recognizeDigit = useCallback(() => {
    // 랜덤 숫자 생성 (0-9)
    const randomDigit = Math.floor(Math.random() * 10).toString();
    
    // 부모 컴포넌트에 인식된 숫자 전달
    onDigitRecognized(randomDigit);
    
    // 캔버스 초기화
    setPaths([]);
    setPoints([]);
    currentPathRef.current = null;
    
    // 현재가 마지막 글자라면 자동으로 닫기
    if (currentDigitIndex >= maxDigits - 1) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [onDigitRecognized, onClose, currentDigitIndex, maxDigits]);
  
  // 더블탭 감지 함수
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - doubleTapRef.current.lastTap < DOUBLE_TAP_DELAY) {
      // 먼저 숫자 인식
      const randomDigit = Math.floor(Math.random() * 10).toString();
      onDigitRecognized(randomDigit);
      
      // 현재가 마지막 글자라면 자동으로 닫기
      if (currentDigitIndex >= maxDigits - 1) {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
      
      // 그 다음 그림판 초기화
      setPaths([]);
      setPoints([]);
      currentPathRef.current = null;
      return true;
    }
    
    doubleTapRef.current.lastTap = now;
    return false;
  };
  
  // 패스 생성 함수
  const getSmoothPath = useCallback((pointsArray: Array<[number, number]>): SkPath | null => {
    if (pointsArray.length < 2) return null;
    
    const path = Skia.Path.Make();
    
    // 최소 두 개의 점이 있어야 경로를 만들 수 있음
    if (pointsArray.length === 2) {
      const [x1, y1] = pointsArray[0];
      const [x2, y2] = pointsArray[1];
      path.moveTo(x1, y1);
      path.lineTo(x2, y2);
      return path;
    }
    
    // 첫 점을 시작점으로 설정
    path.moveTo(pointsArray[0][0], pointsArray[0][1]);
    
    // 시작점에서 두 번째 점까지는 직선으로 처리
    path.lineTo(pointsArray[1][0], pointsArray[1][1]);
    
    // 세 번째 점부터는 곡선으로 처리
    if (pointsArray.length > 2) {
      for (let i = 1; i < pointsArray.length - 1; i++) {
        // 이전, 현재, 다음 점
        const prev = pointsArray[i-1];
        const curr = pointsArray[i];
        const next = pointsArray[i+1];
        
        // 텐션 값 (낮을수록 부드러움)
        const tension = 0.1;
        
        // 방향 벡터 계산
        const dx1 = curr[0] - prev[0];
        const dy1 = curr[1] - prev[1];
        const dx2 = next[0] - curr[0];
        const dy2 = next[1] - curr[1];
        
        // 제어점 계산 
        const cp1x = curr[0] - dx1 * tension;
        const cp1y = curr[1] - dy1 * tension;
        const cp2x = curr[0] + dx2 * tension;
        const cp2y = curr[1] + dy2 * tension;
        
        // 베지어 곡선 추가
        if (i === 1) {
          path.cubicTo(cp1x, cp1y, cp2x, cp2y, next[0], next[1]);
        } else {
          path.cubicTo(cp1x, cp1y, cp2x, cp2y, next[0], next[1]);
        }
      }
    }
    
    return path;
  }, []);
  
  // 경로 추가 함수
  const addPointToPath = useCallback((x: number, y: number) => {
    setPoints(prev => {
      const newPoints = [...prev, [x, y] as [number, number]];
      currentPathRef.current = getSmoothPath(newPoints);
      return newPoints;
    });
  }, [getSmoothPath]);
  
  // 팬 리스폰더 설정
  const panResponder = React.useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // 더블탭 확인
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (now - doubleTapRef.current.lastTap < DOUBLE_TAP_DELAY) {
          // 먼저 숫자 인식 실행
          const randomDigit = Math.floor(Math.random() * 10).toString();
          onDigitRecognized(randomDigit);
          
          // 현재가 마지막 글자라면 자동으로 닫기
          if (currentDigitIndex >= maxDigits - 1) {
            setTimeout(() => {
              onClose();
            }, 1500);
          }
          
          // 그 다음 그림판 초기화
          setPaths([]);
          setPoints([]);
          currentPathRef.current = null;
          return false; // PanResponder가 이벤트를 처리하지 않도록 함
        }
        
        doubleTapRef.current.lastTap = now;
        return true; // 일반 탭은 처리
      },
      
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      
      onPanResponderGrant: (evt) => {
        // 첫 번째 터치 지점 사용
        const touch = evt.nativeEvent.touches ? evt.nativeEvent.touches[0] : evt.nativeEvent;
        const {locationX, locationY} = touch;
        
        if (isNaN(locationX) || isNaN(locationY)) return;
        
        setPoints([[locationX, locationY]]);
        currentPathRef.current = null;
        lastPointTime.current = Date.now();
      },
      
      onPanResponderMove: (evt) => {
        const touch = evt.nativeEvent.touches ? evt.nativeEvent.touches[0] : evt.nativeEvent;
        const {locationX, locationY} = touch;
        
        if (isNaN(locationX) || isNaN(locationY)) return;
        
        // 이전 점과 현재 점의 거리 체크
        if (points.length > 0) {
          const lastPoint = points[points.length - 1];
          const dist = distance(lastPoint[0], lastPoint[1], locationX, locationY);
          const now = Date.now();
          const timeDiff = now - lastPointTime.current;
          
          // 거리 임계값과 시간 기반 조건
          if (dist > 0.5 || timeDiff > 16) {
            addPointToPath(locationX, locationY);
            lastPointTime.current = now;
          }
        }
      },
      
      onPanResponderRelease: () => {
        // 현재 그린 경로가 충분히 길지 않다면 무시
        if (points.length < 2) {
          setPoints([]);
          currentPathRef.current = null;
          return;
        }
        
        const pathObject = currentPathRef.current || getSmoothPath(points);
        
        if (pathObject) {
          setPaths(prev => [...prev, {
            path: pathObject,
            width: strokeWidth
          }]);
        }
        
        setPoints([]);
        currentPathRef.current = null;
      },
    }),
  [getSmoothPath, points, strokeWidth, recognizeDigit, addPointToPath, paths.length]);
  
  // 컴포넌트가 표시되지 않으면 렌더링하지 않음
  if (!visible) return null;
  
  return (
    <Animated.View 
      style={[
        styles.overlay,
        {opacity: fadeAnim}
      ]}
    >
      {/* 캔버스 영역에만 PanResponder 적용 */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Canvas style={styles.canvas} ref={canvasRef}>
          <Group>
            {paths.map((item, index) => (
              <Path
                key={index}
                path={item.path}
                color="#000000"
                style="stroke"
                strokeWidth={item.width}
                strokeCap="round"
                strokeJoin="round"
              />
            ))}
            {currentPathRef.current && (
              <Path
                path={currentPathRef.current}
                color="#000000"
                style="stroke"
                strokeWidth={strokeWidth}
                strokeCap="round"
                strokeJoin="round"
              />
            )}
          </Group>
        </Canvas>
      </View>
      
      {/* 현재 입력 중인 숫자 표시 */}
      <View style={styles.digitIndexContainer} pointerEvents="none">
        <Text style={styles.digitIndexText}>
          {currentDigitIndex + 1}/{maxDigits} 번째 숫자 입력 중
        </Text>
      </View>
      
      {/* 취소 버튼 */}
      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={onClose}
      >
        <Text style={styles.cancelButtonText}>취소</Text>
      </TouchableOpacity>
      
      {/* 안내 텍스트 */}
      <View style={styles.instructionContainer} pointerEvents="none">
        <Text style={styles.instructionText}>
          • 화면에 그림을 그려보세요
        </Text>
        <Text style={styles.instructionText}>
          • 더블탭하면 숫자를 인식하고 그림판이 초기화됩니다
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1000,
  },
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1,
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  digitIndexContainer: {
    position: 'absolute',
    top: 50,
    padding: 12,
    backgroundColor: 'rgba(77, 171, 247, 0.7)',
    borderRadius: 8,
    alignSelf: 'center',
    zIndex: 2,
  },
  digitIndexText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 3,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 150,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    alignSelf: 'center',
    left: 20,
    right: 20,
    zIndex: 2,
  },
  instructionText: {
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default DoubleTapDigitInput;