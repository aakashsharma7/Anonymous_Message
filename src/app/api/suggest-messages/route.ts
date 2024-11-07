import OpenAi from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";


const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = "edge";

//set the runtime to edge for best performance
export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a string. Each question should be separated by '||'. These questions are for an anonymous social messaaging platform, like Qooh.me and should be suitable for a diverse audience. Avoid personal or sesitive topics, focusing instead o n universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?' ensure the questions are intriguting, foster curiosity, and contribution to a postive and welcoming conversational environment.";

    const { messages } = await req.json();

    //ask openai for a streaming chat completion given the prompt
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      max_tokens: 2000,
      stream: true,
      prompt,
    });

    //convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    //respond with the stream
    return new StreamingTextResponse(stream);
  } catch (error) {
    if (error instanceof OpenAi.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json(
        {
          name,
          status,
          headers,
          message,
        },
        { status }
      );
    } else {
      console.log("An unexpected occured ", error);
      throw error;
    }
  }
}
