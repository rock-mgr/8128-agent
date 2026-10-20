const { ai, MODEL } = require("./gemini");

/**
 * EXERCISE: Array Operations Agent
 * 
 * Goal: Build an agent that can perform statistical operations on arrays
 * using the same pattern from 03-simple-agents.js
 * 
 * The agent has access to ONLY these basic operations:
 * 
 * Array operations:
 * - sum(array): Returns the sum of all numbers
 * - count(array): Returns the count of elements
 * - average(array): Returns the mean/average
 * - findMin(array): Returns the minimum value
 * - findMax(array): Returns the maximum value
 * - getElement(array, index): Returns the element at the specified index
 * - sort(array): Returns a sorted copy of the array
 * - sumOfSquares(array): Returns the sum of squared values
 * 
 * Math operations:
 * - add(a, b): Returns a + b
 * - subtract(a, b): Returns a - b
 * - multiply(a, b): Returns a * b
 * - divide(a, b): Returns a / b
 * - power(a, b): Returns a^b
 * - sqrt(a): Returns square root of a
 * 
 * Advanced statistics the LLM should be able to derive:
 * - Range: max - min
 * - Variance: (sumOfSquares / count) - (average^2)
 * - Standard Deviation: sqrt(variance)
 * - Median: middle value of sorted array
 * - Quartiles: Q1 (25th percentile), Q2 (median), Q3 (75th percentile)
 * - Interquartile Range (IQR): Q3 - Q1
 * - Coefficient of Variation: (stdDev / average) * 100
 */

// Array operation functions
const sum = (arr) => arr.reduce((acc, val) => acc + val, 0);
const count = (arr) => arr.length;
const average = (arr) => arr.length > 0 ? sum(arr) / count(arr) : 0;
const findMin = (arr) => arr.length > 0 ? Math.min(...arr) : null;
const findMax = (arr) => arr.length > 0 ? Math.max(...arr) : null;
const getElement = (arr, index) => arr[index];
const sort = (arr) => [...arr].sort((a, b) => a - b);
const sumOfSquares = (arr) => arr.reduce((acc, val) => acc + val * val, 0);

// Math operation functions
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => b !== 0 ? a / b : null;
const power = (a, b) => Math.pow(a, b);
const sqrt = (a) => a >= 0 ? Math.sqrt(a) : null;

// Sample data
const testData = [23, 45, 12, 67, 34, 89, 15, 56, 78, 90];

// TODO: Write the agent prompt
// Your prompt should instruct the model to:
// 1. Return an array of responses with "type" field (thought/action/result)
// 2. Explain the response format for each type:
//    - thought: has "content" field with reasoning
//    - action: has "function" and "parameters" fields
//    - result: has "content" field with final answer
// 3. Describe the Thought -> Action -> Observation cycle
// 4. List all available actions with their parameters:
//    Array: sum, count, average, findMin, findMax, getElement, sort, sumOfSquares
//    Math: add, subtract, multiply, divide, power, sqrt
// 5. IMPORTANT: Instruct the model to ALWAYS use the provided tools for calculations,
//    never do math in its head
// 6. Provide an example session showing the complete cycle
//
// Hint: Look at 03-simple-agents.js lines 9-44 for reference
const arrayAgentPrompt = `
You are an Array Operations Agent.

Your job is to help users perform calculations
using the available JavaScript functions.

You must use the provided functions for calculations.
Do not calculate the answers yourself.

Available functions:

Array operations:
- sum(array): Returns the sum of all numbers.
- count(array): Returns the number of elements.
- average(array): Returns the average.
- findMin(array): Returns the minimum value
- findMax(array): Returns the maximum value
- getElement(array, index): Returns the element at the specified index
- sort(array): Returns a sorted copy of the array
- sumOfSquares(array): Returns the sum of squared values

Math operations:
 - add(a, b): Returns a + b
 - subtract(a, b): Returns a - b
 - multiply(a, b): Returns a * b
 - divide(a, b): Returns a / b
 - power(a, b): Returns a^b
 - sqrt(a): Returns square root of a

You must return a JSON array of objects.

Each object must have a "type" field:
- "thought": Include a "content" field describing the next step.
- "action": Include a "function" field with the function name
  and a "parameters" field containing an array of arguments.
- "result": Include a "content" field with the final answer.

Follow the Thought -> Action -> Observation cycle.

1. Thought: Decide which function is needed.
2. Action: Request the function with its parameters.
3. Observation: Receive the result returned by JavaScript.
4. Repeat if more calculations are needed.
5. Return a final "result" when the task is complete.

Example session:

User: Calculate the average of [10, 20, 30].

Your response:
[
  {
    "type": "action",
    "function": "average",
    "parameters": [[10, 20, 30]]
  }
]

After receiving Observation: 20

Your response:
[
  {
    "type": "result",
    "content": "The average is 20."
  }
]

`;

const createMessage = (role, content) => ({
    role,
    parts: [{ text: content }]
});

async function main() {
    console.log("Test Data:", testData);
    console.log("\n");

    // Test queries - uncomment to test different scenarios
    await startAgent(`What is the sum and average of the array ${JSON.stringify(testData)}?`);
    // await startAgent(`Calculate the variance of ${JSON.stringify(testData)}`);
    // await startAgent(`Calculate the standard deviation of ${JSON.stringify(testData)}`);
    // await startAgent(`Find the median of ${JSON.stringify(testData)}`);
    // await startAgent(`Calculate the interquartile range (IQR) of ${JSON.stringify(testData)}`);
    // await startAgent(`Give me complete statistics (count, sum, average, min, max, range, variance, std dev, median) for ${JSON.stringify(testData)}`);
}

async function startAgent(query) {
    console.log("Query:", query);
    const messages = [createMessage("user", query)];

    const response = await agentLoop(messages);
    console.log("\n[Final Answer]:", response);
    console.log("\n" + "=".repeat(80) + "\n");
}

// TODO: Implement the agentLoop function
// Follow the pattern from 03-simple-agents.js
async function agentLoop(messages, maxIterations = 20) {
    let iterations = 0;

    while (iterations < maxIterations) {
        iterations++;
        console.log(`\n--- Iteration ${iterations} ---`);

        // TODO: Call the AI model with the messages
        // Use responseMimeType: "application/json" and define the responseSchema
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: messages,
            config: {
                systemInstruction: arrayAgentPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    // TODO: Define the schema for the response array
                    // Hint: Look at 03-simple-agents.js lines 94-112

                    type: "array",
                    items: {

                        type: "object",
                        properties: {
                            type: {
                                type: "string",
                                enum: ["thought", "action", "result"]
                            },
                            content: {
                                type: "string"
                            },
                            function: {
                                type: "string"
                            },
                            parameters: {
                                type: "array",
                                items: {}
                            }
                        },
                        required: ["type"]

                    }
                }
            }
        });

        const responses = JSON.parse(response.text);
        console.log(JSON.stringify(responses, null, 2));

        // TODO: Check if we have a final result
        // If yes, return the result content
        const result = responses.find(r => r.type === "result");

        if (result) {
            return result.content;
        }

        // TODO: Execute any actions

        const action = responses.find(r => r.type === "action");

        if (action) {
            console.log("Action requested:", action.function);


            let observation = null;
            const funcName = action.function;
            const params = action.parameters;

            if (funcName === "sum") {
                observation = sum(params[0]);
            } else if (funcName === "count") {
                observation = count(params[0]);
            } else if (funcName === "average") {
                observation = average(params[0]);
            } else if (funcName === "findMin") {
                observation = findMin(params[0]);
            } else if (funcName === "findMax") {
                observation = findMax(params[0]);
            } else if(funcName === "getElement"){
                observation = getElement(params[0], params[1]);
            }


        }
        // Find the action in responses
        // Call the appropriate function:
        //   Array: sum, count, average, findMin, findMax, getElement, sort, sumOfSquares
        //   Math: add, subtract, multiply, divide, power, sqrt
        // Add the observation to messages
        // Continue the loop
    }

    return "Max iterations reached without a final result.";
}

main();