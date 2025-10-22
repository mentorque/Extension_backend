// src/controllers/uploadResume.js
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { resumeParser } = require('../utils/prompts.json');
const { gemini_flash } = require('../utils/llms.json');

const SYSTEM_PROMPT = resumeParser;
const EXPERIENCE_SCHEMA = fs.readFileSync(path.join(__dirname, '../schemas/experience.md'), 'utf8');
const RESUME_SCHEMA = fs.readFileSync(path.join(__dirname, '../schemas/resume.md'), 'utf8');

function extractJSONFromString(input) {
  const jsonMatch = input.match(/```json\s*([\s\S]*?)\s*```/);

  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (err) {
      throw new Error("Found a JSON block, but it contained invalid JSON.");
    }
  }

  try {
    return JSON.parse(input);
  } catch (err) {
    throw new Error("Could not find a valid JSON object in the model's response.");
  }
}

const uploadResume = async (req, res, next) => {
  const startedAt = Date.now();
  try {
    console.log('[uploadResume] Incoming request', {
      hasFile: !!req.file,
      contentType: req.headers['content-type'],
      bodyKeys: Object.keys(req.body || {}),
    });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[uploadResume] Missing GEMINI_API_KEY');
      return res.status(500).json({ error: 'Server configuration error: API key is missing.' });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: gemini_flash });

    let resumeText = '';

    if (typeof req.body?.resumeText === 'string') {
      resumeText = req.body.resumeText;
      console.log('[uploadResume] Using resumeText from JSON body, length:', resumeText.length);
    } else {
      console.warn('[uploadResume] No resumeText provided');
      return res.status(400).json({ error: 'No resume provided. Please provide resumeText.' });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      console.warn('[uploadResume] Empty resume text after extraction');
      return res.status(400).json({ error: 'Empty resume text' });
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n Candidate resume: ${resumeText}\n Experience Schema: ${EXPERIENCE_SCHEMA} and arrange all information in this format Resume Schema: ${RESUME_SCHEMA}`;
    console.log('[uploadResume] Prompt length:', fullPrompt.length);

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();
    console.log('[uploadResume] Model response length:', text?.length || 0);

    const extractedResult = extractJSONFromString(text);
    console.log('[uploadResume] Parsed result keys:', Object.keys(extractedResult || {}));

    res.json({ result: extractedResult });

  } catch (error) {
    console.error('[uploadResume] Unhandled error:', error?.message, error);
    next(error);
  } finally {
    console.log('[uploadResume] Completed in ms:', Date.now() - startedAt);
  }
};

module.exports = { uploadResume };