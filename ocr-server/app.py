from flask import Flask, request, jsonify, Response
import json
from paddleocr import PaddleOCR
from PIL import Image
import numpy as np

from extract_info import extract_id_card_info

app = Flask(__name__)

# PaddleOCR 초기화 (한 번만)
ocr = PaddleOCR(
    det_model_dir='./inference/Multilingual_PP-OCRv3_det_infer',
    rec_model_dir='./inference/korean_PP-OCRv3_rec_infer',
    lang="korean"
)

@app.route('/ocr', methods=['POST'])
def ocr_image():
    if 'image' not in request.files:
        return jsonify({'error': '이미지 파일이 없습니다.'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': '파일명이 비어 있습니다.'}), 400

    try:
        # 이미지 메모리에서 읽고 RGB로 변환
        img = Image.open(file.stream).convert('RGB')
        img_np = np.array(img)

        # OCR 실행
        result = ocr.ocr(img_np, cls=True)

        text = []
        confidence = []

        for line in result[0]:
            text.append(line[1][0])
            confidence.append(line[1][1])
        
        res = {
            "isCorrect": False,
            "name": None,
            "birth": None
        }

        answer = extract_id_card_info(text, confidence)
        if answer["confidence"] >= 0.95:
            res['isCorrect'] = True
            res['name'] = answer["name"]
            res['birth'] = answer["resident_number_front"]

        return Response(
        response=json.dumps(res, ensure_ascii=False),
        status=200,
        mimetype='application/json'
    )

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, threaded=False)
