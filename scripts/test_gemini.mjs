import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

console.log("API Key present:", !!apiKey);
if (apiKey) {
  console.log("API Key prefix:", apiKey.substring(0, 4) + "...");
}

async function test() {
  if (!apiKey) return;

  try {
    console.log("Listing models...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("Error listing models:", data.error);
    } else {
      console.log("Available models:");
      if (data.models) {
        data.models.forEach(m => {
          if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
            console.log(`- ${m.name} (${m.displayName})`);
          }
        });
      } else {
        console.log("No models found.");
      }
    }
  } catch (e) {
    console.error("Error fetching models:", e);
  }
}

test();
