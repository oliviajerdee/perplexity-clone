// FILE: pages/api/search.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getJson } from "serpapi";
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { query } = req.body;

    try {
      const json: any = await new Promise((resolve, reject) => {
        getJson({
          engine: "google",
          q: query,
          api_key: process.env.SERP_API_KEY
        }, (data: any) => {
          if (data.error) {
            reject(data.error);
          } else {
            resolve(data);
          }
        });
      });

      const results = json["organic_results"].map((result: any, index: number) => ({
        number: index + 1,
        title: result.title,
        link: result.link,
        snippet: result.snippet
      }));

      
      const completion = await openai.chat.completions.create({
        model: "gemini-1.5-flash",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: `Answer the following question: ${query} using these sources and when using information from a source in an answer cite the source using it's corresponding number in this format [x]: ${results.map((result: any) => result.title).join(', ')}. Don't reference the fact that you are using sources just give the information. Be confident.` },
        ],
      });

      const summary = completion.choices[0].message.content;
      
      console.log(summary);
      res.status(200).json({ summary, results });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching search results.', error });
      console.log(error);
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}