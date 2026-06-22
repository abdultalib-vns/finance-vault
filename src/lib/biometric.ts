/**
 * Biometric (Touch ID / Face ID / Fingerprint) login via WebAuthn platform authenticators.
 *
 * Flow:
 *  - Enroll: registers a platform-bound credential and stores the user's PIN
 *    encrypted with a key derived from the WebAuthn PRF extension result
 *    (when supported), or a key derived from the credential ID itself as a
 *    fallback gate. The PIN cipher is AES-GCM via WebCrypto.
 *  - Login: requests an assertion (which prompts Touch ID / Face ID / Fingerprint
 *    on supported devices), and on success decrypts the stored PIN.
 *
 *  Works inside an installed PWA on iOS 16+, Android, and most desktop browsers.
 */

const RP_NAME      = "FinAura";
const USER_HANDLE  = "FinAura-user";

const CRED_ID_KEY   = "finance_bio_cred_id";
const ENC_PIN_KEY   = "finance_bio_enc_pin";
const PRF_SALT_KEY  = "finance_bio_prf_salt";

// ── base64url helpers ─────────────────────────────────────────────
function bufToB64u(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64uToBuf(b64u: string): ArrayBuffer {
  const pad = b64u.length % 4 === 0 ? "" : "=".repeat(4 - (b64u.length % 4));
  const binary = atob((b64u + pad).replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

// ── Capability checks ─────────────────────────────────────────────
export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function isBiometricEnrolled(): boolean {
  return !!localStorage.getItem(CRED_ID_KEY) && !!localStorage.getItem(ENC_PIN_KEY);
}

export function disableBiometric(): void {
  localStorage.removeItem(CRED_ID_KEY);
  localStorage.removeItem(ENC_PIN_KEY);
  localStorage.removeItem(PRF_SALT_KEY);
}

// ── AES-GCM helpers ───────────────────────────────────────────────
async function deriveAesKey(secret: ArrayBuffer): Promise<CryptoKey> {
  const hash = await crypto.subtle.digest("SHA-256", secret);
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function aesEncrypt(plaintext: string, secret: ArrayBuffer, prefix: string): Promise<string> {
  const key = await deriveAesKey(secret);
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const ct  = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
  return `${prefix}:${bufToB64u(iv)}:${bufToB64u(ct)}`;
}

async function aesDecrypt(encrypted: string, secret: ArrayBuffer): Promise<string> {
  const parts = encrypted.split(":");
  if (parts.length !== 3) throw new Error("Malformed cipher");
  const iv = new Uint8Array(b64uToBuf(parts[1]));
  const ct = b64uToBuf(parts[2]);
  const key = await deriveAesKey(secret);
  const pt  = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}

// ── WebAuthn extension typing ─────────────────────────────────────
interface PrfExtensionResults {
  prf?: { results?: { first?: ArrayBuffer } };
}

// ── Enroll ────────────────────────────────────────────────────────
export async function enrollBiometric(pin: string): Promise<void> {
  if (!(await isBiometricSupported())) {
    throw new Error("Biometric authentication is not available on this device.");
  }

  const challenge   = crypto.getRandomValues(new Uint8Array(32));
  const prfSalt     = crypto.getRandomValues(new Uint8Array(32));
  const userIdBytes = new TextEncoder().encode(USER_HANDLE);

  const cred = await navigator.credentials.create({
    publicKey: {
      rp:   { name: RP_NAME },
      user: { id: userIdBytes, name: "user", displayName: "FinAura User" },
      challenge,
      pubKeyCredParams: [
        { alg: -7,   type: "public-key" },  // ES256
        { alg: -257, type: "public-key" },  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60000,
      attestation: "none",
      extensions: { prf: { eval: { first: prfSalt } } } as AuthenticationExtensionsClientInputs,
    },
  }) as PublicKeyCredential | null;

  if (!cred) throw new Error("Biometric setup was cancelled.");

  const ext       = cred.getClientExtensionResults() as PrfExtensionResults;
  const prfResult = ext?.prf?.results?.first;

  let encryptedPin: string;
  if (prfResult) {
    encryptedPin = await aesEncrypt(pin, prfResult, "prf");
    localStorage.setItem(PRF_SALT_KEY, bufToB64u(prfSalt));
  } else {
    // Fallback: encrypt with a key derived from the credential ID itself.
    // This is a UX-level gate; the credential is platform-bound and cannot
    // be exported, so the assertion is the practical security boundary.
    encryptedPin = await aesEncrypt(pin, cred.rawId, "cid");
  }

  localStorage.setItem(CRED_ID_KEY, bufToB64u(cred.rawId));
  localStorage.setItem(ENC_PIN_KEY, encryptedPin);
}

// ── Login ─────────────────────────────────────────────────────────
export async function loginWithBiometric(): Promise<string> {
  const credIdB64  = localStorage.getItem(CRED_ID_KEY);
  const encPin     = localStorage.getItem(ENC_PIN_KEY);
  const prfSaltB64 = localStorage.getItem(PRF_SALT_KEY);

  if (!credIdB64 || !encPin) throw new Error("Biometric login is not enabled.");

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const credId    = b64uToBuf(credIdB64);

  const extensions: AuthenticationExtensionsClientInputs = prfSaltB64
    ? { prf: { eval: { first: new Uint8Array(b64uToBuf(prfSaltB64)) } } } as AuthenticationExtensionsClientInputs
    : {};

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      allowCredentials: [{ id: credId, type: "public-key" }],
      userVerification: "required",
      timeout: 60000,
      extensions,
    },
  }) as PublicKeyCredential | null;

  if (!assertion) throw new Error("Biometric authentication was cancelled.");

  if (encPin.startsWith("prf:")) {
    const ext = assertion.getClientExtensionResults() as PrfExtensionResults;
    const prfResult = ext?.prf?.results?.first;
    if (!prfResult) {
      throw new Error("Biometric key derivation failed. Please re-enable biometric login.");
    }
    return aesDecrypt(encPin, prfResult);
  } else {
    return aesDecrypt(encPin, assertion.rawId);
  }
}
