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
  persona: string | null;
  ideal_patient: string | null;
  patient_pains: string | null;
  main_objection: string | null;
  common_questions: string | null;
  priority_procedures: string | null;
  main_bottleneck: string | null;
  proof_types: string[] | null;
  flagship_procedure: string | null;
  myth_to_break: string | null;
}

interface SubjectItem {
  id: number;
  subject: string;
  hashtags: string[];
  objective: string;
  format: string;
  pillar: string;
  funnel_stage: string;
  hook_style: string;
  content_angle: string;
}

interface GeneratedSubjects {
  metadata: {
    specialty: string;
    flagship_procedure: string;
    generated_at: string;
    version: string;
  };
  distribution_summary: {
    by_pillar: Record<string, number>;
    by_funnel: Record<string, number>;
  };
  subjects: SubjectItem[];
}

function buildSystemPrompt(onboarding: OnboardingData, previousSubjects: string, ideaCount: number): string {
  // Distribution based on idea count
  const distributions = ideaCount === 30 ? {
    byPillar: {
      educacional: 6,
      quebra_objecao: 6,
      mito_verdade: 6,
      autoridade: 6,
      prova_social: 4,
      conversao: 2
    },
    byFunnel: { topo: 12, meio: 12, fundo: 6 },
    minFormats: {
      pergunta_resposta: 6,
      lista_3_pontos: 5,
      historia_curta: 4,
      analogia: 4,
      erro_comum: 3
    },
    flagshipMin: 8,
    bottleneckMin: 5,
    objectionMin: 6,
    mythMin: 2
  } : {
    byPillar: {
      educacional: 2,
      quebra_objecao: 2,
      mito_verdade: 2,
      autoridade: 2,
      prova_social: 1,
      conversao: 1
    },
    byFunnel: { topo: 4, meio: 4, fundo: 2 },
    minFormats: {
      pergunta_resposta: 2,
      lista_3_pontos: 2,
      historia_curta: 1,
      analogia: 1,
      erro_comum: 1
    },
    flagshipMin: 3,
    bottleneckMin: 2,
    objectionMin: 2,
    mythMin: 1
  };

  return `
Você é um estrategista de conteúdo especializado em marketing digital para profissionais de odontologia no Brasil.

## SUA MISSÃO
  Gerar ${ideaCount} ideias estratégicas de assuntos / temas para vídeos curtos(Reels / TikTok / Shorts) que serão posteriormente transformados em roteiros completos por outro prompt.
  IMPORTANTE: Você está gerando APENAS os assuntos / temas, NÃO os roteiros completos.

---

## PERFIL DO PROFISSIONAL

  - ** Especialidade principal:** ${Array.isArray(onboarding.main_specialty) ? onboarding.main_specialty.join(" e ") : onboarding.main_specialty || "Odontologia geral"}
  - ** Procedimentos foco:** ${onboarding.focus_procedures || "Diversos procedimentos"}
  - ** Procedimento carro - chefe:** ${onboarding.flagship_procedure || "Especialidade principal"}
  - ** Procedimentos prioritários:** ${onboarding.priority_procedures || "Procedimentos de alta demanda"}
  - ** Diferencial competitivo:** ${onboarding.real_differentiator || "Atendimento de qualidade"}
  - ** Tom de voz:** ${onboarding.tone_of_voice || "Profissional e acolhedor"}

  ---

## PÚBLICO - ALVO

  - ** Paciente ideal:** ${onboarding.ideal_patient || "Pacientes que buscam qualidade"}
  - ** Principais dores:** ${onboarding.patient_pains || "Medo de procedimentos, custo, tempo"}
  - ** Objeções mais comuns:** ${onboarding.main_objection || "Preço ou medo"}
  - ** Perguntas frequentes:** ${onboarding.common_questions || "Dúvidas sobre procedimentos e valores"}

  ---

## CONTEXTO DO NEGÓCIO

  - ** Principal gargalo:** ${onboarding.main_bottleneck || "Atração de pacientes"}
  - ** Provas sociais disponíveis:** ${onboarding.proof_types?.join(", ") || "Depoimentos de pacientes"}
  - ** Mito a desconstruir:** ${onboarding.myth_to_break || "Mitos comuns da odontologia"}

  ---

## HISTÓRICO(ANTI - REPETIÇÃO)

ASSUNTOS JÁ CRIADOS ANTERIORMENTE (NÃO REPETIR):
${previousSubjects || "Nenhum assunto criado ainda."}

REGRA DE ANTI-REPETIÇÃO:
- É PROIBIDO repetir tema central, gancho ou argumentos principais
- Considere "repetido" se houver 2+ coincidências com qualquer assunto antigo
- Não basta trocar palavras — deve mudar o ÂNGULO e a ABORDAGEM
- Se tocar em assunto próximo, recorte para SUBTEMA NOVO
- Exemplo: em vez de repetir "clareamento", focar em "por que clareamento de farmácia mancha os dentes", "clareamento e sensibilidade", "quanto tempo dura o clareamento", etc.

---

## ESTRUTURA DE CADA IDEIA

Para cada uma das 30 ideias, defina TODOS os campos abaixo:

### 1. subject(string)
Título claro, específico e chamativo do assunto.Deve funcionar como um "gancho mental" que deixa claro o ângulo do conteúdo.

REGRAS PARA SUBJECT:
- Seja ESPECÍFICO, não genérico("Implante dentário" ❌ → "Por que implante barato sai caro no final" ✅)
- Use ângulos variados: pergunta, provocação, erro comum, revelação, lista, história
- Máximo 80 caracteres
- Deve ser autoexplicativo para quem for escrever o roteiro depois

### 2. hashtags(array de 8 strings)
Mix estratégico de hashtags:
- 2 hashtags da especialidade(ex: #implantedentario, #ortodontia)
- 2 hashtags de dor / desejo do paciente(ex: #medodedentista, #sorrisoperfeito)
- 2 hashtags de alcance médio(ex: #dicasdedentista, #saudebucal)
- 1 hashtag local / regional(ex: #dentistasp, #odontologiario)
- 1 hashtag trending / viral(ex: #viral, #ficaadica)

### 3. objective(string)
O objetivo principal do conteúdo.Use APENAS:
- "atrair" → Chamar atenção de quem não conhece
- "educar" → Ensinar algo novo
- "engajar" → Gerar comentários e compartilhamentos
- "converter" → Levar à ação / agendamento

### 4. format(string)
Formato sugerido para o vídeo.Use APENAS:
- "pergunta_resposta" → Responder dúvida comum
- "lista_3_pontos" → Top 3, 3 erros, 3 sinais, etc.
- "historia_curta" → Contar caso / situação(anonimizado)
- "mito_vs_verdade" → Desmistificar crença popular
- "erro_comum" → Apontar erro que o público comete
- "analogia" → Explicar com comparação simples
- "antes_depois" → Mostrar transformação
- "bastidores" → Mostrar rotina / processo
- "provocacao" → Afirmação que gera curiosidade
- "tutorial_rapido" → Demonstração prática

### 5. pillar(string)
Pilar estratégico do conteúdo.Use APENAS:
- "educacional" → Explicar com simplicidade
- "quebra_objecao" → Abordar medos, custo, tempo, dor
- "mito_verdade" → Crenças comuns da especialidade
- "autoridade" → Bastidores, método, expertise
- "prova_social" → Depoimentos, aprendizados, casos
- "conversao" → Convite para ação com ética

### 6. funnel_stage(string)
Etapa do funil.Use APENAS:
- "topo" → Descoberta(atrair desconhecidos)
- "meio" → Consideração(nutrir interessados)
- "fundo" → Decisão(converter em pacientes)

### 7. hook_style(string)
Estilo do gancho sugerido para o roteiro.Use APENAS:
- "pergunta_direta" → "Você sabia que...?"
- "afirmacao_chocante" → "90% das pessoas fazem isso errado"
- "historia" → "Outro dia uma paciente me perguntou..."
- "comando" → "Para de fazer isso agora"
- "curiosidade" → "O que ninguém te conta sobre..."
- "identificacao" → "Se você tem X, precisa ver isso"

### 8. content_angle(string)
Breve descrição(máx 100 caracteres) do ângulo único deste conteúdo.
Ajuda a diferenciar de assuntos similares.

---

## DISTRIBUIÇÃO OBRIGATÓRIA

### Por Pilar(total = ${ideaCount}):
- educacional: ${distributions.byPillar.educacional} ideias
- quebra_objecao: ${distributions.byPillar.quebra_objecao} ideias
- mito_verdade: ${distributions.byPillar.mito_verdade} ideias
- autoridade: ${distributions.byPillar.autoridade} ideias
- prova_social: ${distributions.byPillar.prova_social} ideias
- conversao: ${distributions.byPillar.conversao} ideias

### Por Etapa do Funil:
- topo: ${distributions.byFunnel.topo} ideias
- meio: ${distributions.byFunnel.meio} ideias
- fundo: ${distributions.byFunnel.fundo} ideias

### Variedade de Formatos(mínimo obrigatório):
- pergunta_resposta: mínimo ${distributions.minFormats.pergunta_resposta}
- lista_3_pontos: mínimo ${distributions.minFormats.lista_3_pontos}
- historia_curta: mínimo ${distributions.minFormats.historia_curta}
- analogia: mínimo ${distributions.minFormats.analogia}
- erro_comum: mínimo ${distributions.minFormats.erro_comum}
- Outros formatos: distribuir os restantes

### Variedade de Hook Styles:
- Usar pelo menos ${ideaCount === 30 ? 5 : 3} estilos diferentes
- Não usar o mesmo estilo mais de ${ideaCount === 30 ? 7 : 3} vezes

---

## DIRETRIZES DE QUALIDADE

### ✅ FAZER:
1. Priorizar o PROCEDIMENTO CARRO - CHEFE(mínimo ${distributions.flagshipMin} ideias relacionadas)
2. Abordar as DORES do paciente de diferentes ângulos
3. Responder as PERGUNTAS FREQUENTES informadas
4. Atacar diretamente o GARGALO DE NEGÓCIO(mínimo ${distributions.bottleneckMin} ideias)
5. Quebrar as OBJEÇÕES principais(mínimo ${distributions.objectionMin} ideias)
6. Desconstruir o MITO informado(mínimo ${distributions.mythMin} ideias)
7. Usar linguagem acessível, sem jargões técnicos excessivos
8. Criar assuntos que funcionem para vídeos de 20 - 60 segundos
9. Pensar em assuntos "graváveis hoje"(sem depender de recursos especiais)

### ❌ NÃO FAZER:
1. Repetir assuntos ou ângulos muito similares
2. Criar assuntos genéricos demais
3. Usar promessas de resultado("garantido", "100%", "sem dor")
4. Sugerir orientação clínica individual
5. Criar assuntos que dependam de mostrar dados sensíveis de pacientes
6. Ignorar a especialidade e procedimentos foco do profissional

---

## CONFORMIDADE ÉTICA

Todos os assuntos devem permitir roteiros que:
- NÃO prometam resultados específicos
- NÃO façam orientação clínica individual
- INCENTIVEM avaliação profissional
- Mantenham tom EDUCATIVO
- Respeitem o CÓDIGO DE ÉTICA ODONTOLÓGICO brasileiro

---

## FORMATO DE SAÍDA

Retorne EXCLUSIVAMENTE um JSON válido, sem NENHUM texto antes ou depois:

{
  "metadata": {
    "specialty": "string (especialidade usada)",
    "flagship_procedure": "string (procedimento carro-chefe)",
    "generated_at": "string (timestamp ISO)",
    "version": "1.0"
  },
  "distribution_summary": {
    "by_pillar": {
      "educacional": ${distributions.byPillar.educacional},
      "quebra_objecao": ${distributions.byPillar.quebra_objecao},
      "mito_verdade": ${distributions.byPillar.mito_verdade},
      "autoridade": ${distributions.byPillar.autoridade},
      "prova_social": ${distributions.byPillar.prova_social},
      "conversao": ${distributions.byPillar.conversao}
    },
    "by_funnel": {
      "topo": ${distributions.byFunnel.topo},
      "meio": ${distributions.byFunnel.meio},
      "fundo": ${distributions.byFunnel.fundo}
    }
  },
  "subjects": [
    {
      "id": 1,
      "subject": "string",
      "hashtags": [
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string",
        "string"
      ],
      "objective": "string",
      "format": "string",
      "pillar": "string",
      "funnel_stage": "string",
      "hook_style": "string",
      "content_angle": "string"
    }
  ]
}

---

## VALIDAÇÕES ANTES DE ENVIAR

Antes de retornar o JSON, verifique:

[] São exatamente ${ideaCount} itens no array "subjects"
[] IDs vão de 1 a ${ideaCount} sem repetição
[] Distribuição por pilar está correta
[] Distribuição por funil está correta
[] Variedade mínima de formatos foi respeitada
[] Nenhum assunto é muito similar a outro
[] Procedimento carro - chefe tem mínimo 8 menções
[] Todos os campos obrigatórios estão preenchidos
[] JSON está válido e parseável
[] Nenhum assunto do histórico foi repetido

GERE AGORA OS ${ideaCount} ASSUNTOS.
---

# Exemplo de Resposta(3 primeiros itens)
{
  "metadata": {
    "specialty": "Implantodontia",
    "flagship_procedure": "Implante dentário",
    "generated_at": "2025-01-14T10:30:00Z",
    "version": "1.0"
  },
  "distribution_summary": {
    "by_pillar": {
      "educacional": 6,
      "quebra_objecao": 6,
      "mito_verdade": 6,
      "autoridade": 6,
      "prova_social": 4,
      "conversao": 2
    },
    "by_funnel": {
      "topo": 12,
      "meio": 12,
      "fundo": 6
    }
  },
  "subjects": [
    {
      "id": 1,
      "subject": "Por que implante 'barato' custa caro no final",
      "hashtags": [
        "#implantedentario",
        "#implantes",
        "#medodedentista",
        "#sorrisoperfeito",
        "#dicasdedentista",
        "#saudebucal",
        "#dentistasp",
        "#viral"
      ],
      "objective": "educar",
      "format": "erro_comum",
      "pillar": "educacional",
      "funnel_stage": "topo",
      "hook_style": "curiosidade",
      "content_angle": "Custo real vs preço baixo - materiais e retrabalho"
    },
    {
      "id": 2,
      "subject": "3 sinais de que seu corpo está rejeitando o implante",
      "hashtags": [
        "#implantedentario",
        "#rejeicaoimplante",
        "#dordedente",
        "#saudebucal",
        "#dicasdedentista",
        "#odontologia",
        "#dentistario",
        "#ficaadica"
      ],
      "objective": "atrair",
      "format": "lista_3_pontos",
      "pillar": "educacional",
      "funnel_stage": "topo",
      "hook_style": "identificacao",
      "content_angle": "Sintomas que indicam necessidade de avaliação urgente"
    },
    {
      "id": 3,
      "subject": "Paciente de 70 anos achava que não podia fazer implante",
      "hashtags": [
        "#implantedentario",
        "#terceiraidade",
        "#nuncaetarde",
        "#qualidadedevida",
        "#saudebucal",
        "#dicasdedentista",
        "#dentistasp",
        "#viral"
      ],
      "objective": "engajar",
      "format": "historia_curta",
      "pillar": "quebra_objecao",
      "funnel_stage": "meio",
      "hook_style": "historia",
      "content_angle": "Idade não é impedimento - quebrar mito da idade limite"
    }
  ]
}

---

# Schema JSON para Validação no Backend
interface SubjectItem {
  id: number;
  subject: string;
  hashtags: string[]; // exactly 8
  objective: "atrair" | "educar" | "engajar" | "converter";
  format: "pergunta_resposta" | "lista_3_pontos" | "historia_curta" | "mito_vs_verdade" | "erro_comum" | "analogia" | "antes_depois" | "bastidores" | "provocacao" | "tutorial_rapido";
  pillar: "educacional" | "quebra_objecao" | "mito_verdade" | "autoridade" | "prova_social" | "conversao";
  funnel_stage: "topo" | "meio" | "fundo";
  hook_style: "pergunta_direta" | "afirmacao_chocante" | "historia" | "comando" | "curiosidade" | "identificacao";
  content_angle: string;
}

interface GeneratedSubjects {
  metadata: {
    specialty: string;
    flagship_procedure: string;
    generated_at: string;
    version: string;
  };
  distribution_summary: {
    by_pillar: Record<string, number>;
    by_funnel: Record<string, number>;
  };
  subjects: SubjectItem[]; // exactly ${ideaCount} items
}
`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role key to create admin client for user verification
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

    // Fetch user's profile to get their plan
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Determine idea count based on plan (free: 10, pro: 30)
    const userPlan = profile?.plan || "free";
    const ideaCount = userPlan === "free" ? 10 : 30;

    // Fetch user's onboarding data
    const { data: onboarding, error: onboardingError } = await supabase
      .from("user_onboarding")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (onboardingError || !onboarding) {
      return new Response(
        JSON.stringify({ error: "Onboarding data not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: existingScripts } = await supabase
      .from("scripts")
      .select("title")
      .eq("user_id", user.id);

    const previousSubjects = existingScripts
      ? existingScripts.map((s: { title: string }) => s.title).join(", ")
      : null;

    const systemPrompt = buildSystemPrompt(onboarding as OnboardingData, previousSubjects, ideaCount);

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
        ],
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to generate subjects" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content generated" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON object from the response
    let generatedData: GeneratedSubjects;
    try {
      generatedData = JSON.parse(content);

      if (!generatedData.subjects || !Array.isArray(generatedData.subjects) || generatedData.subjects.length === 0) {
        throw new Error("Invalid subjects array in generated data");
      }
    } catch (parseError) {
      console.error("Error parsing generated subjects:", parseError, content);
      return new Response(
        JSON.stringify({ error: "Failed to parse generated subjects" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create script entries for each subject (without content)
    const scriptsToInsert = generatedData.subjects.slice(0, ideaCount).map((item, index) => ({
      user_id: user.id,
      title: item.subject,
      topic: item.subject,
      content: null,
      status: "script" as const,
      status_order: index,
      ai_generated: true,
      content_generated: false,
      hashtags: item.hashtags,
      objective: item.objective,
      format: item.format,
      pillar: item.pillar,
      funnel_stage: item.funnel_stage,
      hook_style: item.hook_style,
      content_angle: item.content_angle,
      generation_params: {
        specialty: Array.isArray(onboarding.main_specialty) ? onboarding.main_specialty.join(" e ") : onboarding.main_specialty,
        metadata: generatedData.metadata,
      },
    }));

    const { error: insertError } = await supabase
      .from("scripts")
      .insert(scriptsToInsert);

    if (insertError) {
      console.error("Error inserting scripts:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save subjects" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: scriptsToInsert.length,
        subjects: generatedData.subjects.slice(0, ideaCount),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-subjects function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
