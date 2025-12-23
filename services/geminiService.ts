
// AI command processing disabled. The application no longer uses Gemini.
// Keep a lightweight stub so imports do not break if referenced elsewhere.
import { AIActionResponse } from "../types";

export const processAICommand = async (_command: string): Promise<AIActionResponse> => {
  return {
    action: null,
    product: null,
    quantity_change: null,
    update_type: null,
    cost: null,
    ai_text: 'AI features are disabled in this deployment.'
  };
};
