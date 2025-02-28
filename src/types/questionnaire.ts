export interface QuestionnaireResponse {
  id?: string;
  userId: string;
  responses: {
    basicInfo: {
      presentationType: string;
      audienceSize: string;
    };
    businessInfo: {
      businessName: string;
      businessYears: string;
      industry: string;
      targetAudience: string;
      learningInterests: string;
      foundUs: string;
    };
    contactInfo: {
      contactDetails: string;
      certifications: string;
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
  businessInfo: {
    businessName: string;
    businessYears: string;
    industry: string;
    targetAudience: string;
    learningInterests: string;
    foundUs: string;
  };
  contactInfo: {
    contactDetails: string;
    certifications: string;
  };
}