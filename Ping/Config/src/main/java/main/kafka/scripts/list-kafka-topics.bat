@echo off
echo Topics Kafka
cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092"
