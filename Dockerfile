# Etapa 1: Construção
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package

# Etapa 2: Execução
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/puzzle-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]