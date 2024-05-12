interface LocalizedNames {
  "EN-US": string;
  "DE-DE": string;
  "FR-FR": string;
  "RU-RU": string;
  "PL-PL": string;
  "ES-ES": string;
  "PT-BR": string;
  "IT-IT": string;
  "ZH-CN": string;
  "KO-KR": string;
  "JA-JP": string;
}

interface LocalizedDescriptions {
  "EN-US": string;
  "DE-DE": string;
  "FR-FR": string;
  "RU-RU": string;
  "PL-PL": string;
  "ES-ES": string;
  "PT-BR": string;
  "IT-IT": string;
  "ZH-CN": string;
  "KO-KR": string;
  "JA-JP": string;
}

export interface ItemX {
  LocalizationNameVariable: string;
  LocalizationDescriptionVariable: string;
  LocalizedNames: LocalizedNames;
  LocalizedDescriptions: LocalizedDescriptions;
  Index: string;
  UniqueName: string;
}

export interface SimplifiedItem {
  UniqueName: string;
  LocalizedNames?: {
    "EN-US": string;
    "IT-IT"?: string;
  };
}

export interface World {
  Index: string;
  UniqueName: string;
}
