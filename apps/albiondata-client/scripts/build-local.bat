@echo off
cd /d "%~dp0.."
if not exist build mkdir build
go build -ldflags "-X main.version=dev" -o build/albiondata-client.exe albiondata-client.go
echo Done: build/albiondata-client.exe
