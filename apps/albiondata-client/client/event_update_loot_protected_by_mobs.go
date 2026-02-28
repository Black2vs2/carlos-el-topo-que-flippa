package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventUpdateLootProtectedByMobs struct {
	ObjectId int         `mapstructure:"0"`
	Status   int         `mapstructure:"1"`
	Field2   interface{} `mapstructure:"2"`
	Field3   interface{} `mapstructure:"3"`
	Field4   interface{} `mapstructure:"4"`
}

func (event eventUpdateLootProtectedByMobs) Process(state *albionState) {
	statusStr := "Protected"
	if event.Status == 0 {
		statusStr = "Unprotected"
	}

	log.Infof("[CHEST] evUpdateLootProtectedByMobs: id=%d rawStatus=%d status=%s %s zone=%s",
		event.ObjectId, event.Status, statusStr, FormatPosition(event.ObjectId), state.LocationString)
	log.Infof("[CHEST]   Raw fields: 2=%v 3=%v 4=%v", event.Field2, event.Field3, event.Field4)

	payload := map[string]interface{}{
		"type":        "chest_event",
		"chestId":     fmt.Sprintf("%d", event.ObjectId),
		"chestStatus": statusStr,
		"zoneName":    state.LocationString,
	}

	sendAvalonEvent(payload)
}
