package client

import (
	"fmt"
	"strings"

	"github.com/ao-data/albiondata-client/log"
)

type eventNewLootChest struct {
	ObjectId               int    `mapstructure:"0"`
	UniqueName             string `mapstructure:"3"`
	UniqueNameWithLocation string `mapstructure:"4"`
}

func (event eventNewLootChest) Process(state *albionState) {
	log.Debugf("Got evNewLootChest: ObjectId=%d UniqueName=%q UniqueNameWithLocation=%q",
		event.ObjectId, event.UniqueName, event.UniqueNameWithLocation)

	chestType := classifyChestType(event.UniqueName)

	payload := map[string]interface{}{
		"type":        "chest_event",
		"chestId":     fmt.Sprintf("%d", event.ObjectId),
		"chestType":   chestType,
		"chestStatus": "Spawned",
		"zoneName":    state.LocationString,
	}

	sendAvalonEvent(payload)
}

func classifyChestType(uniqueName string) string {
	upper := strings.ToUpper(uniqueName)
	switch {
	case strings.Contains(upper, "GOLD"):
		return "GOLD"
	case strings.Contains(upper, "BLUE"):
		return "BLUE"
	case strings.Contains(upper, "GREEN"):
		return "GREEN"
	default:
		return "UNKNOWN"
	}
}
