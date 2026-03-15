// @task S7E1

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Environment variables
// ---------------------------------------------------------------------------
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL     = process.env.FROM_EMAIL || 'AX-On Platform <noreply@ax-on.platform>';
const RESEND_API_URL = 'https://api.resend.com/emails';

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ---------------------------------------------------------------------------
// Retry configuration
// ---------------------------------------------------------------------------
const MAX_RETRY_ATTEMPTS  = 3;
const BASE_BACKOFF_MS     = 1000; // 1s → 2s → 4s (exponential)

// ---------------------------------------------------------------------------
// Supabase client (service role — bypasses RLS for internal email dispatch)
// ---------------------------------------------------------------------------
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ---------------------------------------------------------------------------
// Load HTML template once at module initialisation
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const TEMPLATE_PATH = join(__dirname, '../templates/enrollment-confirmation.html');
let   htmlTemplate  = null;

function getTemplate() {
  if (!htmlTemplate) {
    htmlTemplate = readFileSync(TEMPLATE_PATH, 'utf-8');
  }
  return htmlTemplate;
}

// ---------------------------------------------------------------------------
// Utility: sleep
// ---------------------------------------------------------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Utility: validate email address (RFC 5322 simplified)
// ---------------------------------------------------------------------------
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// ---------------------------------------------------------------------------
// Step 1: Fetch enrollment data (enrollments JOIN profiles JOIN courses)
// ---------------------------------------------------------------------------
async function fetchEnrollmentData(enrollmentId) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      status,
      enrolled_at,
      profiles (
        id,
        full_name,
        email
      ),
      courses (
        id,
        title,
        instructor_name,
        start_date,
        duration_weeks,
        difficulty
      )
    `)
    .eq('id', enrollmentId)
    .single();

  if (error) {
    throw new Error(`DB 조회 실패 (enrollment_id: ${enrollmentId}): ${error.message}`);
  }
  if (!data) {
    throw new Error(`수강 신청 데이터 없음 (enrollment_id: ${enrollmentId})`);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Step 2: Build email HTML from template + enrollment data
// ---------------------------------------------------------------------------
function buildEmailHtml(enrollment) {
  const { profiles: user, courses: course } = enrollment;

  const startDate = course.start_date
    ? new Date(course.start_date).toLocaleDateString('ko-KR', {
        year:  'numeric',
        month: 'long',
        day:   'numeric',
      })
    : '추후 안내 예정';

  const duration = course.duration_weeks
    ? `${course.duration_weeks}주`
    : '자기 주도 학습';

  const difficultyMap = {
    beginner:     '입문',
    intermediate: '중급',
    advanced:     '고급',
  };
  const difficulty = difficultyMap[course.difficulty] || course.difficulty || '미정';

  const template = getTemplate();

  return template
    .replace(/{user_name}/g,       user.full_name   || '수강생')
    .replace(/{course_name}/g,     course.title      || '강의명 미정')
    .replace(/{instructor_name}/g, course.instructor_name || '강사명 미정')
    .replace(/{start_date}/g,      startDate)
    .replace(/{duration}/g,        duration)
    .replace(/{difficulty}/g,      difficulty)
    .replace(/{course_id}/g,       course.id         || '');
}

// ---------------------------------------------------------------------------
// Step 3: Call Resend API with retry + exponential backoff
// ---------------------------------------------------------------------------
async function callResendApi(to, subject, html, attemptNumber = 1) {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      from:    FROM_EMAIL,
      to:      [to],
      subject,
      html,
    }),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = responseData?.message || response.statusText || `HTTP ${response.status}`;

    // 4xx errors (except 429) are non-retryable
    const isNonRetryable = response.status >= 400 && response.status < 500 && response.status !== 429;
    if (isNonRetryable) {
      const err = new Error(`Resend API 비재시도 오류 (${response.status}): ${errorMsg}`);
      err.nonRetryable = true;
      throw err;
    }

    throw new Error(`Resend API 오류 (${response.status}): ${errorMsg}`);
  }

  return responseData; // { id: 're_...' }
}

async function sendWithRetry(to, subject, html) {
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await callResendApi(to, subject, html, attempt);
      return { success: true, data: result, attempt };
    } catch (err) {
      lastError = err;

      // Non-retryable: stop immediately
      if (err.nonRetryable) {
        return { success: false, error: err.message, attempt, nonRetryable: true };
      }

      // Network / 5xx: apply exponential backoff before retry
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const backoffMs = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.warn(
          `[send-enrollment-email] Resend API 재시도 ${attempt}/${MAX_RETRY_ATTEMPTS} ` +
          `(${backoffMs}ms 대기): ${err.message}`
        );
        await sleep(backoffMs);
      }
    }
  }

  return { success: false, error: lastError?.message || 'Unknown error', attempt: MAX_RETRY_ATTEMPTS };
}

// ---------------------------------------------------------------------------
// Step 4: Write result to email_logs table
// ---------------------------------------------------------------------------
async function logEmailResult({ enrollmentId, recipientEmail, status, sentAt, attemptCount, lastError }) {
  const { error } = await supabase.from('email_logs').insert({
    enrollment_id:   enrollmentId,
    recipient_email: recipientEmail,
    email_type:      'enrollment_confirmation',
    status,
    sent_at:         sentAt  || null,
    attempt_count:   attemptCount,
    last_error:      lastError || null,
  });

  if (error) {
    // Logging failure should not surface to the caller — only warn
    console.error('[send-enrollment-email] email_logs 기록 실패:', error.message);
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * sendEnrollmentConfirmationEmail
 *
 * Sends an enrollment confirmation email for the given enrollment ID.
 * Handles data fetching, template rendering, Resend API dispatch (with retry),
 * and email_logs recording.
 *
 * @param {string} enrollmentId  UUID of the enrollment row
 * @returns {Promise<{ success: boolean, message: string, resendId?: string }>}
 */
export async function sendEnrollmentConfirmationEmail(enrollmentId) {
  // Guard: API key must be present
  if (!RESEND_API_KEY) {
    throw new Error('환경변수 RESEND_API_KEY가 설정되지 않았습니다.');
  }

  // ---- 1. Fetch enrollment data ----
  let enrollment;
  try {
    enrollment = await fetchEnrollmentData(enrollmentId);
  } catch (err) {
    console.error('[send-enrollment-email] 데이터 조회 오류:', err.message);
    throw err;
  }

  const recipientEmail = enrollment.profiles?.email;
  const courseName     = enrollment.courses?.title || '수강 강의';

  // ---- 2. Validate recipient email ----
  if (!isValidEmail(recipientEmail)) {
    const errMsg = `유효하지 않은 이메일 주소: "${recipientEmail}" (enrollment_id: ${enrollmentId})`;
    console.error('[send-enrollment-email]', errMsg);

    await logEmailResult({
      enrollmentId,
      recipientEmail: recipientEmail || 'INVALID',
      status:         'failed',
      sentAt:         null,
      attemptCount:   0,
      lastError:      errMsg,
    });

    return { success: false, message: errMsg };
  }

  // ---- 3. Build email HTML ----
  let html;
  try {
    html = buildEmailHtml(enrollment);
  } catch (err) {
    const errMsg = `이메일 템플릿 렌더링 오류: ${err.message}`;
    console.error('[send-enrollment-email]', errMsg);
    throw new Error(errMsg);
  }

  const subject = `[AX-On] "${courseName}" 수강 신청이 승인되었습니다`;

  // ---- 4. Send via Resend API (with retry) ----
  const sendResult = await sendWithRetry(recipientEmail, subject, html);

  // ---- 5. Log result to email_logs ----
  await logEmailResult({
    enrollmentId,
    recipientEmail,
    status:       sendResult.success ? 'sent' : 'failed',
    sentAt:       sendResult.success ? new Date().toISOString() : null,
    attemptCount: sendResult.attempt,
    lastError:    sendResult.success ? null : sendResult.error,
  });

  if (sendResult.success) {
    console.info(
      `[send-enrollment-email] 발송 성공: enrollment_id=${enrollmentId}, ` +
      `to=${recipientEmail}, resend_id=${sendResult.data?.id}`
    );
    return {
      success:  true,
      message:  '이메일 발송 완료',
      resendId: sendResult.data?.id,
    };
  }

  console.error(
    `[send-enrollment-email] 발송 실패: enrollment_id=${enrollmentId}, ` +
    `error=${sendResult.error}`
  );
  return {
    success: false,
    message: `이메일 발송 실패: ${sendResult.error}`,
  };
}
