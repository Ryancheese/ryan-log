export type XiaozhiJsonMessage = {
  type?: string;
  state?: string;
  text?: string;
  session_id?: string;
};

export async function parseXiaozhiRaw(
  raw: Blob | ArrayBuffer | string,
): Promise<{ json: XiaozhiJsonMessage | null; binary: Uint8Array | null }> {
  if (typeof raw === "string") {
    if (!raw.trimStart().startsWith("{")) {
      return { json: null, binary: null };
    }
    try {
      return { json: JSON.parse(raw) as XiaozhiJsonMessage, binary: null };
    } catch {
      return { json: null, binary: null };
    }
  }

  const bytes =
    raw instanceof ArrayBuffer ? new Uint8Array(raw) : new Uint8Array(await raw.arrayBuffer());
  const text = new TextDecoder().decode(bytes);
  if (text.trimStart().startsWith("{")) {
    try {
      return { json: JSON.parse(text) as XiaozhiJsonMessage, binary: null };
    } catch {
      return { json: null, binary: bytes };
    }
  }
  return { json: null, binary: bytes };
}
