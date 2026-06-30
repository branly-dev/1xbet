<?php
// api/config/ai.php

return [
    'provider' => getenv('AI_PROVIDER') ?: 'mock', // 'openai', 'mistral', or 'mock'
    'api_key' => getenv('AI_API_KEY') ?: '',
    'model' => getenv('AI_MODEL') ?: 'gpt-3.5-turbo',
    'system_prompt' => "Tu es un assistant pédagogique expert pour les examens camerounais (BAC, Probatoire, BEPC).
                        Réponds en français simple, encourageant, et adapté aux élèves.
                        Explique les concepts clairement et aide à la résolution d'exercices."
];
