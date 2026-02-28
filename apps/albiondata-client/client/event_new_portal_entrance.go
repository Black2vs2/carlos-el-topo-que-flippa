package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventNewPortalEntrance struct {
	ObjectId   int    `mapstructure:"0"`
	UniqueName string `mapstructure:"3"`
}

func (event eventNewPortalEntrance) Process(state *albionState) {
	log.Debugf("Got evNewPortalEntrance: ObjectId=%d UniqueName=%q", event.ObjectId, event.UniqueName)

	payload := map[string]interface{}{
		"type":     "portal_activity",
		"portalId": fmt.Sprintf("%d", event.ObjectId),
		"zoneName": state.LocationString,
	}

	sendAvalonEvent(payload)
}
