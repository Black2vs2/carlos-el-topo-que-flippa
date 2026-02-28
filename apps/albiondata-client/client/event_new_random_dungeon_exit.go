package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventNewRandomDungeonExit struct {
	ObjectId       int         `mapstructure:"0"`
	Position       interface{} `mapstructure:"1"`
	Field2         interface{} `mapstructure:"2"`
	DestinationName string    `mapstructure:"3"`
	Accessible     interface{} `mapstructure:"4"`
	UniqueName     string      `mapstructure:"5"`
	Field6         interface{} `mapstructure:"6"`
	Visible        interface{} `mapstructure:"7"`
	ExitType       interface{} `mapstructure:"8"`
	Field9         interface{} `mapstructure:"9"`
	Field14        interface{} `mapstructure:"14"`
	Field17        interface{} `mapstructure:"17"`
	Field19        interface{} `mapstructure:"19"`
}

func (event eventNewRandomDungeonExit) Process(state *albionState) {
	// Parse position
	positions := toFloatSlice(event.Position)
	posX, posY := 0.0, 0.0
	if len(positions) >= 2 {
		posX = positions[0]
		posY = positions[1]
	}

	log.Infof("[PORTAL] evNewRandomDungeonExit: id=%d dest=%q uniqueName=%q pos=(%.1f,%.1f) accessible=%v visible=%v exitType=%v zone=%s",
		event.ObjectId, event.DestinationName, event.UniqueName, posX, posY,
		event.Accessible, event.Visible, event.ExitType, state.LocationString)
	log.Infof("[PORTAL]   Raw fields: 2=%v 6=%v 9=%v 14=%v 17=%v 19=%v",
		event.Field2, event.Field6, event.Field9, event.Field14, event.Field17, event.Field19)

	payload := map[string]interface{}{
		"type":       "portal_activity",
		"portalId":   fmt.Sprintf("%d", event.ObjectId),
		"portalName": event.DestinationName,
		"portalType": "exit",
		"uniqueName": event.UniqueName,
		"zoneName":   state.LocationString,
		"posX":       posX,
		"posY":       posY,
	}

	sendAvalonEvent(payload)
}
