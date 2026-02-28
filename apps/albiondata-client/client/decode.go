package client

import (
	"encoding/hex"
	"fmt"
	"reflect"
	"strconv"

	"github.com/ao-data/albiondata-client/lib"
	"github.com/ao-data/albiondata-client/log"
	"github.com/mitchellh/mapstructure"
)

func decodeRequest(params map[uint8]interface{}) (operation operation, err error) {
	if _, ok := params[253]; !ok {
		return nil, nil
	}

	code := params[253].(int16)

	switch OperationType(code) {
	case opGetGameServerByCluster:
		operation = &operationGetGameServerByCluster{}
	case opAuctionGetOffers:
		operation = &operationAuctionGetOffers{}
	case opAuctionGetItemAverageStats:
		operation = &operationAuctionGetItemAverageStats{}
	case opGetClusterMapInfo:
		operation = &operationGetClusterMapInfo{}
	// case opGoldMarketGetAverageInfo:
	case opGoldMarketGetAverageInfo:
		operation = &operationGoldMarketGetAverageInfo{}
	case opRealEstateGetAuctionData:
		operation = &operationRealEstateGetAuctionData{}
	case opRealEstateBidOnAuction:
		operation = &operationRealEstateBidOnAuction{}
	default:
		return nil, nil
	}

	err = decodeParams(params, operation)

	return operation, err
}

func decodeResponse(params map[uint8]interface{}) (operation operation, err error) {
	if _, ok := params[253]; !ok {
		return nil, nil
	}

	code := params[253].(int16)

	switch OperationType(code) {
	case opJoin:
		operation = &operationJoinResponse{}
	case opAuctionGetOffers:
		operation = &operationAuctionGetOffersResponse{}
	case opAuctionGetRequests:
		operation = &operationAuctionGetRequestsResponse{}
	case opAuctionBuyOffer:
		operation = &operationAuctionGetRequestsResponse{}
	case opAuctionGetItemAverageStats:
		operation = &operationAuctionGetItemAverageStatsResponse{}
	case opGetMailInfos:
		operation = &operationGetMailInfosResponse{}
	case opReadMail:
		operation = &operationReadMail{}
	case opGetClusterMapInfo:
		operation = &operationGetClusterMapInfoResponse{}
	// case opGoldMarketGetAverageInfo:
	case opGoldMarketGetAverageInfo:
		operation = &operationGoldMarketGetAverageInfoResponse{}
	case opRealEstateGetAuctionData:
		operation = &operationRealEstateGetAuctionDataResponse{}
	case opRealEstateBidOnAuction:
		operation = &operationRealEstateBidOnAuctionResponse{}
	default:
		return nil, nil
	}

	err = decodeParams(params, operation)

	return operation, err
}

func decodeEvent(params map[uint8]interface{}) (event operation, err error) {
	if _, ok := params[252]; !ok {
		return nil, nil
	}

	eventType := params[252].(int16)

	switch EventType(eventType) {
	// case evRespawn: //TODO: confirm this eventCode (old 77)
	// 	event = &eventPlayerOnlineStatus{}
	// case evCharacterStats: //TODO: confirm this eventCode (old 114)
	// 	event = &eventSkillData{}
	//case evRedZonePlayerNotification:
	//	event = &eventRedZonePlayerNotification{}
	case evRedZoneWorldMapEvent:
		event = &eventRedZoneWorldMapEvent{}
	case evNewLootChest:
		event = &eventNewLootChest{}
	case evUpdateLootChest:
		event = &eventUpdateLootChest{}
	case evLootChestOpened:
		event = &eventLootChestOpened{}
	case evUpdateLootProtectedByMobsWithMinimapDisplay:
		event = &eventUpdateLootProtectedByMobs{}
	case evNewPortalEntrance:
		event = &eventNewPortalEntrance{}
	case evNewPortalExit:
		event = &eventNewPortalExit{}

	// --- Handled events (spawnpoints) ---
	case evLootChestSpawnpointsUpdate:
		event = &eventLootChestSpawnpointsUpdate{}

	// --- Debug: Treasure chests (open world, may differ from loot chests) ---
	case evNewTreasureChest:
		log.Infof("[PHOTON-DBG] evNewTreasureChest (126): %s", formatParamsForLog(params))
		return nil, nil
	case evTreasureChestUsingStart:
		log.Infof("[PHOTON-DBG] evTreasureChestUsingStart (285): %s", formatParamsForLog(params))
		return nil, nil
	case evTreasureChestUsingFinished:
		log.Infof("[PHOTON-DBG] evTreasureChestUsingFinished (286): %s", formatParamsForLog(params))
		return nil, nil
	case evTreasureChestUsingCancel:
		log.Infof("[PHOTON-DBG] evTreasureChestUsingCancel (287): %s", formatParamsForLog(params))
		return nil, nil
	case evTreasureChestUsingOpeningComplete:
		log.Infof("[PHOTON-DBG] evTreasureChestUsingOpeningComplete (288): %s", formatParamsForLog(params))
		return nil, nil
	case evTreasureChestForceCloseInventory:
		log.Infof("[PHOTON-DBG] evTreasureChestForceCloseInventory (289): %s", formatParamsForLog(params))
		return nil, nil
	case evLocalTreasuresUpdate:
		log.Infof("[PHOTON-DBG] evLocalTreasuresUpdate (290): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMatchLootChestObject:
		log.Infof("[PHOTON-DBG] evNewMatchLootChestObject (145): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Mobs (guards, bosses near chests) ---
	case evNewMob:
		log.Debugf("[PHOTON-DBG] evNewMob (132): %s", formatParamsForLog(params))
		return nil, nil
	case evMobChangeState:
		log.Debugf("[PHOTON-DBG] evMobChangeState (46): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Harvestables (resources in zone) ---
	case evNewSimpleHarvestableObject:
		log.Debugf("[PHOTON-DBG] evNewSimpleHarvestableObject (37): %s", formatParamsForLog(params))
		return nil, nil
	case evNewSimpleHarvestableObjectList:
		log.Debugf("[PHOTON-DBG] evNewSimpleHarvestableObjectList (38): %s", formatParamsForLog(params))
		return nil, nil
	case evNewHarvestableObject:
		log.Debugf("[PHOTON-DBG] evNewHarvestableObject (39): %s", formatParamsForLog(params))
		return nil, nil
	case evHarvestableChangeState:
		log.Debugf("[PHOTON-DBG] evHarvestableChangeState (45): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Zone/Cluster info ---
	case evClusterInfoUpdate:
		log.Infof("[PHOTON-DBG] evClusterInfoUpdate (149): %s", formatParamsForLog(params))
		return nil, nil
	case evPlayerCounts:
		log.Infof("[PHOTON-DBG] evPlayerCounts (282): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Exits and entrances (portals, dungeons, mists, tunnels) ---
	case evNewRandomDungeonExit:
		event = &eventNewRandomDungeonExit{}
	case evNewTunnelExit:
		log.Infof("[PHOTON-DBG] evNewTunnelExit (454): %s", formatParamsForLog(params))
		return nil, nil
	case evNewTunnelExitTemp:
		log.Infof("[PHOTON-DBG] evNewTunnelExitTemp (529): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsStaticEntrance:
		log.Infof("[PHOTON-DBG] evNewMistsStaticEntrance (527): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsOpenWorldExit:
		log.Infof("[PHOTON-DBG] evNewMistsOpenWorldExit (528): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsBorderExit:
		log.Infof("[PHOTON-DBG] evNewMistsBorderExit (542): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsDungeonExit:
		log.Infof("[PHOTON-DBG] evNewMistsDungeonExit (543): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsCityEntrance:
		log.Infof("[PHOTON-DBG] evNewMistsCityEntrance (532): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsCityRoadsEntrance:
		log.Infof("[PHOTON-DBG] evNewMistsCityRoadsEntrance (533): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsImmediateReturnExit:
		log.Infof("[PHOTON-DBG] evNewMistsImmediateReturnExit (525): %s", formatParamsForLog(params))
		return nil, nil
	case evNewMistsWispSpawn:
		log.Infof("[PHOTON-DBG] evNewMistsWispSpawn (530): %s", formatParamsForLog(params))
		return nil, nil
	case evMistsWispSpawnStateChange:
		log.Infof("[PHOTON-DBG] evMistsWispSpawnStateChange (531): %s", formatParamsForLog(params))
		return nil, nil
	case evMistsEntranceDataChanged:
		log.Infof("[PHOTON-DBG] evMistsEntranceDataChanged (536): %s", formatParamsForLog(params))
		return nil, nil
	case evNewExit:
		log.Infof("[PHOTON-DBG] evNewExit (223): %s", formatParamsForLog(params))
		return nil, nil
	case evNewHellgateExitPortal:
		log.Infof("[PHOTON-DBG] evNewHellgateExitPortal (256): %s", formatParamsForLog(params))
		return nil, nil
	case evNewExpeditionExit:
		log.Infof("[PHOTON-DBG] evNewExpeditionExit (257): %s", formatParamsForLog(params))
		return nil, nil
	case evNewArenaExit:
		log.Infof("[PHOTON-DBG] evNewArenaExit (146): %s", formatParamsForLog(params))
		return nil, nil
	case evNewHideoutExit:
		log.Infof("[PHOTON-DBG] evNewHideoutExit (427): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Shrines ---
	case evNewShrine:
		log.Infof("[PHOTON-DBG] evNewShrine (402): %s", formatParamsForLog(params))
		return nil, nil
	case evUpdateShrine:
		log.Infof("[PHOTON-DBG] evUpdateShrine (403): %s", formatParamsForLog(params))
		return nil, nil
	case evNewHellgateShrine:
		log.Infof("[PHOTON-DBG] evNewHellgateShrine (406): %s", formatParamsForLog(params))
		return nil, nil
	case evNewCorruptedShrine:
		log.Infof("[PHOTON-DBG] evNewCorruptedShrine (464): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Room/dungeon progression ---
	case evUpdateRoom:
		log.Infof("[PHOTON-DBG] evUpdateRoom (404): %s", formatParamsForLog(params))
		return nil, nil
	case evRandomDungeonPositionInfo:
		log.Infof("[PHOTON-DBG] evRandomDungeonPositionInfo (397): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Characters entering/leaving ---
	case evNewCharacter:
		log.Debugf("[PHOTON-DBG] evNewCharacter (28): %s", formatParamsForLog(params))
		return nil, nil
	case evLeave:
		log.Debugf("[PHOTON-DBG] evLeave (1): %s", formatParamsForLog(params))
		return nil, nil

	// --- Debug: Outlands teleportation portals ---
	case evNewOutlandsTeleportationPortal:
		log.Infof("[PHOTON-DBG] evNewOutlandsTeleportationPortal (609): %s", formatParamsForLog(params))
		return nil, nil
	case evNewOutlandsTeleportationReturnPortal:
		log.Infof("[PHOTON-DBG] evNewOutlandsTeleportationReturnPortal (610): %s", formatParamsForLog(params))
		return nil, nil

	default:
		// Log ALL unhandled events to discover unknown event types (like portal data).
		// Filter out the very noisy ones (movement, combat, health, energy, etc.)
		et := EventType(eventType)
		switch et {
		case evMove, evTeleport, evHealthUpdate, evHealthUpdates,
			evEnergyUpdate, evDamageShieldUpdate, evCraftingFocusUpdate,
			evActiveSpellEffectsUpdate, evResetCooldowns,
			evAttack, evCastStart, evChannelingUpdate, evCastCancel,
			evCastTimeUpdate, evCastFinished, evCastSpell, evCastSpells,
			evCastHit, evCastHits, evStoredTargetsUpdate, evChannelingEnded,
			evRegenerationHealthChanged, evRegenerationEnergyChanged,
			evRegenerationMountHealthChanged, evRegenerationCraftingChanged,
			evRegenerationHealthEnergyComboChanged, evRegenerationPlayerComboChanged,
			evDurabilityChanged, evInCombatStateUpdate, evForcedMovement,
			evForcedMovementCancel, evSpellCooldownUpdate,
			evChangeEquipment, evCharacterEquipmentChanged,
			evNewEquipmentItem, evNewSimpleItem, evNewFurnitureItem,
			evInventoryPutItem, evInventoryDeleteItem, evInventoryState,
			evAttachItemContainer, evDetachItemContainer, evLockItemContainer,
			evNewLoot, evOtherGrabbedLoot, evEstimatedMarketValueUpdate,
			evOverChargeEnd, evOverChargeStatus,
			evTimeSync, evKeySync, evKeyValidation,
			// Noisy spell/combat/UI events
			evNewSpellEffectArea, evUpdateSpellEffectArea,
			evNewChainSpell, evUpdateChainSpell,
			// Noisy zone-join one-time dumps (achievements, quests, cosmetics, mail, chat)
			evFullAchievementInfo, evFullAchievementProgressInfo,
			evFullAutoLearnAchievementInfo, evFullTrackedAchievementInfo,
			evFinishedAchievement, evAchievementProgressInfo,
			evFullQuestInfo, evQuestProgressInfo,
			evFullExpeditionInfo, evExpeditionQuestProgressInfo,
			evUpdateUnlockedAvatars, evUpdateUnlockedAvatarRings,
			evUpdateUnlockedBuildings, evUpdateUnlockedGuildLogos,
			evNewUnreadMails, evUpdateChatSettings,
			evFeatureSwitchInfo, evJoinFinished,
			evMounted, evMountStart, evMountCancel, evMountCooldownUpdate, evMountHealthUpdate,
			evPlayerMovementRateUpdate,
			evJournalAchievementProgressUpdate, evFullJournalQuestInfo, evJournalQuestProgressInfo,
			evPartyPlayerUpdated, evPartyChangedOrder, evPartyLootSettingChangedPlayer,
			evGuildUpdate, evGuildPlayerUpdated, evGuildMemberWorldUpdate,
			evNewHuntTrack, evHuntTrackUsed, evHuntTrackUseableAgain,
			evMinimapHuntTrackMarkers, evHuntMissionUpdate,
			evUpdateMoney, evUpdateFame, evExitUsed:
			// Too noisy, skip silently
		default:
			log.Infof("[PHOTON-UNHANDLED] event=%d (%s): %s", eventType, et.String(), formatParamsForLog(params))
		}
		return nil, nil
	}

	err = decodeParams(params, event)

	return event, err
}

// formatParamsForLog formats Photon params map for readable logging.
func formatParamsForLog(params map[uint8]interface{}) string {
	result := "{"
	first := true
	for k, v := range params {
		if !first {
			result += ", "
		}
		result += fmt.Sprintf("%d:%v", k, v)
		first = false
	}
	result += "}"
	return result
}

func decodeParams(params map[uint8]interface{}, operation operation) error {
	convertGameObjects := func(from reflect.Type, to reflect.Type, v interface{}) (interface{}, error) {
		if from == reflect.TypeOf([]int8{}) && to == reflect.TypeOf(lib.CharacterID("")) {
			log.Debug("Parsing character ID from mixed-endian UUID")

			return decodeCharacterID(v.([]int8)), nil
		}

		return v, nil
	}

	config := mapstructure.DecoderConfig{
		DecodeHook: convertGameObjects,
		Result:     operation,
	}

	decoder, err := mapstructure.NewDecoder(&config)
	if err != nil {
		return err
	}

	// Decided that the maps were easier to work with in most places with uint8 keys
	// Therefore we have to convert to a string map in order for the decode to work here
	// Should be negligible performance loss
	stringMap := make(map[string]interface{})
	for k, v := range params {
		stringMap[strconv.Itoa(int(k))] = v
	}

	err = decoder.Decode(stringMap)

	return err
}

func decodeCharacterID(array []int8) lib.CharacterID {
	/* So this is a UUID, which is stored in a 'mixed-endian' format.
	The first three components are stored in little-endian, the rest in big-endian.
	See https://en.wikipedia.org/wiki/Universally_unique_identifier#Encoding.
	By default, our int array is read as big-endian, so we need to swap the first
	three components of the UUID
	*/
	b := make([]byte, len(array))

	// First, convert to byte
	for k, v := range array {
		b[k] = byte(v)
	}

	// swap first component
	b[0], b[1], b[2], b[3] = b[3], b[2], b[1], b[0]

	// swap second component
	b[4], b[5] = b[5], b[4]

	// swap third component
	b[6], b[7] = b[7], b[6]

	// format it UUID-style
	var buf [36]byte
	hex.Encode(buf[:], b[:4])
	buf[8] = '-'
	hex.Encode(buf[9:13], b[4:6])
	buf[13] = '-'
	hex.Encode(buf[14:18], b[6:8])
	buf[18] = '-'
	hex.Encode(buf[19:23], b[8:10])
	buf[23] = '-'
	hex.Encode(buf[24:], b[10:])

	return lib.CharacterID(buf[:])
}
