import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { securityData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating AI recommendations for security data');

    const systemPrompt = `You are a cybersecurity advisor for African SMEs. Analyze the security posture data and provide actionable, prioritized recommendations.

Focus on:
- POPIA compliance requirements for South African businesses
- Practical, cost-effective solutions suitable for SMEs
- Clear impact assessment (high/medium/low)
- Realistic effort estimates (low/medium/high)
- Vendor risk management
- Internal security hygiene

Provide recommendations in order of priority based on the formula: Priority = (Impact × 3) / Effort`;

    const userPrompt = `Analyze this security data and provide 5-8 prioritized recommendations:

Total Risk Score: ${securityData.totalRiskScore}/100
Internal Posture Score: ${securityData.internalPostureScore}/100
Vendor Risk Score: ${securityData.vendorRiskScore}/100

Security Pillars:
${securityData.pillars.map((p: any) => `- ${p.title}: ${p.score}/100 (${p.issues} issues)`).join('\n')}

Current Priority Actions:
${securityData.currentActions.map((a: any) => `- ${a.title}: ${a.description}`).join('\n')}

Provide recommendations as a JSON array with this structure:
[{
  "title": "Action title",
  "description": "Detailed description",
  "impact": "high|medium|low",
  "effort": "low|medium|high",
  "reasoning": "Why this is important for this SME"
}]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

    console.log('Successfully generated recommendations');

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
