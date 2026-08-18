<?php
// End-to-end integration test for the Cameroonian Exam AI Assistant PHP API.

$baseUrl = "http://127.0.0.1:8000";

function makeRequest($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    $headers = [];
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }
    if ($token !== null) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true) ?: $response
    ];
}

echo "Starting E2E API Integration Test...\n\n";

// Generate a unique username
$username = "user_test_" . uniqid();
$password = "SecretPass123!";

// 1. User Registration
echo "1. Registering user: $username...\n";
$regResponse = makeRequest("$baseUrl/api/endpoints/auth.php", 'POST', [
    'action' => 'register',
    'username' => $username,
    'password' => $password
]);

if ($regResponse['code'] !== 200) {
    echo "FAIL: Register failed with status " . $regResponse['code'] . "\n";
    print_r($regResponse['body']);
    exit(1);
}
echo "SUCCESS: User registered successfully.\n\n";

// 2. User Login
echo "2. Logging in user...\n";
$loginResponse = makeRequest("$baseUrl/api/endpoints/auth.php", 'POST', [
    'action' => 'login',
    'username' => $username,
    'password' => $password
]);

if ($loginResponse['code'] !== 200 || empty($loginResponse['body']['token'])) {
    echo "FAIL: Login failed with status " . $loginResponse['code'] . "\n";
    print_r($loginResponse['body']);
    exit(1);
}

$token = $loginResponse['body']['token'];
echo "SUCCESS: Logged in. Token received: " . substr($token, 0, 20) . "...\n\n";

// 3. Fetch Exams
echo "3. Fetching exams and subjects list...\n";
$examsResponse = makeRequest("$baseUrl/api/endpoints/exams.php", 'GET');

if ($examsResponse['code'] !== 200 || !is_array($examsResponse['body'])) {
    echo "FAIL: Fetching exams failed.\n";
    print_r($examsResponse['body']);
    exit(1);
}

$exams = $examsResponse['body'];
echo "SUCCESS: Fetched " . count($exams) . " exams.\n";

$firstExam = null;
$firstSubject = null;

foreach ($exams as $exam) {
    echo " - Exam: " . $exam['type'] . " (" . $exam['name_fr'] . ") with " . count($exam['subjects']) . " subjects.\n";
    if (empty($firstExam) && !empty($exam['subjects'])) {
        $firstExam = $exam;
        $firstSubject = $exam['subjects'][0];
    }
}
echo "\n";

if (!$firstExam || !$firstSubject) {
    echo "FAIL: No exams or subjects available to test chat.\n";
    exit(1);
}

// 4. Send Chat message
echo "4. Testing Chat AI interaction...\n";
echo " - Selected Exam: " . $firstExam['type'] . ", Subject: " . $firstSubject['name_en'] . "\n";

$chatMessage = "How can I prepare for " . $firstSubject['name_en'] . " in " . $firstExam['type'] . "?";
$chatResponse = makeRequest("$baseUrl/api/endpoints/chat.php", 'POST', [
    'message' => $chatMessage,
    'exam_id' => $firstExam['id'],
    'subject_id' => $firstSubject['id'],
    'language' => 'en'
], $token);

if ($chatResponse['code'] !== 200 || empty($chatResponse['body']['response'])) {
    echo "FAIL: Chat response failed with status " . $chatResponse['code'] . "\n";
    print_r($chatResponse['body']);
    exit(1);
}

echo "SUCCESS: Received chatbot answer:\n";
echo '"' . $chatResponse['body']['response'] . '"' . "\n\n";

echo "ALL END-TO-END TESTS PASSED SUCCESSFULLY!\n";
exit(0);
