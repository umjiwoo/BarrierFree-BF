# 1. 베이스 이미지 선택
FROM openjdk:17-jdk-slim

# 2. 작업 디렉토리 설정
WORKDIR /blind_fintech

# 3. 빌드된 JAR 파일을 컨테이너 내부로 복사
COPY build/libs/blindfin_backend.jar blindfin_backend.jar

# 4. 애플리케이션 실행
CMD ["java", "-jar", "blindfin_backend.jar"]