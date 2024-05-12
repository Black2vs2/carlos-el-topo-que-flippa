import { SimplifiedItem, World } from "../@types/builder.types";

import parsed_items from "../generated/parsed_items.json";
import parsed_worlds from "../generated/parsed_worlds.json";
const parsedItems = parsed_items as SimplifiedItem[];
const parsedWorlds = parsed_worlds as World[];

export const singularOrPluralNaming = (count: number, word: string) => `${word}${count === 1 ? "" : "s"}`;

export const getNameByLocationId = (locationId: number): string =>
  parsedWorlds.find((pW) => Number(pW.Index) === locationId)?.UniqueName || "";
