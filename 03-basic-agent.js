const {ai, MODEL} = require('./gemini');
const {getCurrentLocation,getCurrentWeather} = require('./tools');

// const schema = {
//     type:"array",
//     items: {
//         type:"object",
//         properties: {
//             "type": {
//                 "type":"string",
//                 "enum":["thought","action","result"]
//             },
//             "content":{type:"string"},
//             "function":{type: "string"},
//             "parameters": {
//                 "type":"array",
//                 "item":{"type":"string"}
//             }
//         }
//     }
// }
const schema = {
			type: "array",
      items: {
          type: "object",
          properties: {
              type: {
                  type: "string",
                  enum: ["thought", "action", "result"]
              },
              content: { type: "string" },
              function: { type: "string" },
              parameters: {
                  type: "array",
                  items: { type: "string" }
              }
          },
          required: ["type"]
      }
  }


async function main() {

    const reactAgentPrompt = `
        You must return an array of resposnes. Each response has a type field: 'thought', 'action', 'result'
        - if type is "thought": include a 'content' field with your thinking as a string
        - if type is "action": include a 'function' field with the function name and parameters to call
        - if type is "result": include a 'content' field wiht the final answer as a string
    
        you can cycle through thought, action and observation. At the end of the loop you will output a final result.

        Available actions:
        - getCurrentWeather
            Returns the current weather and PSI rating of the location specified
            Parameters: [location]
        - getCurrentLocation:
            Returns the user's location details. No arguments needed
            Parameters: []

        You must return a JSON array of objects
    `

    const response = await ai.models.generateContent({
        model:MODEL,
        config:{
            responseMimeType:"application/json",
            responseSchema: schema
        },
        contents:`${reactAgentPrompt} Query:Give me a list of activity ideas based on my current location.`
    })

    console.log(response.text);
}

main();