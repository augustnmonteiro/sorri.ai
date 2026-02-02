import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
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
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify the user's JWT token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return jsonResponse(
        { error: "Unauthorized", details: authError?.message },
        401
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return jsonResponse({ error: "No image provided" }, 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(imageFile.type)) {
      return jsonResponse(
        { error: "Tipo de arquivo não suportado. Use JPG, PNG ou WebP." },
        400
      );
    }

    // Validate file size (10MB max)
    if (imageFile.size > 10 * 1024 * 1024) {
      return jsonResponse(
        { error: "Imagem muito grande. Máximo 10MB." },
        400
      );
    }

    // Fetch user profile to check limits
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "plan, ai_profile_photo_generations_count, ai_profile_photo_generated_at"
      )
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return jsonResponse({ error: "Profile not found" }, 404);
    }

    const plan = profile.plan || "free";
    const generationsCount = profile.ai_profile_photo_generations_count || 0;
    const lastGeneratedAt = profile.ai_profile_photo_generated_at
      ? new Date(profile.ai_profile_photo_generated_at)
      : null;

    // Check plan limits
    if (plan === "free" && generationsCount >= 1) {
      return jsonResponse(
        {
          error: "limit_reached",
          message:
            "Você já usou sua geração gratuita. Faça upgrade para o plano Pro para gerar mais fotos.",
        },
        403
      );
    }

    if (plan === "pro" && lastGeneratedAt) {
      const now = new Date();
      const sameMonth =
        lastGeneratedAt.getMonth() === now.getMonth() &&
        lastGeneratedAt.getFullYear() === now.getFullYear();

      if (sameMonth) {
        return jsonResponse(
          {
            error: "limit_reached",
            message:
              "Você já gerou uma foto este mês. Tente novamente no próximo mês.",
          },
          403
        );
      }
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return jsonResponse({ error: "OpenAI API key not configured" }, 500);
    }

    // Convert uploaded image to a PNG buffer for OpenAI
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBlob = new Blob([imageBuffer], { type: "image/png" });

    // Build the OpenAI image edit request
    const openaiFormData = new FormData();
    openaiFormData.append("model", "gpt-image-1.5");
    openaiFormData.append(
      "prompt",
      `Edite essa imagem. Preciso de uma foto de perfil profissional, em alta resolução, mantendo a estrutura facial exata, identidade e características principais da pessoa na imagem de entrada. O sujeito é enquadrado do peito pra cima, com bastante espaço acima da cabeça e espaço negativo, garantindo que o topo da cabeça não seja cortado. A pessoa olha diretamente pra câmera com uma expressão confiante e autoritária, e o corpo do sujeito está posicionado em um ângulo de 3/4 em relação à câmera. O fundo é um estúdio neutro sólido “#141414”. Filmado de um ângulo alto com iluminação de estúdio suave, brilhante e arejada, iluminando suavemente o rosto e criando um leve brilho nos olhos, transmitindo uma sensação de autoridade e liderança. Capturado em uma lente 85mm f/1.8 com pouca profundidade de campo, foco requintado nos olhos e bokeh bonito e suave. Observe os detalhes nítidos na textura do tecido do traje, fios de cabelo individuais e textura natural e realista da pele, sem aparência artificial. A atmosfera exala confiança, profissionalismo e presença. Classificação de cores cinematográfica limpa e brilhante com calor sutil e tons equilibrados, garantindo uma sensação polida e contemporânea. Usar looks terno de juíz.`
    );
    openaiFormData.append("image[]", imageBlob, "photo.png");
    openaiFormData.append("size", "1024x1024");
    openaiFormData.append("quality", "high");

    console.log("Calling OpenAI image edit API...");

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: openaiFormData,
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error("OpenAI API error:", errorData);
      return jsonResponse(
        { error: "Falha ao gerar a foto. Tente novamente." },
        500
      );
    }

    const openaiData = await openaiResponse.json();
    const base64Image = openaiData.data?.[0]?.b64_json;

    if (!base64Image) {
      console.error("No image in OpenAI response:", openaiData);
      return jsonResponse(
        { error: "Nenhuma imagem foi gerada. Tente novamente." },
        500
      );
    }

    // Decode base64 and upload to Supabase Storage
    const binaryString = atob(base64Image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const timestamp = Date.now();
    const storagePath = `${user.id}/ai-profile-${timestamp}.png`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(storagePath, bytes, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return jsonResponse(
        { error: "Falha ao salvar a foto. Tente novamente." },
        500
      );
    }

    // Store the storage path (not a full URL) so the frontend can build
    // the public URL using its own VITE_SUPABASE_URL, avoiding the
    // internal kong:8000 address that SUPABASE_URL resolves to in edge functions.
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        ai_profile_photo_url: storagePath,
        ai_profile_photo_generated_at: new Date().toISOString(),
        ai_profile_photo_generations_count: generationsCount + 1,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
    }

    return jsonResponse({ path: storagePath });
  } catch (error) {
    console.error("Error in generate-profile-photo function:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
