export interface QuestionnaireResponse {
  id?: string;
  userId: string;
  responses: {
    basicInfo: {
      presentationType: string;
      audienceSize: string;
    };
    presentationDetails: {
      duration: string;
      visualAids: string[];
    };
    goals: {
      primaryGoal: string;
      concerns: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionnaireState {
  basicInfo: {
    presentationType: string;
    audienceSize: string;
  };
  presentationDetails: {
    duration: string;
    visualAids: string[];
  };
  goals: {
    primaryGoal: string;
    concerns: string;
  };
}