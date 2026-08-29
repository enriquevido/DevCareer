import type { IsoDateString } from "./common";

export type ResumeVersion = {
  id: string;
  originalName: string;
  sha256: string;
  createdAt: IsoDateString;
};
