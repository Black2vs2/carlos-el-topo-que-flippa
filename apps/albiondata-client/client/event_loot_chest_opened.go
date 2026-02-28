package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventLootChestOpened struct {
	ObjectId int         `mapstructure:"0"`
	Field1   interface{} `mapstructure:"1"`
	Field2   interface{} `mapstructure:"2"`
	Field3   interface{} `mapstructure:"3"`
}

func (event eventLootChestOpened) Process(state *albionState) {
	log.Infof("[CHEST] evLootChestOpened: id=%d %s zone=%s",
		event.ObjectId, FormatPosition(event.ObjectId), state.LocationString)
	log.Infof("[CHEST]   Raw fields: 1=%v 2=%v 3=%v", event.Field1, event.Field2, event.Field3)

	payload := map[string]interface{}{
		"type":        "chest_event",
		"chestId":     fmt.Sprintf("%d", event.ObjectId),
		"chestStatus": "Opened",
		"zoneName":    state.LocationString,
	}

	sendAvalonEvent(payload)
}
