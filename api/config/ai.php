<?php
// api/config/ai.php
// Configuration pour l'intégration de l'IA (ex: OpenAI, Mistral, ou un modèle local)

return [
    'ai_provider' => getenv('AI_PROVIDER') ?: 'mock', // 'openai', 'mistral', 'mock'
    'api_key' => getenv('AI_API_KEY') ?: '',
    'model' => getenv('AI_MODEL') ?: 'gpt-3.5-turbo',
    'system_prompt' => "Tu es un assistant pédagogique spécialisé dans les examens camerounais (BAC, Probatoire, BEPC). Réponds en français de manière simple et encourageante."
];
?>
