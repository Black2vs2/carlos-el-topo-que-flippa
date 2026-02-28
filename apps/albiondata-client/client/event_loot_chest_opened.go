package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventLootChestOpened struct {
	ObjectId int `mapstructure:"0"`
}

func (event eventLootChestOpened) Process(state *albionState) {
	log.Debugf("Got evLootChestOpened: ObjectId=%d", event.ObjectId)

	payload := map[string]interface{}{
		"type":        "chest_event",
		"chestId":     fmt.Sprintf("%d", event.ObjectId),
		"chestStatus": "Opened",
		"zoneName":    state.LocationString,
	}

	sendAvalonEvent(payload)
}
