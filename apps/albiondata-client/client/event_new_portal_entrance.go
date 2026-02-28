package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventNewPortalEntrance struct {
	ObjectId   int         `mapstructure:"0"`
	Field1     interface{} `mapstructure:"1"`
	Field2     interface{} `mapstructure:"2"`
	UniqueName string      `mapstructure:"3"`
	Field4     interface{} `mapstructure:"4"`
	Field5     interface{} `mapstructure:"5"`
	Field6     interface{} `mapstructure:"6"`
	Field7     interface{} `mapstructure:"7"`
	Field8     interface{} `mapstructure:"8"`
	Field9     interface{} `mapstructure:"9"`
	Field10    interface{} `mapstructure:"10"`
}

func (event eventNewPortalEntrance) Process(state *albionState) {
	log.Infof("[PORTAL] evNewPortalEntrance: id=%d name=%q zone=%s",
		event.ObjectId, event.UniqueName, state.LocationString)
	log.Infof("[PORTAL]   Raw fields: 1=%v 2=%v 4=%v 5=%v 6=%v 7=%v 8=%v 9=%v 10=%v",
		event.Field1, event.Field2, event.Field4, event.Field5,
		event.Field6, event.Field7, event.Field8, event.Field9, event.Field10)

	payload := map[string]interface{}{
		"type":       "portal_activity",
		"portalId":   fmt.Sprintf("%d", event.ObjectId),
		"portalName": event.UniqueName,
		"portalType": "entrance",
		"zoneName":   state.LocationString,
	}

	sendAvalonEvent(payload)
}
