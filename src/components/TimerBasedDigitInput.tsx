// import React, {useState, useRef, useCallback, useEffect} from 'react';
// import {
//   View, 
//   Text, 
//   StyleSheet, 
//   TouchableOpacity, 
//   PanResponder,
//   Animated,
//   Modal,
//   ActivityIndicator
// } from 'react-native';
// import {
//   Canvas,
//   Path,
//   Skia,
//   SkPath,
//   useCanvasRef,
// } from '@shopify/react-native-skia';
// import Icon from '@react-native-vector-icons/ionicons';
// import { TensorflowModel } from 'react-native-fast-tflite';

// // Softmax 함수 정의
// const applySoftmax = (logits: Float32Array): Float32Array => {
//   const maxLogit = Math.max(...logits);
//   const exps = logits.map((x) => Math.exp(x - maxLogit));
//   const sum = exps.reduce((a, b) => a + b, 0);
//   return new Float32Array(exps.map((v) => v / sum));
// };

// // 점 사이의 거리 계산 함수
// const distance = (x1: number, y1: number, x2: number, y2: number): number => {
//   return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
// };

// interface Props {
//   visible: boolean;
//   onClose: () => void;
//   onDigitRecognized: (digit: string) => void;
//   currentDigitIndex: number;
//   maxDigits: number;
//   externalModel: TensorflowModel | null;
//   externalModelLoaded: boolean;
// }

// const TimerBasedDigitInput: React.FC<Props> = ({
//   visible,
//   onClose,
//   onDigitRecognized,
//   currentDigitIndex,
//   maxDigits,
//   externalModel,
//   externalModelLoaded,
// }) => {
//   // 상태 관리
//   const [paths, setPaths] = useState<SkPath[]>([]);
//   const [points, setPoints] = useState<Array<{x: number; y: number}>>([]);
//   const strokeWidth = 4;
//   const [timerProgress, setTimerProgress] = useState<number>(0);
//   const [isRecognizing, setIsRecognizing] = useState(false);
  
//   // 애니메이션 상태
//   const fadeAnim = useRef(new Animated.Value(0)).current;
  
//   // Refs
//   const canvasRef = useCanvasRef();
//   const currentPathRef = useRef<SkPath | null>(null);
//   const recognitionTimer = useRef<NodeJS.Timeout | null>(null);
//   const animationFrameId = useRef<number | null>(null);
//   const startTimeRef = useRef<number>(0);
//   const lastPointTime = useRef<number>(0);
  
//   // 컴포넌트 내부 변수로 드로잉 포인트 관리
//   const pointsArray = useRef<Array<{x: number; y: number}>>([]);
  
//   // 포인트를 이미지로 전처리하는 함수
//   const preprocessCurrentPoints = useCallback(async (): Promise<ArrayBuffer | null> => {
//     try {
//       const inputWidth = 28;
//       const inputHeight = 28;
//       const inputSize = inputWidth * inputHeight;
      
//       // 정확히 Float32Array로 생성
//       const imageData = new Float32Array(inputSize);
      
//       // 입력된 포인트의 최소/최대 좌표 계산
//       const xCoords = pointsArray.current.map(p => p.x);
//       const yCoords = pointsArray.current.map(p => p.y);
//       const minX = Math.min(...xCoords);
//       const maxX = Math.max(...xCoords);
//       const minY = Math.min(...yCoords);
//       const maxY = Math.max(...yCoords);
      
//       // 스케일링 계수 계산
//       const scaleX = (inputWidth - 4) / (maxX - minX);
//       const scaleY = (inputHeight - 4) / (maxY - minY);
//       const scale = Math.min(scaleX, scaleY);
      
//       // 중앙 정렬을 위한 오프셋
//       const offsetX = Math.floor((inputWidth - (maxX - minX) * scale) / 2);
//       const offsetY = Math.floor((inputHeight - (maxY - minY) * scale) / 2);
      
//       // 포인트를 28x28 이미지로 변환
//       pointsArray.current.forEach(point => {
//         const x = Math.floor((point.x - minX) * scale) + offsetX;
//         const y = Math.floor((point.y - minY) * scale) + offsetY;
        
//         // 유효한 범위 체크
//         if (x >= 0 && x < inputWidth && y >= 0 && y < inputHeight) {
//           // 선 두께 구현을 위해 주변 픽셀에도 값 부여
//           for (let dy = -1; dy <= 1; dy++) {
//             for (let dx = -1; dx <= 1; dx++) {
//               const nx = x + dx;
//               const ny = y + dy;
              
//               if (nx >= 0 && nx < inputWidth && ny >= 0 && ny < inputHeight) {
//                 const dist = Math.sqrt(dx*dx + dy*dy);
//                 const intensity = Math.max(0, 1.0 - dist * 0.5);
                
//                 // 기존 값과 비교해 최대값 유지
//                 const index = ny * inputWidth + nx;
//                 imageData[index] = Math.max(imageData[index] || 0, intensity);
//               }
//             }
//           }
//         }
//       });
      
//       // 대비 향상 및 정규화
//       const maxVal = Math.max(...imageData);
//       if (maxVal > 0) {
//         for (let i = 0; i < imageData.length; i++) {
//           imageData[i] = imageData[i] / maxVal;
//         }
//       }
      
//       // ArrayBuffer로 변환
//       return imageData.buffer;
//     } catch (error) {
//       console.error('이미지 전처리 실패:', error);
//       return null;
//     }
//   }, []);
  
//   // 기본 숫자 반환 함수 (모델이 없거나 오류 발생 시)
//   const fallbackRecognition = useCallback(() => {
//     const fixedDigits = '110123456789';
//     const nextDigit = currentDigitIndex < fixedDigits.length 
//       ? fixedDigits[currentDigitIndex] 
//       : '0';
    
//     onDigitRecognized(nextDigit);
//     console.log('더미 인식 모드에서 반환된 숫자:', nextDigit);
//   }, [currentDigitIndex, onDigitRecognized]);
  
//   // 타이머 애니메이션
//   const startTimerAnimation = () => {
//     setTimerProgress(0);
//     startTimeRef.current = Date.now();
    
//     const animate = () => {
//       const elapsed = Date.now() - startTimeRef.current;
//       const progress = Math.min(elapsed / 1500, 1);
//       setTimerProgress(progress);
      
//       if (progress < 1) {
//         animationFrameId.current = requestAnimationFrame(animate);
//       }
//     };
    
//     animationFrameId.current = requestAnimationFrame(animate);
//   };
  
//   // 타이머 기반 숫자 인식 함수
//   const recognizeDigit = useCallback(async () => {
//     if (animationFrameId.current) {
//       cancelAnimationFrame(animationFrameId.current);
//       animationFrameId.current = null;
//     }
    
//     setIsRecognizing(true);
//     console.log('[TimerBasedDigitInput] 숫자 인식 시작, 포인트 개수:', points.length);
    
//     try {
//       // 모델 상태 확인
//       if (!externalModel || !externalModelLoaded) {
//         console.log('[TimerBasedDigitInput] 모델 없음, 폴백 모드 실행');
//         fallbackRecognition();
//         return;
//       }
      
//       // 포인트를 이미지로 변환
//       const inputData = await preprocessCurrentPoints();
//       if (!inputData) {
//         console.log('[TimerBasedDigitInput] 이미지 처리 실패');
//         fallbackRecognition();
//         return;
//       }
      
//       // 입력 데이터를 올바른 형식으로 변환
//       const inputBuffer = new Float32Array(inputData);
      
//       // 입력 데이터 로깅
//       console.log('[TimerBasedDigitInput] 모델 입력 데이터:', {
//         dataLength: inputBuffer.length,
//         sampleValues: Array.from(inputBuffer.slice(0, 5))
//       });

//       // TFLite 모델 실행
//       let outputs: Float32Array;
      
//       try {
//         if (!externalModel) {
//           throw new Error('모델이 없습니다');
//         }
        
//         // 모델 정보 로깅
//         console.log('[TimerBasedDigitInput] 모델 정보:', {
//           delegate: externalModel.delegate,
//           inputs: externalModel.inputs?.map(i => ({ 
//             name: i.name, 
//             shape: i.shape,
//             dataType: i.dataType 
//           })),
//           outputs: externalModel.outputs?.map(o => ({ 
//             name: o.name, 
//             shape: o.shape,
//             dataType: o.dataType 
//           }))
//         });
        
//         let result;
//         if (typeof externalModel.run === 'function') {
//           console.log('[TimerBasedDigitInput] run 메소드 사용');
//           result = await externalModel.run([inputBuffer]);
//           if (Array.isArray(result) && result.length > 0) {
//             outputs = result[0] as Float32Array;
//           } else {
//             throw new Error('모델 실행 결과가 예상 형식과 다릅니다');
//           }
//         } else if (typeof externalModel.runSync === 'function') {
//           console.log('[TimerBasedDigitInput] runSync 메소드 사용');
//           result = externalModel.runSync([inputBuffer]);
//           if (Array.isArray(result) && result.length > 0) {
//             outputs = result[0] as Float32Array;
//           } else {
//             throw new Error('모델 실행 결과가 예상 형식과 다릅니다');
//           }
//         } else {
//           throw new Error('모델에 실행 메소드가 없습니다');
//         }
//       } catch (modelError) {
//         console.error('[TimerBasedDigitInput] 모델 실행 오류:', modelError);
//         fallbackRecognition();
//         return;
//       }
      
//       // Softmax 적용 및 최대값 찾기
//       const softmaxProbs = applySoftmax(outputs);
      
//       // 가장 높은 확률을 가진 숫자 찾기
//       let maxProbIndex = 0;
//       let maxProb = softmaxProbs[0];
      
//       for (let i = 1; i < softmaxProbs.length; i++) {
//         if (softmaxProbs[i] > maxProb) {
//           maxProb = softmaxProbs[i];
//           maxProbIndex = i;
//         }
//       }
      
//       console.log('[TimerBasedDigitInput] 인식된 숫자:', maxProbIndex);
//       onDigitRecognized(maxProbIndex.toString());
      
//     } catch (error) {
//       console.error('[TimerBasedDigitInput] 인식 오류:', error);
//       fallbackRecognition();
//     } finally {
//       setPaths([]);
//       pointsArray.current = [];
//       setPoints([]);
//       currentPathRef.current = null;
//       setIsRecognizing(false);
      
//       if (currentDigitIndex >= maxDigits - 1) {
//         setTimeout(onClose, 1500);
//       }
//     }
//   }, [
//     onClose,
//     currentDigitIndex,
//     maxDigits,
//     externalModel,
//     externalModelLoaded,
//     fallbackRecognition,
//     points,
//     onDigitRecognized,
//     preprocessCurrentPoints
//   ]);
  
//   // 터치 이벤트 처리
//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onMoveShouldSetPanResponder: () => true,
//     onPanResponderGrant: (event) => {
//       const {locationX, locationY} = event.nativeEvent;
      
//       // 새 패스 생성 및 시작점 설정
//       const path = Skia.Path.Make();
//       path.moveTo(locationX, locationY);
//       currentPathRef.current = path;
      
//       // 포인트 배열 초기화 및 첫 포인트 추가
//       pointsArray.current = [{x: locationX, y: locationY}];
      
//       // 포인트 상태 설정
//       setPoints([...pointsArray.current]);
      
//       // 패스 추가
//       if (currentPathRef.current) {
//         setPaths(prev => [...prev, currentPathRef.current!]);
//       }
      
//       // 타이머 취소
//       if (recognitionTimer.current) {
//         clearTimeout(recognitionTimer.current);
//         recognitionTimer.current = null;
//       }
      
//       // 타이머 애니메이션 취소
//       if (animationFrameId.current) {
//         cancelAnimationFrame(animationFrameId.current);
//         animationFrameId.current = null;
//       }
      
//       setTimerProgress(0);
      
//       // 시간 기록
//       lastPointTime.current = Date.now();
//     },
//     onPanResponderMove: (event) => {
//       if (!currentPathRef.current) return;
    
//       const {locationX, locationY} = event.nativeEvent;
//       const currentTime = Date.now();
      
//       // 이전 포인트와의 거리가 충분히 클 때만 포인트 추가
//       const lastPoint = pointsArray.current.length > 0 
//         ? pointsArray.current[pointsArray.current.length - 1] 
//         : null;
      
//       if (lastPoint) {
//         const dist = distance(lastPoint.x, lastPoint.y, locationX, locationY);
//         const timeDiff = currentTime - lastPointTime.current;
        
//         if (dist > 2.5 || timeDiff > 30) {
//           // 패스 업데이트
//           currentPathRef.current.lineTo(locationX, locationY);
          
//           // 포인트 추가
//           pointsArray.current.push({x: locationX, y: locationY});
          
//           // 패스 업데이트
//           setPaths(prev => {
//             const newPaths = [...prev];
//             if (newPaths.length > 0) {
//               newPaths[newPaths.length - 1] = currentPathRef.current!;
//             }
//             return newPaths;
//           });
          
//           // 포인트 상태 업데이트
//           if (timeDiff > 50 || pointsArray.current.length % 10 === 0) {
//             setPoints([...pointsArray.current]);
//           }
//         }
        
//         lastPointTime.current = currentTime;
//       }
//     },
//     onPanResponderRelease: () => {
//       currentPathRef.current = null;
      
//       if (pointsArray.current.length >= 10) {
//         startTimerAnimation();
        
//         recognitionTimer.current = setTimeout(() => {
//           recognizeDigit();
//         }, 1500);
        
//         console.log('[TimerBasedDigitInput] 인식 타이머 시작, 포인트 개수:', pointsArray.current.length);
//       } else {
//         console.log('[TimerBasedDigitInput] 포인트 개수 부족, 인식 취소:', pointsArray.current.length);
//       }
//     }
//   });
  
//   // 컴포넌트가 마운트/언마운트될 때 페이드 애니메이션 처리
//   useEffect(() => {
//     if (visible) {
//       // 초기화
//       setPaths([]);
//       currentPathRef.current = null;
//       setTimerProgress(0);
      
//       // 페이드 인
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       // 페이드 아웃
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [visible, fadeAnim]);
  
//   // 컴포넌트가 표시되지 않으면 렌더링하지 않음
//   if (!visible) return null;
  
//   return (
//     <Modal
//       visible={visible}
//       animationType="fade"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <Animated.View 
//         style={[styles.container, { opacity: fadeAnim }]}
//       >
//         <View style={styles.content}>
//           <View style={styles.headerContainer}>
//             <Text style={styles.headerText}>
//               손글씨로 숫자 입력 ({currentDigitIndex + 1}/{maxDigits})
//             </Text>
//             <Text style={styles.subtitleText}>숫자를 손가락으로 직접 그려주세요</Text>
//           </View>
          
//           <View style={styles.timerContainer}>
//             <View style={styles.timerBar}>
//               <View 
//                 style={[
//                   styles.timerProgress, 
//                   { 
//                     width: `${timerProgress * 100}%`,
//                     backgroundColor: timerProgress > 0.7 ? '#ff6b6b' : '#4dabf7'
//                   }
//                 ]} 
//               />
//             </View>
//           </View>
          
//           <View style={styles.canvasContainer} {...panResponder.panHandlers}>
//             <Canvas 
//               style={styles.canvas} 
//               ref={canvasRef}
//             >
//               {paths.map((path, i) => (
//                 <Path
//                   key={i}
//                   path={path}
//                   color="white"
//                   style="stroke"
//                   strokeWidth={strokeWidth}
//                   strokeJoin="round"
//                   strokeCap="round"
//                 />
//               ))}
//             </Canvas>
            
//             {isRecognizing && (
//               <View style={styles.recognizingOverlay}>
//                 <ActivityIndicator size="large" color="#4dabf7" />
//                 <Text style={styles.recognizingText}>인식 중...</Text>
//               </View>
//             )}
//           </View>
          
//           <View style={styles.toolbarContainer}>
//             <TouchableOpacity 
//               style={styles.toolButton} 
//               onPress={() => {
//                 setPaths([]);
//                 setPoints([]);
//                 currentPathRef.current = null;
//                 pointsArray.current = [];
//                 if (recognitionTimer.current) {
//                   clearTimeout(recognitionTimer.current);
//                   recognitionTimer.current = null;
//                 }
//                 setTimerProgress(0);
//                 if (animationFrameId.current) {
//                   cancelAnimationFrame(animationFrameId.current);
//                   animationFrameId.current = null;
//                 }
//               }}
//             >
//               <Icon name="trash-outline" size={24} color="#fff" />
//               <Text style={styles.toolText}>지우기</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.toolButton} 
//               onPress={onClose}
//             >
//               <Icon name="close-circle-outline" size={24} color="#fff" />
//               <Text style={styles.toolText}>닫기</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.footerContainer}>
//             <Text style={styles.footerText}>
//               {isRecognizing 
//                 ? '손글씨를 인식하고 있어요...' 
//                 : '그리고 잠시 기다리시면 자동으로 인식됩니다.'}
//             </Text>
//             <Text style={styles.statusText}>
//               • {externalModelLoaded ? 'TFLite 모델이 로드되었습니다.' : '모델 로딩 중...'}
//             </Text>
//           </View>
//         </View>
//       </Animated.View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//   },
//   content: {
//     width: '90%',
//     maxWidth: 500,
//     backgroundColor: '#1e1e1e',
//     borderRadius: 12,
//     padding: 16,
//     paddingBottom: 24,
//     alignItems: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   headerContainer: {
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   headerText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 4,
//   },
//   subtitleText: {
//     fontSize: 14,
//     color: '#adb5bd',
//     marginBottom: 8,
//   },
//   canvasContainer: {
//     width: '100%',
//     aspectRatio: 1,
//     backgroundColor: '#000',
//     borderRadius: 8,
//     marginVertical: 12,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   canvas: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   timerContainer: {
//     width: '100%',
//     height: 8,
//     backgroundColor: '#343a40',
//     borderRadius: 4,
//     overflow: 'hidden',
//     marginBottom: 8,
//   },
//   timerBar: {
//     flex: 1,
//     backgroundColor: 'transparent',
//   },
//   timerProgress: {
//     height: '100%',
//     backgroundColor: '#4dabf7',
//   },
//   recognizingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   recognizingText: {
//     color: '#fff',
//     marginTop: 12,
//     fontSize: 16,
//   },
//   toolbarContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     width: '100%',
//     marginVertical: 12,
//   },
//   toolButton: {
//     alignItems: 'center',
//     padding: 8,
//   },
//   toolText: {
//     color: '#ced4da',
//     marginTop: 4,
//     fontSize: 12,
//   },
//   footerContainer: {
//     alignItems: 'center',
//   },
//   footerText: {
//     color: '#adb5bd',
//     fontSize: 12,
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   statusText: {
//     color: '#4dabf7',
//     fontSize: 12,
//   },
// });

// export default TimerBasedDigitInput;
