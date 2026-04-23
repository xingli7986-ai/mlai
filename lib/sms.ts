import crypto from "crypto";

const SMS_ENDPOINT = "https://dysmsapi.aliyuncs.com/";
const SMS_SIGN_NAME = process.env.SMS_SIGN_NAME || "禄创科技";
const SMS_TEMPLATE_CODE = process.env.SMS_TEMPLATE_CODE || "SMS_332235864";
const ACCESS_KEY_ID = process.env.ALIYUN_SMS_ACCESS_KEY_ID || "";
const ACCESS_KEY_SECRET = process.env.ALIYUN_SMS_ACCESS_KEY_SECRET || "";

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

function buildSignature(
  params: Record<string, string>,
  secret: string
): string {
  const sortedKeys = Object.keys(params).sort();
  const canonicalQuery = sortedKeys
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");

  const stringToSign = `GET&${percentEncode("/")}&${percentEncode(
    canonicalQuery
  )}`;

  const hmac = crypto.createHmac("sha1", secret + "&");
  const signature = hmac.update(stringToSign).digest("base64");

  return signature;
}

export async function sendSmsCode(
  phone: string,
  code: string
): Promise<{ success: boolean; message?: string }> {
  if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET) {
    console.error(
      "Missing ALIYUN_SMS_ACCESS_KEY_ID or ALIYUN_SMS_ACCESS_KEY_SECRET"
    );
    return { success: false, message: "短信服务未配置" };
  }

  const params: Record<string, string> = {
    AccessKeyId: ACCESS_KEY_ID,
    Action: "SendSms",
    Format: "JSON",
    PhoneNumbers: phone,
    RegionId: "cn-hangzhou",
    SignName: SMS_SIGN_NAME,
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: "1.0",
    TemplateCode: SMS_TEMPLATE_CODE,
    TemplateParam: JSON.stringify({ code }),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    Version: "2017-05-25",
  };

  const signature = buildSignature(params, ACCESS_KEY_SECRET);
  params.Signature = signature;

  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  try {
    const response = await fetch(`${SMS_ENDPOINT}?${queryString}`);
    const data = await response.json();

    if (data.Code === "OK") {
      return { success: true };
    }
    console.error("SMS send failed:", data);
    return { success: false, message: data.Message || "发送失败" };
  } catch (error) {
    console.error("SMS send error:", error);
    return { success: false, message: "网络错误" };
  }
}

export async function sendSmsNotification(
  phone: string,
  templateCode: string,
  templateParam: Record<string, string>
): Promise<{ success: boolean; message?: string }> {
  if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET) {
    return { success: false, message: "短信服务未配置" };
  }

  const params: Record<string, string> = {
    AccessKeyId: ACCESS_KEY_ID,
    Action: "SendSms",
    Format: "JSON",
    PhoneNumbers: phone,
    RegionId: "cn-hangzhou",
    SignName: SMS_SIGN_NAME,
    SignatureMethod: "HMAC-SHA1",
    SignatureNonce: crypto.randomUUID(),
    SignatureVersion: "1.0",
    TemplateCode: templateCode,
    TemplateParam: JSON.stringify(templateParam),
    Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    Version: "2017-05-25",
  };

  const signature = buildSignature(params, ACCESS_KEY_SECRET);
  params.Signature = signature;

  const queryString = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  try {
    const response = await fetch(`${SMS_ENDPOINT}?${queryString}`);
    const data = await response.json();

    if (data.Code === "OK") {
      return { success: true };
    }
    console.error("SMS notification failed:", data);
    return { success: false, message: data.Message || "发送失败" };
  } catch (error) {
    console.error("SMS notification error:", error);
    return { success: false, message: "网络错误" };
  }
}
