package client

import (
	"fmt"

	"github.com/ao-data/albiondata-client/log"
)

type eventLootChestSpawnpointsUpdate struct {
	RawField1 interface{} `mapstructure:"1"`
	RawField2 interface{} `mapstructure:"2"`
	Positions interface{} `mapstructure:"3"`
	ChestIds  []int       `mapstructure:"4"`
	RawField5 interface{} `mapstructure:"5"`
}

func (event eventLootChestSpawnpointsUpdate) Process(state *albionState) {
	count := len(event.ChestIds)
	log.Infof("[CHEST] evLootChestSpawnpointsUpdate: %d chest spawnpoints in zone %s", count, state.LocationString)
	log.Infof("[CHEST]   Raw: ChestIds=%v Field1=%v Field2=%v Field5=%v Positions=%v",
		event.ChestIds, event.RawField1, event.RawField2, event.RawField5, event.Positions)

	// Parse Field1 as int array (chest type codes)
	field1Codes := toIntSlice(event.RawField1)
	// Parse positions as float array (x,y pairs)
	positions := toFloatSlice(event.Positions)

	for i := 0; i < count; i++ {
		chestId := event.ChestIds[i]

		// Extract position (x,y pair)
		posX, posY := 0.0, 0.0
		if i*2+1 < len(positions) {
			posX = positions[i*2]
			posY = positions[i*2+1]
		}

		// Extract field1 code
		field1 := 0
		if i < len(field1Codes) {
			field1 = field1Codes[i]
		}

		// Register in cache for learning
		globalChestCache.RegisterSpawnpoint(chestId, field1, posX, posY)

		// Try to classify from learned mappings
		chestType, uniqueName, known := globalChestCache.LookupByField1(field1)
		if known {
			log.Infof("[CHEST]   Spawnpoint[%d]: ChestId=%d Field1=%d -> %s (%s) Pos=(%.1f,%.1f)",
				i, chestId, field1, chestType, uniqueName, posX, posY)
		} else {
			log.Infof("[CHEST]   Spawnpoint[%d]: ChestId=%d Field1=%d (unknown type) Pos=(%.1f,%.1f)",
				i, chestId, field1, posX, posY)
		}

		payload := map[string]interface{}{
			"type":        "chest_event",
			"chestId":     fmt.Sprintf("%d", chestId),
			"chestStatus": "Spawned",
			"zoneName":    state.LocationString,
			"posX":        posX,
			"posY":        posY,
		}

		if known {
			payload["chestType"] = chestType
			payload["uniqueName"] = uniqueName
		}

		sendAvalonEvent(payload)
	}
}

// toIntSlice converts an interface{} that may be []int, []int8, []int16, []int32, etc. to []int.
func toIntSlice(v interface{}) []int {
	if v == nil {
		return nil
	}
	switch arr := v.(type) {
	case []int:
		return arr
	case []int8:
		out := make([]int, len(arr))
		for i, val := range arr {
			out[i] = int(val)
		}
		return out
	case []int16:
		out := make([]int, len(arr))
		for i, val := range arr {
			out[i] = int(val)
		}
		return out
	case []int32:
		out := make([]int, len(arr))
		for i, val := range arr {
			out[i] = int(val)
		}
		return out
	case []int64:
		out := make([]int, len(arr))
		for i, val := range arr {
			out[i] = int(val)
		}
		return out
	case []interface{}:
		out := make([]int, len(arr))
		for i, val := range arr {
			switch n := val.(type) {
			case int:
				out[i] = n
			case int8:
				out[i] = int(n)
			case int16:
				out[i] = int(n)
			case int32:
				out[i] = int(n)
			case int64:
				out[i] = int(n)
			case float32:
				out[i] = int(n)
			case float64:
				out[i] = int(n)
			}
		}
		return out
	default:
		return nil
	}
}

// toFloatSlice converts an interface{} that may be various numeric slice types to []float64.
func toFloatSlice(v interface{}) []float64 {
	if v == nil {
		return nil
	}
	switch arr := v.(type) {
	case []float64:
		return arr
	case []float32:
		out := make([]float64, len(arr))
		for i, val := range arr {
			out[i] = float64(val)
		}
		return out
	case []int:
		out := make([]float64, len(arr))
		for i, val := range arr {
			out[i] = float64(val)
		}
		return out
	case []int16:
		out := make([]float64, len(arr))
		for i, val := range arr {
			out[i] = float64(val)
		}
		return out
	case []int32:
		out := make([]float64, len(arr))
		for i, val := range arr {
			out[i] = float64(val)
		}
		return out
	case []interface{}:
		out := make([]float64, len(arr))
		for i, val := range arr {
			switch n := val.(type) {
			case float64:
				out[i] = n
			case float32:
				out[i] = float64(n)
			case int:
				out[i] = float64(n)
			case int16:
				out[i] = float64(n)
			case int32:
				out[i] = float64(n)
			case int64:
				out[i] = float64(n)
			}
		}
		return out
	default:
		return nil
	}
}
