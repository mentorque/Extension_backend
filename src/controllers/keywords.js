// src/controllers/keywords.js
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { keywordExtraction } = require('../utils/prompts.json');
const { gemini_flash } = require('../utils/llms.json');

const SKILLS_SCHEMA = fs.readFileSync(path.join(__dirname, '../schemas/keywords.md'), 'utf8');
const SYSTEM_PROMPT = keywordExtraction;

function extractJSONFromString(input) {
  // Try to find JSON in code blocks first
  const jsonMatch = input.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (err) {
      throw new Error("Found a JSON block, but it contained invalid JSON.");
    }
  }

  // Try to parse the entire response as JSON
  try {
    return JSON.parse(input);
  } catch (err) {
    // Try to extract JSON from anywhere in the response
    const jsonObjectMatch = input.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch (err2) {
        // Final fallback failed
      }
    }
    
    throw new Error("Could not find a valid JSON object in the model's response.");
  }
}

const generateKeywords = async (req, res, next) => {
  try {
    console.log(req.body);
    const { jobDescription, skills } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: gemini_flash });

    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: API key is missing.' });
    }

    if (!jobDescription || !skills) {
      return res.status(400).json({ error: 'Missing or invalid jobDescription or skills' });
    }

    const skillsString = JSON.stringify(skills);
    const fullPrompt = `${SYSTEM_PROMPT}\n Job Description:\n${jobDescription}\n\nCurrent Skills:\n${skillsString}\n\nResponse Format:${SKILLS_SCHEMA}`;

    const aiResult = await model.generateContent(fullPrompt);
    const response = aiResult.response;
    const text = response.text();

    const extractedResult = extractJSONFromString(text);

    res.json({ result: extractedResult });

  } catch (error) {
    next(error);
  }
};

module.exports = { generateKeywords };