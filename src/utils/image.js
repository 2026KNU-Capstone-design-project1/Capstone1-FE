function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('이미지 엘리먼트가 Blob을 디코딩하지 못했습니다.'));
    image.src = src;
  });
}

async function decodeImage(blob) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob);
    } catch {
      // Some browsers cannot decode a supported image through ImageBitmap.
      // Fall back to an object URL before treating the S3 object as invalid.
    }
  }

  const objectUrl = URL.createObjectURL(blob);

  try {
    return await loadImageElement(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function describeInvalidImage(blob) {
  const headerBytes = new Uint8Array(await blob.slice(0, 80).arrayBuffer());
  const headerText = new TextDecoder().decode(headerBytes).trimStart();

  if (headerText.startsWith('--')) {
    return 'S3 객체에 이미지 원문 대신 multipart/FormData 본문이 저장되어 있습니다.';
  }
  if (headerText.startsWith('data:image/') || headerText.startsWith('/9j/') || headerText.startsWith('iVBOR')) {
    return 'S3 객체에 이미지 바이너리 대신 Base64 문자열이 저장되어 있습니다.';
  }
  if (headerText.startsWith('<?xml') || headerText.startsWith('<Error') || headerText.startsWith('<!DOCTYPE') || headerText.startsWith('<html')) {
    return 'S3가 이미지 대신 XML/HTML 응답을 반환했습니다.';
  }
  if (headerText.startsWith('{') || headerText.startsWith('[')) {
    return '이미지 URL이 JSON 데이터를 반환했습니다.';
  }

  const signature = Array.from(headerBytes.slice(0, 12), byte => byte.toString(16).padStart(2, '0')).join(' ');
  return `지원되는 이미지 바이트가 아닙니다. (Content-Type: ${blob.type || '없음'}, 크기: ${blob.size} bytes, 헤더: ${signature || '없음'})`;
}

function normalizeImageSource(src) {
  return String(src)
    .replace(/^https\\:\/\//i, 'https://')
    .replace(/^http\\:\/\//i, 'http://');
}

function displayResponseUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    return `${url.origin}${url.pathname}`;
  } catch {
    return String(value).split('?')[0];
  }
}

export async function loadPdfImage(src, options = {}) {
  const requestUrl = normalizeImageSource(src);
  const response = await fetch(requestUrl, { signal: options.signal });

  if (!response.ok) {
    throw new Error(`보고서 이미지 요청에 실패했습니다. (HTTP ${response.status})`);
  }

  const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error(`이미지 요청이 ${contentType} 문서를 반환했습니다. (응답 주소: ${displayResponseUrl(response.url || requestUrl)})`);
  }

  const blob = await response.blob();
  let image;

  try {
    image = await decodeImage(blob);
  } catch {
    throw new Error(`이미지를 디코딩하지 못했습니다. ${await describeInvalidImage(blob)}`);
  }

  try {
    const width = image.naturalWidth ?? image.width;
    const height = image.naturalHeight ?? image.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('보고서 이미지를 변환하지 못했습니다.');

    context.drawImage(image, 0, 0);

    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.92),
      width,
      height,
    };
  } finally {
    image.close?.();
  }
}
