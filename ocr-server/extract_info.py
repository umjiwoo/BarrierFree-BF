import re

def extract_id_card_info(data_list):
    """
    주민등록증 정보를 추출하는 함수
    
    Args:
        data_list (list): 주민등록증 데이터가 포함된 문자열 리스트
    
    Returns:
        dict: 이름, 주민번호, 발급일자를 포함한 딕셔너리
    """
    # 결과를 저장할 딕셔너리
    result = {
        "name": None,
        "resident_number_front": None,
        "resident_number_back": None,
        "issue_date": None
    }
    
    # 정규식 패턴
    resident_number_pattern = r'^\d{6}-\d{7}$'
    
    # '주민등록증' 문자열 인덱스 찾기
    try:
        id_card_index = data_list.index('주민등록증')
        
        # 이름 추출 ('주민등록증' 다음 인덱스의 문자열에서 한자 제외)
        if id_card_index + 1 < len(data_list):
            full_name = data_list[id_card_index + 1]
            # 한글 부분만 추출 (한자 제외)
            korean_name = re.match(r'^([가-힣]+)', full_name)
            if korean_name:
                result["name"] = korean_name.group(1)
    except ValueError:
        # '주민등록증' 문자열이 없는 경우
        pass
    
    # 주민번호 검출
    for item in data_list:
        if re.match(resident_number_pattern, item):
            result["resident_number_front"] = item[:6]
            result["resident_number_back"] = item[7:]
            break
    
    # 발급일자 추출 (연속된 연도/월/일 패턴 찾기)
    for i in range(len(data_list) - 2):
        # 현재 항목이 4자리 연도인지 확인 (1950년 이상)
        if re.match(r'^\d{4}$', data_list[i]) and int(data_list[i]) >= 1950:
            year = data_list[i]
            
            # 다음 항목이 월인지 확인 (1-12)
            if re.match(r'^\d{1,2}$', data_list[i+1]) and 1 <= int(data_list[i+1]) <= 12:
                month = data_list[i+1].zfill(2)  # 한 자리 월을 두 자리로 변환
                
                # 그 다음 항목이 일인지 확인 (1-31)
                if re.match(r'^\d{1,2}$', data_list[i+2]) and 1 <= int(data_list[i+2]) <= 31:
                    day = data_list[i+2].zfill(2)  # 한 자리 일을 두 자리로 변환
                    
                    # 유효한 날짜인지 추가 검증 (간단한 방식)
                    if not (month == '02' and int(day) > 29):  # 2월은 29일까지만 허용 (간소화)
                        result["issue_date"] = f"{year}{month}{day}"
                        break
    
    return result

# # 예제 데이터 (한자 포함)
# data1 = ['주민등록증', '강병철法黃湯', '470314-4151356', '강원도', '동구', '봉은사', '89-17', '2747동', '2549호', '래미안아파트', '2006', '03', '20', '경기도', '수원시장']

# # 정보 추출
# info1 = extract_id_card_info(data1)
# print("\n예제 1 (한자 포함 이름):")
# print(f"이름: {info1['name']}")
# print(f"주민번호: {info1['resident_number']}")
# print(f"발급일자: {info1['issue_date']}")

# # 한자가 없는 예제 데이터
# data2 = ['주민등록증', '김민준', '980512-1234567', '서울특별시', '강남구', '테헤란로', '123', '101동', '505호', '2015', '05', '10', '서울특별시장']

# # 정보 추출
# info2 = extract_id_card_info(data2)
# print("\n예제 2 (한자 없는 이름):")
# print(f"이름: {info2['name']}")
# print(f"주민번호: {info2['resident_number']}")
# print(f"발급일자: {info2['issue_date'] if info2['issue_date'] else '정보 없음'}")

# # 발급일자 없는 예제
# data3 = ['주민등록증', '박지우', '901122-2345678', '부산광역시', '해운대구', '우동', '45', '삼성아파트']

# # 정보 추출
# info3 = extract_id_card_info(data3)
# print("\n예제 3 (발급일자 없음):")
# print(f"이름: {info3['name']}")
# print(f"주민번호: {info3['resident_number']}")
# print(f"발급일자: {info3['issue_date'] if info3['issue_date'] else '정보 없음'}")