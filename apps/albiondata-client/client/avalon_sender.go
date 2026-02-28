package client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/ao-data/albiondata-client/log"
)

var avalonHTTPClient = &http.Client{Timeout: 5 * time.Second}

func sendAvalonEvent(payload interface{}) {
	if ConfigGlobal.DisableUpload {
		log.Debug("Upload disabled, skipping Avalon event")
		return
	}

	backendBase, err := deriveBackendBase()
	if err != nil {
		log.Debugf("Cannot derive backend base URL: %v", err)
		return
	}

	data, err := json.Marshal(payload)
	if err != nil {
		log.Errorf("Error marshalling Avalon event: %v", err)
		return
	}

	targetURL := fmt.Sprintf("%s/avalon/events", backendBase)

	req, err := http.NewRequest("POST", targetURL, bytes.NewBuffer(data))
	if err != nil {
		log.Errorf("Error creating Avalon event request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	if ConfigGlobal.IngestAuthToken != "" {
		req.Header.Set("X-Auth-Token", ConfigGlobal.IngestAuthToken)
	}

	resp, err := avalonHTTPClient.Do(req)
	if err != nil {
		log.Debugf("Failed to send Avalon event: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Infof("Avalon event sent: %s", string(data))
	} else {
		log.Debugf("Avalon event got status %d: %s", resp.StatusCode, targetURL)
	}
}

func deriveBackendBase() (string, error) {
	ingestURL := ConfigGlobal.PublicIngestBaseUrls
	firstURL := strings.Split(ingestURL, ",")[0]

	parsed, err := url.Parse(firstURL)
	if err != nil {
		return "", fmt.Errorf("could not parse ingest URL %q: %w", firstURL, err)
	}

	return fmt.Sprintf("%s://%s", parsed.Scheme, parsed.Host), nil
}
