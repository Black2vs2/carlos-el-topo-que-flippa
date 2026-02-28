package client

import (
	"github.com/ao-data/albiondata-client/log"
)

type operationGetGameServerByCluster struct {
	ZoneID string `mapstructure:"0"`
}

func (op operationGetGameServerByCluster) Process(state *albionState) {
	log.Debugf("Got GetGameServerByCluster operation: ZoneID=%q", op.ZoneID)

	state.LocationString = op.ZoneID

	payload := map[string]interface{}{
		"type":     "zone_change",
		"zoneName": op.ZoneID,
	}

	sendAvalonEvent(payload)
}
