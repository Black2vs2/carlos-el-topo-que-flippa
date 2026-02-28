@echo off
cd /d "%~dp0.."
if not exist build mkdir build
go build -ldflags "-s -w -X github.com/ao-data/albiondata-client/client.DefaultIngestURL=https://aoflip.im-ei.it/orders -X github.com/ao-data/albiondata-client/client.DefaultAuthToken=n5WA2BTpV00QCLy466i96yxL7vdDefr" -o build/albiondata-client-prod.exe albiondata-client.go
echo Done: build/albiondata-client-prod.exe
