package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventUpdateLootChest struct {
	ObjectId int         `mapstructure:"0"`
	Status   int         `mapstructure:"1"`
	Field2   interface{} `mapstructure:"2"`
	Field3   interface{} `mapstructure:"3"`
	Field4   interface{} `mapstructure:"4"`
	Field5   interface{} `mapstructure:"5"`
}

func (event eventUpdateLootChest) Process(state *albionState) {
	statusStr := mapChestStatus(event.Status)
	log.Infof("[CHEST] evUpdateLootChest: id=%d rawStatus=%d status=%s %s zone=%s",
		event.ObjectId, event.Status, statusStr, FormatPosition(event.ObjectId), state.LocationString)
	log.Infof("[CHEST]   Raw fields: 2=%v 3=%v 4=%v 5=%v", event.Field2, event.Field3, event.Field4, event.Field5)

	payload := map[string]interface{}{
		"type":        "chest_event",
		"chestId":     fmt.Sprintf("%d", event.ObjectId),
		"chestStatus": statusStr,
		"zoneName":    state.LocationString,
	}

	sendAvalonEvent(payload)
}

func mapChestStatus(status int) string {
	switch status {
	case 0:
		return "Spawned"
	case 1:
		return "Opening"
	case 2:
		return "Opened"
	case 3:
		return "Cancelled"
	case 4:
		return "Protected"
	case 5:
		return "Despawned"
	default:
		log.Infof("[CHEST] Unknown chest status code: %d", status)
		return fmt.Sprintf("Unknown(%d)", status)
	}
}
