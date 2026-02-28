package client

import (
	"github.com/ao-data/albiondata-client/log"
)

type operationGetGameServerByCluster struct {
	ZoneID string `mapstructure:"0"`
}

func (op operationGetGameServerByCluster) Process(state *albionState) {
	previousZone := state.LocationString
	state.LocationString = op.ZoneID

	log.Infof("[ZONE] Zone change: %s -> %s", previousZone, op.ZoneID)

	// Dump all learned chest type mappings so far
	globalChestCache.DumpKnownMappings()
	// Clear per-zone data (keep learned mappings)
	globalChestCache.ClearZone()

	payload := map[string]interface{}{
		"type":         "zone_change",
		"zoneName":     op.ZoneID,
		"previousZone": previousZone,
	}

	sendAvalonEvent(payload)
}
