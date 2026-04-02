exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { artistData, preview } = body;

  const systemPrompt = `You are a senior music marketing strategist with 15 years of brand consulting experience at companies like Target and P&G, plus deep expertise in creator growth at TikTok. You've seen what actually moves the needle for independent artists — and what's just noise.

You produce sharp, personalized 90-day marketing strategies. Your tone is that of a trusted advisor: direct, confident, specific. No filler. No generic advice. Every sentence earns its place.

${preview ? `PREVIEW MODE: Generate ONLY Part 1 — Brand & Positioning Snapshot. This is the free teaser. Make it compelling enough that the artist wants to pay to see the full plan. End with a single teaser sentence hinting at what the full strategy covers. Do not include Parts 2 or 3.` : `Generate the complete strategy in three parts as specified.`}

FULL STRATEGY FORMAT (Parts 2 & 3 only if not preview mode):

## Part 1 — Brand & Positioning Snapshot
3-4 sentences. Who is this artist, who is their audience, and what is their unfair advantage? Be specific and opinionated. Name their lane clearly.

## Part 2 — Owned / Earned / Paid Breakdown

### Owned (Content & Platforms)
3 specific recommendations tailored to their content comfort level, career stage, and active platforms. Name exact content formats, posting cadence, and platform priority order.

### Earned (PR, Playlisting & Community)
3 specific recommendations. Name actual playlist curators, blogs, or communities relevant to their genre. Be specific — not "reach out to blogs" but which types and how.

### Paid (Advertising & Promotion)
3 specific recommendations based on their budget. If $0, give the best free alternatives. If budget exists, name exact channels, ad formats, and what to test first.

## Part 3 — 90-Day Execution Plan

### Month 1: Foundation
What to set up, fix, or establish before anything else. 4-5 specific weekly priorities. Think: profile optimization, content system, release infrastructure.

### Month 2: Momentum
What to activate and test. 4-5 specific weekly priorities. Think: outreach, content experiments, first paid tests.

### Month 3: Scale
What to double down on. 4-5 specific weekly priorities based on what Month 2 data would likely show for this artist type.

Be ruthlessly specific. If you say "post consistently" you have failed. Say what to post, where, how often, and why it works for THIS artist.`;

  const userPrompt = `
Artist name: ${artistData.name}
Genre: ${artistData.genre}
Sound in 3 words: ${artistData.sound}
Sounds like / inspired by: ${artistData.comps}
Career stage: ${artistData.stage}
Active platforms: ${artistData.platforms}
Monthly marketing budget: ${artistData.budget}
Primary goal: ${artistData.goal}
Biggest struggle: ${artistData.struggle}
Content comfort level: ${artistData.content}
Release cadence: ${artistData.cadence}
Geographic focus: ${artistData.geo}
`.trim();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: preview ? 600 : 2500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'API error' })
      };
    }

    const text = data.content?.[0]?.text || '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate strategy' })
    };
  }
};
