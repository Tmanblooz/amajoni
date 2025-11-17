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
    const { complianceData, securityData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating POPIA compliance report');

    const systemPrompt = `You are a POPIA (Protection of Personal Information Act) compliance expert for South African businesses. Generate comprehensive, professional compliance reports.

Your reports should:
- Reference specific POPIA sections and requirements
- Provide clear gap analysis
- Include actionable remediation steps
- Use professional business language suitable for board presentations
- Focus on African SME context and constraints
- Include risk ratings and priority assessments`;

    const userPrompt = `Generate a comprehensive POPIA compliance report based on this data:

Compliance Score: ${complianceData.score}%
Documents Status:
${complianceData.documents.map((d: any) => `- ${d.name}: ${d.status}${d.required ? ' (Required)' : ''}`).join('\n')}

Overall Security Posture:
- Total Risk Score: ${securityData.totalRiskScore}/100
- Internal Posture: ${securityData.internalPostureScore}/100
- Vendor Risk: ${securityData.vendorRiskScore}/100

Security Pillars:
${securityData.pillars.map((p: any) => `- ${p.title}: ${p.score}/100`).join('\n')}

Generate a detailed report covering:
1. Executive Summary
2. POPIA Compliance Status
3. Gap Analysis
4. Risk Assessment
5. Remediation Roadmap
6. Recommendations

Format as markdown for display.`;

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
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices[0].message.content;

    console.log('Successfully generated POPIA report');

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-popia-report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
