import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OnboardingData {
  main_specialty: string[] | string | null;
  focus_procedures: string | null;
  real_differentiator: string | null;
  how_to_be_remembered: string | null;
  tone_of_voice: string[] | null;
  language_to_avoid: string | null;
  persona: string | null;
  ideal_patient: string | null;
  patient_pains: string | null;
  main_objection: string | null;
  decision_delay_reason: string | null;
  common_questions: string | null;
  priority_procedures: string | null;
  procedures_to_hide: string | null;
  current_ticket: string | null;
  target_ticket: string | null;
  main_bottleneck: string | null;
  has_authorized_cases: boolean | null;
  proof_types: string[] | null;
  technical_differentiators: string | null;
  achievements: string | null;
  connection_story: string | null;
  flagship_procedure: string | null;
  flagship_fear: string | null;
  myth_to_break: string | null;
  social_platforms: string[] | null;
}

interface GenerateScriptRequest {
  scriptId?: string;
  topic?: string;
  platform?: string;
  script_type?: "educational" | "promotional" | "storytelling" | "authority";
  duration?: "short" | "medium" | "long";
}

function buildSystemPrompt(onboarding: OnboardingData): string {
  const toneDescriptions: Record<string, string> = {
    premium: "sofisticado e exclusivo",
    friendly: "amigável e acolhedor",
    humorous: "bem-humorado e leve",
    technical: "técnico e preciso",
    direct: "direto e objetivo",
    welcoming: "caloroso e receptivo",
  };

  const personaDescriptions: Record<string, string> = {
    authority: "especialista reconhecido que demonstra domínio técnico",
    advisor: "conselheiro de confiança que orienta com empatia",
    serious_doctor: "profissional sério e confiável",
    storyteller: "contador de histórias que conecta através de narrativas",
  };

  const tones =
    onboarding.tone_of_voice
      ?.map((t) => toneDescriptions[t] || t)
      .join(", ") || "profissional";

  const persona = onboarding.persona
    ? personaDescriptions[onboarding.persona] || onboarding.persona
    : "profissional de saúde";

  return `
  PAPEL: Você é um roteirista especializado em vídeos curtos (Reels/TikTok) para dentistas no Brasil. Seu objetivo é criar conteúdo que gere engajamento, autoridade e conversões.

ESPECIFICAÇÕES TÉCNICAS
Duração: 50-60 segundos (entre 140-170 palavras obrigatoriamente)
Estrutura narrativa (nesta ordem):
1. GANCHO (2-3 segundos): Pergunta, dado surpreendente ou afirmação provocativa
2. PROBLEMA: Identifique a dor ou frustração do público
3. EXPLICAÇÃO: Simplifique o conceito (se usar termo técnico, traduza imediatamente)
4. SOLUÇÃO/DICAS: Conteúdo educativo, sem prescrição clínica individual
5. PROVA: Autoridade de forma impessoal
6. CTA: Convite claro para próximo passo

REGRAS DE LINGUAGEM
- Frases curtas e diretas (máximo 15 palavras por frase)
- Tom conversacional, como se falasse olhando para a câmera
- Use "(pausa)" para indicar respiros dramáticos
- Quebre linhas para facilitar a leitura e gravação

REGRAS DE CONTEÚDO
Autoridade/Prova - Use APENAS frases impessoais:
- "Na prática do consultório, vejo muito..."
- "No dia a dia com pacientes, é comum..."
- "Pela experiência clínica, geralmente..."

CTA Final - Use APENAS estas estruturas:
- "Me chama no direct que eu te explico os próximos passos."
- "Quer avaliar com segurança? Me chama no WhatsApp ou agende uma avaliação."
- "Manda uma mensagem pra gente conversar sobre o seu caso."

PROIBIÇÕES (não use em hipótese alguma)
- Nome do dentista ("Eu sou o Dr(a). Fulano")
- Orientação clínica individual ("Faça X em casa para tratar Y")
- CTAs com palavra-chave ("Comente DENTE", "Manda a palavra X")
- "Link na bio"
- Emojis no texto de fala
- Títulos, cabeçalhos ou marcadores dentro do texto de fala

FORMATO DE RESPOSTA
Responda APENAS com um objeto JSON válido, sem texto adicional antes ou depois. Use exatamente esta estrutura:
{
  "hook": "Frase de abertura isolada, sem aspas internas escapadas incorretamente",
  "full_script": "Texto corrido de fala pronto para gravar. Use \\n para quebras de linha e (pausa) onde necessário. Sem títulos internos. 140-170 palavras. Deve incluir o CTA final.",
  "description": "1-3 parágrafos curtos. Máximo 600 caracteres. Inclua reforço do tema + benefício, mencione que cada caso é um caso quando fizer sentido, CTA coerente (Direct/WhatsApp/avaliação), e 3-5 hashtags relevantes no final."
}

REGRAS DO JSON:
- Escape corretamente aspas internas com \"
- Use \\n para quebras de linha dentro das strings
- O campo palavra_count deve conter o número exato de palavras do roteiro_completo
- Não inclua comentários ou texto fora do JSON
- Valide que o JSON está sintaticamente correto antes de responder

PERFIL DO DENTISTA
- Especialidade principal: ${Array.isArray(onboarding.main_specialty) ? onboarding.main_specialty.join(" e ") : onboarding.main_specialty || "Odontologia geral"}
- Procedimentos foco: ${onboarding.focus_procedures || "Diversos procedimentos"}
- Diferencial real: ${onboarding.real_differentiator || "Atendimento de qualidade"}
- Como quer ser lembrado: ${onboarding.how_to_be_remembered || "Como um profissional de excelência"}

TOM DE VOZ E IDENTIDADE
- Tom de comunicação: ${tones}
- Persona: ${persona}
- Linguagem a evitar: ${onboarding.language_to_avoid || "Termos muito técnicos sem explicação"}

PÚBLICO-ALVO
- Paciente ideal: ${onboarding.ideal_patient || "Pacientes que buscam qualidade"}
- Dores do paciente: ${onboarding.patient_pains || "Medo de procedimentos, custo, tempo"}
- Principal objeção: ${onboarding.main_objection || "Preço ou medo"}
- Por que adiam a decisão: ${onboarding.decision_delay_reason || "Insegurança ou falta de urgência"}
- Perguntas frequentes: ${onboarding.common_questions || "Dúvidas sobre procedimentos e valores"}

SERVIÇOS E POSICIONAMENTO
- Procedimentos prioritários: ${onboarding.priority_procedures || "Procedimentos de alta demanda"}
- Procedimento carro-chefe: ${onboarding.flagship_procedure || "Especialidade principal"}
- Medo sobre o carro-chefe: ${onboarding.flagship_fear || "Comunicar sem parecer vendedor"}
- Mito a quebrar: ${onboarding.myth_to_break || "Mitos comuns da odontologia"}

PROVAS E AUTORIDADE
- Tem casos autorizados: ${onboarding.has_authorized_cases ? "Sim" : "Não"}
- Tipos de prova social: ${onboarding.proof_types?.join(", ") || "Depoimentos de pacientes"}
- Diferenciais técnicos: ${onboarding.technical_differentiators || "Equipamentos modernos"}
- Conquistas: ${onboarding.achievements || "Experiência e formação"}
- História de conexão: ${onboarding.connection_story || "Paixão pela odontologia"}

INSTRUÇÃO FINAL
Se algum dado estiver incompleto ou ausente, assuma o padrão mais seguro e genérico. Não mencione suposições, não avise que algo foi assumido. Entregue apenas o JSON final pronto e válido.
`;
}

function buildUserPrompt(
  request: GenerateScriptRequest,
  onboarding: OnboardingData,
  script: any
): string {
  return `
  Crie 1 roteiro de vídeo curto + descrição para publicação.

  Tema obrigatório: ${script.topic}
  Tipo de roteiro: ${script.format}
  Pilar: ${script.pillar}
  Estilo de gancho: ${script.hook_style}
  Ângulo do conteúdo: ${script.content_angle}
  Objetivo: ${script.objective}
  `
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace("Bearer ", "");

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify the user's JWT token explicitly
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized", details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const requestBody: GenerateScriptRequest = await req.json().catch(() => ({}));

    // Fetch user's onboarding data
    const { data: onboarding, error: onboardingError } = await supabase
      .from("user_onboarding")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (onboardingError || !onboarding) {
      return new Response(
        JSON.stringify({
          error: "Onboarding data not found. Please complete onboarding first."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let fetchedData = null;
    if (requestBody.scriptId) {
      const { data: scriptData, error: scriptError } = await supabase
        .from("scripts")
        .select("title, topic, user_id")
        .eq("id", requestBody.scriptId)
        .eq("user_id", user.id)
        .single();

      if (scriptError) {
        console.error("Error fetching script:", scriptError);
      } else {
        fetchedData = scriptData;
      }
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompts using onboarding data and potentially fetched topic
    const systemPrompt = buildSystemPrompt(onboarding as OnboardingData);
    const userPrompt = buildUserPrompt(requestBody, onboarding as OnboardingData, fetchedData);

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate script" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices?.[0]?.message?.content;

    if (!generatedContent) {
      return new Response(
        JSON.stringify({ error: "No script generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (e) {
      console.error("Failed to parse OpenAI response as JSON:", e);
      // Fallback if not valid JSON, though system prompt enforces it
      parsedContent = { full_script: generatedContent };
    }

    const { hook, full_script, description } = parsedContent;
    const finalScript = full_script || generatedContent;

    let finalResponseScript = null;

    // Update the script in the database if scriptId provided and re-fetch
    if (requestBody.scriptId) {
      const { error: updateError } = await supabase
        .from('scripts')
        .update({
          content: finalScript,
          hook: hook,
          description: description,
          content_generated: true,
          status: 'script', // Ensure status is set to script
          updated_at: new Date().toISOString()
        })
        .eq('id', requestBody.scriptId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Failed to update script in database:", updateError);
      } else {
        // Re-fetch the complete script object
        const { data: updatedScript, error: fetchError } = await supabase
          .from('scripts')
          .select('*')
          .eq('id', requestBody.scriptId)
          .single();

        if (!fetchError && updatedScript) {
          finalResponseScript = updatedScript;
        }
      }
    }

    // Return the generated script (or full object if available)
    return new Response(
      JSON.stringify({
        script: finalResponseScript || {
          content: finalScript,
          hook,
          description,
          metadata: {
            topic: topicToUse || "general",
            platform: requestBody.platform || onboarding.social_platforms?.[0] || "instagram",
            script_type: requestBody.script_type || "educational",
            duration: requestBody.duration || "medium",
            generated_at: new Date().toISOString(),
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-script function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
