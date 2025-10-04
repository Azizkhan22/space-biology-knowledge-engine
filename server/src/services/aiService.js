const { HfInference } = require('@huggingface/inference');

// Set your Hugging Face model here
const MODEL = "mistralai/Mistral-7B-Instruct-v0.2"; 

// Initialize Hugging Face Inference client
const hf = new HfInference(process.env.HUGGINGFACE_API_TOKEN || '');

class AIService {
  static async askAI(context, question) {
    try {
      const prompt = `
Context:
${context}

User Question:
${question}

Instruction:
Answer only from the context above. 
If the answer is not in the context, reply: 
"The article does not provide this information."
      `;

      // Log the request details for debugging
      console.log("=== AI Request Details ===");
      console.log("Model:", MODEL);
      console.log("Prompt:", prompt.substring(0, 200) + "...");
      console.log("=========================");

      // Use Hugging Face Inference SDK
      let response;
      
      if (MODEL.includes('mistral') || MODEL.includes('dialo')) {
        // Use chat completion for dialogue models
        response = await hf.chatCompletion({
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        });
      } else {
        // Use text generation for other models
        response = await hf.textGeneration({
          model: MODEL,
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.7,
            return_full_text: false,
            do_sample: true
          }
        });
      }

      console.log("=== AI Response ===");
      console.log("Response Data:", response);
      console.log("==================");

      // Extract generated text from the SDK response
      let output;
      
      if (MODEL.includes('mistral') || MODEL.includes('dialo')) {
        // Chat completion API response format
        output = response.choices?.[0]?.message?.content;
      } else {
        // Text generation API response format
        output = response.generated_text;
      }

      // Clean up the output by removing the original prompt
      const cleanedOutput = output?.replace(prompt, "").trim();
      
      // Return cleaned output or fallback message
      return cleanedOutput || "Unable to generate a response from the AI model.";
      
    } catch (err) {
      // Log detailed error information for debugging
      console.error("=== AI Request Error Details ===");
      console.error("Error Message:", err.message);
      console.error("Error Name:", err.name);
      console.error("Full Error Object:", err);
      console.error("================================");
      
      // Handle SDK-specific errors
      if (err.message?.includes('401')) {
        return "Authentication error: Please check your API token.";
      } else if (err.message?.includes('429')) {
        return "Rate limit exceeded: Please wait before making another request.";
      } else if (err.message?.includes('503')) {
        return "Model is currently loading. Please wait a moment and try again.";
      } else if (err.message?.includes('404')) {
        return "Model not found. Please check the model name.";
      } else if (err.message?.includes('timeout')) {
        return "Request timeout: The AI model took too long to respond.";
      }
      
      return `Something went wrong with the AI request: ${err.message}`;
    }
  }

  static async generateSummary(articleData) {
    try {
      const context = `
Title: ${articleData.Title}
Authors: ${articleData.Authors?.join(', ') || 'Unknown'}
Published Date: ${articleData.PublishedDate || 'Unknown'}
Abstract: ${articleData.Abstract || 'No abstract available'}
Results and Discussion: ${articleData['Results and Discussion'] || 'No results available'}
Conclusions: ${articleData.Conclusions || 'No conclusions available'}
      `;

      const question = "Please provide a comprehensive summary of this research paper, highlighting the main findings, methodology, and implications for space research.";

      const summary = await this.askAI(context, question);
      return summary;
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate AI summary');
    }
  }

  static async askQuestion(articleData, question) {
    try {
      const context = `
Title: ${articleData.Title}
Authors: ${articleData.Authors?.join(', ') || 'Unknown'}
Published Date: ${articleData.PublishedDate || 'Unknown'}
Abstract: ${articleData.Abstract || 'No abstract available'}
Results and Discussion: ${articleData['Results and Discussion'] || 'No results available'}
Conclusions: ${articleData.Conclusions || 'No conclusions available'}
AI Summary: ${articleData.aiSummary || 'No summary available'}
      `;

      const answer = await this.askAI(context, question);
      return answer;
    } catch (error) {
      console.error('Error asking AI question:', error);
      throw new Error('Failed to process AI question');
    }
  }
}

module.exports = AIService;


