export interface ScriptGeneratorState {
  coreProblem: string;
  idealCustomer: string;
  businessInspiration: string;
  uniqueValue: string;
  keyMessage: string;
  customerJourney: string;
  callToAction: string;
}

export interface GeneratedScript {
  id: string;
  content: string;
  createdAt: string;
  title?: string;
}

export interface ScriptHistoryState {
  scripts: GeneratedScript[];
}