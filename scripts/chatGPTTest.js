import OpenAI from "openai";

async function main () {
  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY })
  
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: "Write a one-sentence bedtime story about a unicorn.",
  })
  
  console.log("result: ", response)
}

main().then(() => console.log('done'));
