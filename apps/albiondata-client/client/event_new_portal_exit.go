package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventNewPortalExit struct {
	ObjectId   int    `mapstructure:"0"`
	UniqueName string `mapstructure:"3"`
}

func (event eventNewPortalExit) Process(state *albionState) {
	log.Debugf("Got evNewPortalExit: ObjectId=%d UniqueName=%q", event.ObjectId, event.UniqueName)

	payload := map[string]interface{}{
		"type":     "portal_activity",
		"portalId": fmt.Sprintf("%d", event.ObjectId),
		"zoneName": state.LocationString,
	}

	sendAvalonEvent(payload)
}
