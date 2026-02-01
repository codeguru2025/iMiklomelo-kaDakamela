import crypto from "crypto";

interface PaynowInitRequest {
  reference: string;
  email: string;
  amount: number;
  additionalInfo?: string;
  returnUrl?: string;
  resultUrl?: string;
}

interface PaynowResponse {
  status: string;
  browserUrl?: string;
  pollUrl?: string;
  hash?: string;
  error?: string;
}

interface PaynowStatusResponse {
  status: string;
  paynowReference?: string;
  amount?: string;
  pollUrl?: string;
}

const PAYNOW_INTEGRATION_ID = process.env.PAYNOW_INTEGRATION_ID;
const PAYNOW_INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY;
const PAYNOW_INIT_URL = "https://www.paynow.co.zw/interface/initiatetransaction";

function createHash(values: string[], integrationKey: string): string {
  const concatenated = values.join("") + integrationKey;
  return crypto.createHash("sha512").update(concatenated).digest("hex").toUpperCase();
}

function parsePaynowResponse(response: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = response.split("&");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key && value !== undefined) {
      result[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return result;
}

export async function initializePayment(request: PaynowInitRequest): Promise<PaynowResponse> {
  if (!PAYNOW_INTEGRATION_ID || !PAYNOW_INTEGRATION_KEY) {
    console.error("Paynow credentials not configured");
    return { status: "Error", error: "Payment system not configured" };
  }

  const returnUrl = request.returnUrl || process.env.APP_URL || "https://localhost:5000";
  const resultUrl = request.resultUrl || `${returnUrl}/api/payments/callback`;

  const values = [
    PAYNOW_INTEGRATION_ID,
    request.reference,
    request.amount.toFixed(2),
    request.additionalInfo || "",
    returnUrl,
    resultUrl,
    "Message",
  ];

  const hash = createHash(values, PAYNOW_INTEGRATION_KEY);

  const formData = new URLSearchParams({
    id: PAYNOW_INTEGRATION_ID,
    reference: request.reference,
    amount: request.amount.toFixed(2),
    additionalinfo: request.additionalInfo || "",
    returnurl: returnUrl,
    resulturl: resultUrl,
    authemail: request.email,
    status: "Message",
    hash: hash,
  });

  try {
    const response = await fetch(PAYNOW_INIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    const parsed = parsePaynowResponse(responseText);

    if (parsed.status === "Ok") {
      return {
        status: "Ok",
        browserUrl: parsed.browserurl,
        pollUrl: parsed.pollurl,
        hash: parsed.hash,
      };
    } else {
      return {
        status: "Error",
        error: parsed.error || "Unknown error from Paynow",
      };
    }
  } catch (error) {
    console.error("Paynow initialization error:", error);
    return {
      status: "Error",
      error: "Failed to connect to payment gateway",
    };
  }
}

export async function checkPaymentStatus(pollUrl: string): Promise<PaynowStatusResponse> {
  try {
    const response = await fetch(pollUrl);
    const responseText = await response.text();
    const parsed = parsePaynowResponse(responseText);

    return {
      status: parsed.status || "Unknown",
      paynowReference: parsed.paynowreference,
      amount: parsed.amount,
      pollUrl: pollUrl,
    };
  } catch (error) {
    console.error("Paynow status check error:", error);
    return { status: "Error" };
  }
}

export function isPaymentComplete(status: string): boolean {
  const successStatuses = ["Paid", "Awaiting Delivery", "Delivered"];
  return successStatuses.includes(status);
}

export function isPaymentPending(status: string): boolean {
  const pendingStatuses = ["Created", "Sent", "Pending", "Awaiting Redirect"];
  return pendingStatuses.includes(status);
}

export function isPaymentFailed(status: string): boolean {
  const failedStatuses = ["Cancelled", "Disputed", "Refunded", "Failed"];
  return failedStatuses.includes(status);
}
