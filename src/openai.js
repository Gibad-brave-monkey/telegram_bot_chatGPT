import { Configuration, OpenAIApi } from "openai";
import { createReadStream } from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const openaiToken = process.env.OPEN_AI_KEY;
class OpenAI {
  roles = {
    ASSISTANT: "assistant",
    USER: "user",
    SYSTEM: "system",
  };

  constructor(apiKey) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages) {
    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });
      return response.data.choices[0].message;
    } catch (error) {
      console.log("Error while gpt-chat", error.message);
    }
  }

  async transcription(filePath) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(filePath),
        "whisper-1"
      );
      return response.data.text;
    } catch (error) {
      console.log("Transcription while error", error.message);
    }
  }
}

export const openai = new OpenAI(openaiToken);
