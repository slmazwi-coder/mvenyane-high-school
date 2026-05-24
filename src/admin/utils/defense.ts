/**
 * Anti-Malicious Defense System (AMD)
 * A lightweight, rule-based AI safety layer for the [SCHOOL NAME] Staff Portal.
 * Scans text and metadata for policy violations, inappropriate content, and context mismatches.
 */

export interface SafetyResult {
  safe: boolean;
  reason?: string;
}

const FORBIDDEN_KEYWORDS = [
  // Profanity/Adult (Simulated set)
  'fuck', 'shit', 'porn', 'adult', 'sex', 'nude', 'xxx',
  // Malicious/Hacking (Common web attack patterns)
  '<script', 'javascript:', 'onerror=', 'onclick=', 'eval(',
  // Data Leakage Patterns
  'password:', 'secret:', 'private key',
];

const SCHOOL_POLICY_WORDS = [
  'strike', 'protest', 'illegal', 'scam'
];

export const checkTextSafety = (text: string, context?: string): SafetyResult => {
  const lowerText = text.toLowerCase();

  // 1. Keyword Check
  for (const word of FORBIDDEN_KEYWORDS) {
    if (lowerText.includes(word)) {
      return { safe: false, reason: `Inappropriate or malicious content detected: "${word}"` };
    }
  }

  // 2. Policy Check
  for (const word of SCHOOL_POLICY_WORDS) {
    if (lowerText.includes(word)) {
      return { safe: false, reason: `Content violates school community guidelines regarding: "${word}"` };
    }
  }

  // 3. Context Mismatch Check (Heuristics)
  if (context === 'achievements') {
    if (lowerText.includes('timetable') || lowerText.includes('schedule')) {
      return { safe: false, reason: 'Context mismatch: Timetables should be uploaded to the Documents section, not Achievements.' };
    }
  }

  if (context === 'documents') {
    if (lowerText.includes('result') || lowerText.includes('top achiever')) {
      return { safe: false, reason: 'Context mismatch: Academic results should be managed in the Achievements section.' };
    }
  }

  return { safe: true };
};

export const checkImageSafety = async (base64: string): Promise<SafetyResult> => {
  if (!base64) return { safe: true };

  // In a real app, we would send this to an AI API like Cloud Vision or OpenAI Vision.
  // For this local defense system, we simulate a scan with metadata/header checks.
  
  // Simulation delay for the "AI feel"
  await new Promise(resolve => setTimeout(resolve, 800));

  // Example: Block extremely large base64 strings that might be used for bloat attacks
  if (base64.length > 5 * 1024 * 1024) { 
    return { safe: false, reason: 'File size too large. Malicious bloat detected. Please compress or optimize.' };
  }

  // Check for suspicious script-like patterns in data URI
  if (base64.includes(';base64,PHNjcmlwdD4=')) { // base64 for <script>
    return { safe: false, reason: 'Suspicious script injection detected in image metadata.' };
  }

  return { safe: true };
};

export const runFullDefenseScan = async (data: any, context: string): Promise<SafetyResult> => {
  // Scan all string fields
  for (const key in data) {
    if (typeof data[key] === 'string') {
      const result = checkTextSafety(data[key], context);
      if (!result.safe) return result;

      // If it looks like a base64 image, scan it
      if (data[key].startsWith('data:image/')) {
        const imgResult = await checkImageSafety(data[key]);
        if (!imgResult.safe) return imgResult;
      }
    }
  }
  return { safe: true };
};
