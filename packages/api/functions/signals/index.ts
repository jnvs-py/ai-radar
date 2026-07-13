import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignalInput {
  id: string;
  title: string;
  source: { name: string; url: string };
  evidence: string;
  impact: string;
  action: string;
  status: string;
  confidence?: number;
  trend?: string;
  categories?: string[];
}

interface PostBody {
  date: string;
  capturedAt: string;
  signals: SignalInput[];
}

const VALID_STATUSES = [
  "en_negociacion",
  "resuelto_parcialmente",
  "modelo_emergente",
  "claim_no_verificado",
  "pendiente_de_lanzamiento",
  "observacion",
];

const SIGNAL_ID_PATTERN = /^signal-\d{4}-\d{2}-\d{2}-\d{2}$/;

function validateBody(body: unknown): { valid: true; data: PostBody } | { valid: false; error: string } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Body must be a JSON object" };
  }

  const b = body as Record<string, unknown>;

  if (!b.date || typeof b.date !== "string") {
    return { valid: false, error: "Missing or invalid 'date' field" };
  }

  if (!b.capturedAt || typeof b.capturedAt !== "string") {
    return { valid: false, error: "Missing or invalid 'capturedAt' field" };
  }

  if (!Array.isArray(b.signals) || b.signals.length === 0) {
    return { valid: false, error: "'signals' must be a non-empty array" };
  }

  for (const signal of b.signals) {
    if (!signal.id || !SIGNAL_ID_PATTERN.test(signal.id)) {
      return { valid: false, error: `Invalid signal id: '${signal.id}'. Must match signal-YYYY-MM-DD-NN` };
    }
    if (!signal.title || typeof signal.title !== "string") {
      return { valid: false, error: "Each signal must have a 'title' string" };
    }
    if (!signal.source?.name || !signal.source?.url) {
      return { valid: false, error: "Each signal must have 'source.name' and 'source.url'" };
    }
    if (!signal.evidence || typeof signal.evidence !== "string") {
      return { valid: false, error: "Each signal must have an 'evidence' string" };
    }
    if (!signal.impact || typeof signal.impact !== "string") {
      return { valid: false, error: "Each signal must have an 'impact' string" };
    }
    if (!signal.action || typeof signal.action !== "string") {
      return { valid: false, error: "Each signal must have an 'action' string" };
    }
    if (!signal.status || !VALID_STATUSES.includes(signal.status)) {
      return { valid: false, error: `Invalid status: '${signal.status}'. Must be one of: ${VALID_STATUSES.join(", ")}` };
    }
  }

  return { valid: true, data: b as unknown as PostBody };
}

interface GetQuery {
  date?: string;
  status?: string;
  limit: number;
  name?: string;
}

function parseGetParams(url: URL): GetQuery {
  const date = url.searchParams.get("date") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const name = url.searchParams.get("name") ?? undefined;
  return { date, status, limit: Math.min(limit, 100), name };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    const params = parseGetParams(url);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabase
      .from("signals")
      .select("signal_id, title, source_name, source_url, evidence, impact, action, status, date, captured_at, confidence, trend, categories")
      .order("date", { ascending: false })
      .limit(params.limit);

    if (params.date) {
      query = query.eq("date", params.date);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    if (params.name) {
      query = query.ilike("title", `%${params.name}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database error", details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signals = (data ?? []).map((row) => ({
      id: row.signal_id,
      title: row.title,
      source: { name: row.source_name, url: row.source_url },
      evidence: row.evidence,
      impact: row.impact,
      action: row.action,
      status: row.status,
      date: row.date,
      capturedAt: row.captured_at,
      confidence: row.confidence,
      trend: row.trend,
      categories: row.categories,
    }));

    return new Response(
      JSON.stringify({
        signals,
        count: signals.length,
        date: params.date ?? null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const validation = validateBody(body);

    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { date, capturedAt, signals } = validation.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const rows = signals.map((s) => ({
      signal_id: s.id,
      date,
      title: s.title,
      source_name: s.source.name,
      source_url: s.source.url,
      evidence: s.evidence,
      impact: s.impact,
      action: s.action,
      status: s.status,
      captured_at: capturedAt,
      confidence: s.confidence ?? null,
      trend: s.trend ?? null,
      categories: s.categories ?? null,
    }));

    const { data, error } = await supabase
      .from("signals")
      .upsert(rows, { onConflict: "signal_id" })
      .select("id");

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: "Database error", details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        inserted: data?.length ?? 0,
        ids: data?.map((r: { id: string }) => r.id) ?? [],
        date,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
