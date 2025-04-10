import { Skia, type SkPath, PaintStyle, StrokeCap, StrokeJoin, AlphaType, ColorType } from "@shopify/react-native-skia";
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

const INPUT_SIZE = 28;  // 이미지 크기
const PADDING = 2;  // 여백
const IDEAL_STROKE_RATIO = 0.08;  // 두께 비율

// 이미지 전처리
export async function preprocessPathToImage(paths: SkPath[]): Promise<Float32Array | null> {
  if (!paths || paths.length === 0) return null;

  console.log('변환 시작');

  // 전체 path를 하나로 합치기
  const combinedPath = Skia.Path.Make();
  paths.forEach(p => combinedPath.addPath(p));
  const bounds = combinedPath.getBounds();

  if (bounds.width === 0 || bounds.height === 0) {
    console.warn("⚠️ Path bounds가 비정상입니다.");
    return null;
  }

  // scale 조정
  const maxDim = Math.max(bounds.width, bounds.height);
  const scale = (INPUT_SIZE - 2 * PADDING) / maxDim;
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;
  
  const offsetX = (INPUT_SIZE - scaledWidth) / 2 - bounds.x * scale;
  const offsetY = (INPUT_SIZE - scaledHeight) / 2 - bounds.y * scale;
  
  const matrix = Skia.Matrix()
    .translate(offsetX, offsetY)
    .scale(scale, scale)

    // console log 확인
  console.log("!!!!!", 'scale:', scale)
  console.log("!!!!!", 'w:', scaledWidth, 'h:', scaledHeight)
  console.log("!!!!!", 'x:', bounds.x * scale, 'y:', bounds.y * scale)
  console.log("!!!!!", 'offsetX:', offsetX, 'offsetY:', offsetY) 

  const scaledPath = Skia.Path.Make();
  scaledPath.addPath(combinedPath, matrix);

  const strokeWidth = Math.max(2, IDEAL_STROKE_RATIO * maxDim * scale);
  const surface = Skia.Surface.MakeOffscreen(INPUT_SIZE, INPUT_SIZE)!;
  const canvas = surface.getCanvas();
  canvas.clear(Skia.Color("white"));

  const paint = Skia.Paint();
  paint.setColor(Skia.Color("black"));
  paint.setStyle(PaintStyle.Stroke);
  paint.setStrokeWidth(strokeWidth);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeJoin(StrokeJoin.Round);

  // console log 확인용
  console.log('✅ combinedPath bounds:', combinedPath.getBounds());
  console.log('✅ scaledPath bounds:', scaledPath.getBounds());

  canvas.drawPath(scaledPath, paint);

  const image = surface.makeImageSnapshot();

  // 📸 디버깅용 저장
  // try {
  //   const base64 = image.encodeToBase64();
  //   const filePath = `${RNFS.CachesDirectoryPath}/debug_digit_${Date.now()}.png`;
  //   await RNFS.writeFile(filePath, base64, 'base64');
  //   await CameraRoll.saveAsset(filePath, { type: 'photo', album: 'Digits' });
  //   console.log("🖼️ 디버깅 이미지 저장 완료:", filePath);
  // } catch (err) {
  //   console.error("디버깅 이미지 저장 실패:", err);
  // }

  const imageInfo = {
    width: INPUT_SIZE,
    height: INPUT_SIZE,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  };

  const pixelData = image.readPixels(0, 0, imageInfo);

  if (!pixelData) {
    console.warn("📛 readPixels 실패");
    return null;
  }
  
  const grayscale = new Float32Array(INPUT_SIZE * INPUT_SIZE);
  let max = 0;
  
  for (let i = 0; i < INPUT_SIZE * INPUT_SIZE; i++) {
    const r = pixelData[i * 4];
    const g = pixelData[i * 4 + 1];
    const b = pixelData[i * 4 + 2];
    const gray = 1.0 - (r + g + b) / (3 * 255);
    grayscale[i] = gray;
    if (gray > max) max = gray;
  }
  
  if (max > 0) {
    for (let i = 0; i < grayscale.length; i++) {
      grayscale[i] /= max;
    }
  }
  
  return grayscale;
}

