import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { training_id, answers } = body;

    if (!training_id || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: "Invalid input: training_id and answers array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch training content server-side
    const { data: training, error: trainingError } = await adminClient
      .from("training_content")
      .select("quiz_data, passing_score, organization_id")
      .eq("id", training_id)
      .single();

    if (trainingError || !training) {
      return new Response(JSON.stringify({ error: "Training not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user belongs to the same org
    const { data: profile } = await adminClient
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.organization_id !== training.organization_id) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Calculate score server-side
    const quizData = training.quiz_data as Array<{ correctAnswer?: number }>;
    let correct = 0;
    const total = quizData.length || 1;

    for (let i = 0; i < quizData.length; i++) {
      if (quizData[i]?.correctAnswer !== undefined && answers[i] === quizData[i].correctAnswer) {
        correct++;
      }
    }

    const score = Math.round((correct / total) * 100);
    const passed = score >= (training.passing_score || 70);

    // Insert via service role
    const { data: completion, error: insertError } = await adminClient
      .from("training_completions")
      .insert({
        user_id: user.id,
        training_id,
        organization_id: training.organization_id,
        score,
        passed,
        answers,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: "Failed to save completion" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ score, passed, completion }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
