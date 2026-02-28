package client

import (
	"fmt"
	"sync"

	"github.com/ao-data/albiondata-client/log"
)

// chestTypeCache learns mappings from spawnpoint Field1 codes to chest
// UniqueName / classified type by correlating evLootChestSpawnpointsUpdate
// data with subsequent evNewLootChest events (which carry the real name).
//
// It also stores per-chest position data from spawnpoints so we can attach
// coordinates even when the evNewLootChest fires (which doesn't carry position).
type chestTypeCache struct {
	mu sync.RWMutex

	// field1ToType maps the spawnpoint "Field1" code to the classified chestType string.
	// Learned at runtime when we see the same ObjectId in both spawnpoints and evNewLootChest.
	field1ToType map[int]string

	// field1ToUniqueName maps Field1 code to the raw UniqueName string.
	field1ToUniqueName map[int]string

	// chestIdToField1 maps a chest ObjectId to its Field1 code from the most recent spawnpoints update.
	chestIdToField1 map[int]int

	// chestPositions maps chestId to [x, y] coordinates from spawnpoints.
	chestPositions map[int][2]float64
}

var globalChestCache = &chestTypeCache{
	field1ToType:       make(map[int]string),
	field1ToUniqueName: make(map[int]string),
	chestIdToField1:    make(map[int]int),
	chestPositions:     make(map[int][2]float64),
}

// RegisterSpawnpoint stores a chest's Field1 code and position from evLootChestSpawnpointsUpdate.
func (c *chestTypeCache) RegisterSpawnpoint(chestId int, field1Code int, posX, posY float64) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.chestIdToField1[chestId] = field1Code
	c.chestPositions[chestId] = [2]float64{posX, posY}
}

// LearnFromChestEvent is called when evNewLootChest fires, correlating the chest's
// ObjectId with its UniqueName. If we have a Field1 code stored for this chest,
// we learn the mapping.
func (c *chestTypeCache) LearnFromChestEvent(chestId int, uniqueName string, classifiedType string) {
	c.mu.Lock()
	defer c.mu.Unlock()

	field1, ok := c.chestIdToField1[chestId]
	if !ok {
		return
	}

	existing, alreadyKnown := c.field1ToType[field1]
	if !alreadyKnown || existing != classifiedType {
		log.Infof("[CHEST-CACHE] Learned: Field1=%d -> type=%q uniqueName=%q (from chestId=%d)",
			field1, classifiedType, uniqueName, chestId)
		c.field1ToType[field1] = classifiedType
		c.field1ToUniqueName[field1] = uniqueName
	}
}

// LookupByField1 returns the classified type for a given Field1 code, if known.
func (c *chestTypeCache) LookupByField1(field1 int) (chestType string, uniqueName string, ok bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	ct, ok1 := c.field1ToType[field1]
	un, _ := c.field1ToUniqueName[field1]
	return ct, un, ok1
}

// GetPosition returns the stored position for a chest, if available.
func (c *chestTypeCache) GetPosition(chestId int) (posX, posY float64, ok bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	pos, ok := c.chestPositions[chestId]
	if !ok {
		return 0, 0, false
	}
	return pos[0], pos[1], true
}

// ClearZone wipes per-chest data (called on zone change).
func (c *chestTypeCache) ClearZone() {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.chestIdToField1 = make(map[int]int)
	c.chestPositions = make(map[int][2]float64)
	// Keep field1ToType and field1ToUniqueName — those are permanent learned mappings.
}

// DumpKnownMappings logs all learned Field1 -> type mappings.
func (c *chestTypeCache) DumpKnownMappings() {
	c.mu.RLock()
	defer c.mu.RUnlock()

	if len(c.field1ToType) == 0 {
		log.Infof("[CHEST-CACHE] No learned mappings yet")
		return
	}
	for code, ct := range c.field1ToType {
		un := c.field1ToUniqueName[code]
		log.Infof("[CHEST-CACHE] Field1=%d -> type=%q uniqueName=%q", code, ct, un)
	}
}

// FormatPosition returns position as a string for logging.
func FormatPosition(chestId int) string {
	x, y, ok := globalChestCache.GetPosition(chestId)
	if !ok {
		return "pos=unknown"
	}
	return fmt.Sprintf("pos=(%.1f,%.1f)", x, y)
}
