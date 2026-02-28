package client

import (
	"fmt"
	"strings"

	"github.com/ao-data/albiondata-client/log"
)

type eventNewLootChest struct {
	ObjectId               int    `mapstructure:"0"`
	UniqueName             string `mapstructure:"3"`
	UniqueNameWithLocation string `mapstructure:"4"`
}

func (event eventNewLootChest) Process(state *albionState) {
	chestType := classifyChestType(event.UniqueName)

	// Learn the mapping so spawnpoints can classify future chests instantly
	globalChestCache.LearnFromChestEvent(event.ObjectId, event.UniqueName, chestType)

	// Get position from spawnpoints cache if available
	posX, posY, hasPos := globalChestCache.GetPosition(event.ObjectId)

	log.Infof("[CHEST] evNewLootChest: id=%d type=%s uniqueName=%q locationName=%q %s zone=%s",
		event.ObjectId, chestType, event.UniqueName, event.UniqueNameWithLocation,
		FormatPosition(event.ObjectId), state.LocationString)

	payload := map[string]interface{}{
		"type":         "chest_event",
		"chestId":      fmt.Sprintf("%d", event.ObjectId),
		"chestType":    chestType,
		"chestStatus":  "Spawned",
		"uniqueName":   event.UniqueName,
		"locationName": event.UniqueNameWithLocation,
		"zoneName":     state.LocationString,
	}

	if hasPos {
		payload["posX"] = posX
		payload["posY"] = posY
	}

	sendAvalonEvent(payload)
}

// classifyChestType classifies Avalon chest type from UniqueName.
//
// Known Avalon naming: AVALON_{SIZE}_{DIFFICULTY}_{RANK}
//   Size:       SMALL, MEDIUM, LARGE
//   Difficulty: SOLO, GROUP, ELITE
//   Rank:       BASE, CHAMPION, BOSS
//
// Examples seen in the wild:
//   AVALON_SMALL_SOLO_BOSS      -> SMALL_SOLO_BOSS
//   AVALON_SMALL_SOLO_CHAMPION  -> SMALL_SOLO_CHAMPION
//   AVALON_SMALL_SOLO_BASE      -> SMALL_SOLO_BASE
//   AVALON_MEDIUM_ELITE_CHAMPION -> MEDIUM_ELITE_CHAMPION
//
// Older/other naming may include GOLD, BLUE, GREEN keywords.
func classifyChestType(uniqueName string) string {
	upper := strings.ToUpper(uniqueName)

	// Avalon road chest naming: AVALON_{SIZE}_{DIFFICULTY}_{RANK}
	if strings.HasPrefix(upper, "AVALON_") {
		parts := strings.Split(upper, "_")
		// AVALON_MEDIUM_ELITE_CHAMPION -> ["AVALON", "MEDIUM", "ELITE", "CHAMPION"]
		if len(parts) >= 4 {
			return fmt.Sprintf("%s_%s_%s", parts[1], parts[2], parts[3])
		}
		if len(parts) >= 3 {
			return fmt.Sprintf("%s_%s", parts[1], parts[2])
		}
		if len(parts) >= 2 {
			return parts[1]
		}
		return "AVALON"
	}

	// Color-based classification (older naming or specific chest types)
	switch {
	case strings.Contains(upper, "GOLD") || strings.Contains(upper, "LEGENDARY"):
		return "GOLD"
	case strings.Contains(upper, "BLUE") || strings.Contains(upper, "RARE"):
		return "BLUE"
	case strings.Contains(upper, "GREEN"):
		return "GREEN"
	case strings.Contains(upper, "BOSS"):
		return "BOSS"
	}

	log.Infof("[CHEST] Unclassified chest uniqueName=%q", uniqueName)
	return uniqueName
}
