export interface Image {
  b64_json?: string;
  url?: string;
}

export interface ImagesResponse {
  created: number;
  data: Array<Image>;
}

export type CustomMadeImageResponce = {
  created: number;
  data: { url: string }[] | undefined;
} | null;

export type CharacterType = "wizard" | "warrior" | "archer" | string;
