@echo off
echo Stop Kafka and Zookeeper...
taskkill /F /IM java.exe >nul 2>&1
echo ============================
echo Delete logs Kafka/Zookeeper...
IF EXIST "C:\Kafka\kafka-logs" (
    rmdir /S /Q "C:\Kafka\kafka-logs"
    echo DELETE: kafka-logs
)

IF EXIST "C:\Kafka\zookeeper-data" (
    rmdir /S /Q "C:\Kafka\zookeeper-data"
    echo DELETE: zookeeper-data
)

echo Start Zookeeper...
start "Zookeeper" cmd /k "cd /d C:\Kafka && .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties"
timeout /t 10 > nul

echo Start Kafka...
start "Kafka" cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-server-start.bat .\config\server.properties"
timeout /t 10 >nul
