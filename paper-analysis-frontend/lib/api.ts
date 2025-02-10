import axios from "axios";
import { PaperAnalysisResponse } from "@/types/paper";

const API_BASE_URL = "http://localhost:4000"; // Update this with your actual API URL

export const analyzePapers = async (): // query: string
Promise<PaperAnalysisResponse> => {
  try {
    const response = await axios.get<PaperAnalysisResponse>(
      `${API_BASE_URL}/api/papers/analyze-features`,
      {
        // params: { query },
      }
    );
    console.log(response);
    return response.data;
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Failed to analyze papers"
      );
    }
    throw error;
  }
};
