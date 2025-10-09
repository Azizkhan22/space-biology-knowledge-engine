import { HfInference } from '@huggingface/inference';

const MODEL = "mistralai/Mistral-7B-Instruct-v0.2"; 

const hf = new HfInference('');

export async function askAI(context, question) {
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

    console.log("=== AI Request Details ===");
    console.log("Model:", MODEL);
    console.log("Prompt:", prompt.substring(0, 200) + "...");
    console.log("=========================");

    let response;
    
    if (MODEL.includes('mistral') || MODEL.includes('dialo')) {
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
    
    let output;
    
    if (MODEL.includes('mistral') || MODEL.includes('dialo')) {
      output = response.choices?.[0]?.message?.content;
    } else {      
      output = response.generated_text;
    }
    
    const cleanedOutput = output?.replace(prompt, "").trim();
    
    return cleanedOutput || "Unable to generate a response from the AI model.";
    
  } catch (err) {    
    console.error("=== AI Request Error Details ===");
    console.error("Error Message:", err.message);
    console.error("Error Name:", err.name);
    console.error("Full Error Object:", err);
    console.error("================================");
        
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
