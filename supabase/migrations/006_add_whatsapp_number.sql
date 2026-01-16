-- Add WhatsApp number field to user_onboarding
ALTER TABLE user_onboarding
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
