<?php
// PHP integration test script for Cameroonian AI Exam Assistant API

$baseUrl = 'http://127.0.0.1:8000/api/endpoints';

function makeRequest($url, $method = 'GET', $data = null, $headers = []) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return ['code' => $httpCode, 'data' => json_decode($response, true)];
}

echo "1. Testing GET /exams.php...\n";
$res = makeRequest("$baseUrl/exams.php");
if ($res['code'] === 200 && is_array($res['data']) && count($res['data']) >= 3) {
    echo "  PASS: Retrieved " . count($res['data']) . " exams.\n";
} else {
    echo "  FAIL: " . print_r($res, true) . "\n";
    exit(1);
}

echo "2. Testing POST /auth.php?action=register...\n";
$username = 'testuser_' . time();
$password = 'password123';
$res = makeRequest("$baseUrl/auth.php?action=register", 'POST', [
    'username' => $username,
    'password' => $password
]);
if ($res['code'] === 200 && isset($res['data']['message'])) {
    echo "  PASS: User registered.\n";
} else {
    echo "  FAIL: " . print_r($res, true) . "\n";
    exit(1);
}

echo "3. Testing POST /auth.php?action=login...\n";
$res = makeRequest("$baseUrl/auth.php?action=login", 'POST', [
    'username' => $username,
    'password' => $password
]);
if ($res['code'] === 200 && !empty($res['data']['token'])) {
    $token = $res['data']['token'];
    echo "  PASS: Login successful, token received.\n";
} else {
    echo "  FAIL: " . print_r($res, true) . "\n";
    exit(1);
}

echo "4. Testing POST /chat.php (FR)...\n";
$res = makeRequest("$baseUrl/chat.php", 'POST', [
    'message' => 'Comment reviser la physique au BAC?',
    'exam_id' => 1,
    'subject_id' => 2,
    'language' => 'fr'
], ["Authorization: Bearer $token"]);

if ($res['code'] === 200 && !empty($res['data']['response'])) {
    echo "  PASS: Chat response received: " . substr($res['data']['response'], 0, 60) . "...\n";
} else {
    echo "  FAIL: " . print_r($res, true) . "\n";
    exit(1);
}

echo "5. Testing POST /chat.php (EN)...\n";
$res = makeRequest("$baseUrl/chat.php", 'POST', [
    'message' => 'How to prepare for BEPC English?',
    'exam_id' => 3,
    'subject_id' => 8,
    'language' => 'en'
], ["Authorization: Bearer $token"]);

if ($res['code'] === 200 && !empty($res['data']['response'])) {
    echo "  PASS: Chat response received: " . substr($res['data']['response'], 0, 60) . "...\n";
} else {
    echo "  FAIL: " . print_r($res, true) . "\n";
    exit(1);
}

echo "\nALL API TESTS PASSED SUCCESSFULLY!\n";
?>
