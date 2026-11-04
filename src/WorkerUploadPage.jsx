import { useEffect, useRef, useState } from 'react';
import AppIcon from './components/AppIcon';
import { workerMock } from './data/workerMock';

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function WorkerUploadPage() {
  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const [areaId, setAreaId] = useState('');
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const isUploading = progress > 0 && progress < 100;

  useEffect(() => () => window.clearInterval(intervalRef.current), []);

  function selectFiles(event) {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(currentFiles => {
      const existingKeys = new Set(
        currentFiles.map(file => `${file.name}-${file.size}-${file.lastModified}`),
      );
      const newFiles = selectedFiles.filter(file => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (existingKeys.has(key)) return false;
        existingKeys.add(key);
        return true;
      });
      return [...currentFiles, ...newFiles];
    });
    setProgress(0);
    setMessage('');
    event.target.value = '';
  }

  function removeFile(index) {
    setFiles(currentFiles => currentFiles.filter((_, fileIndex) => fileIndex !== index));
    setProgress(0);
    setMessage('');
  }

  function startMockUpload() {
    if (!areaId) {
      setMessage('촬영 구역을 먼저 선택해 주세요.');
      return;
    }
    if (files.length === 0) {
      setMessage('업로드할 동영상을 한 개 이상 선택해 주세요.');
      return;
    }

    setMessage('');
    setProgress(8);
    window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setProgress(current => {
        const next = Math.min(100, current + 17);
        if (next === 100) {
          window.clearInterval(intervalRef.current);
          setMessage(`${files.length}개 영상 업로드가 완료되어 AI 분석을 시작했습니다. (목업)`);
        }
        return next;
      });
    }, 220);
  }

  return (
    <section aria-labelledby="worker-upload-title">
      <h1 id="worker-upload-title" className="mt-1 text-[28px] font-black tracking-[-1.2px]">동영상 업로드</h1>

      <div className="mt-6 rounded-[26px] bg-white p-5">
        <label className="block text-[14px] font-extrabold" htmlFor="upload-area">촬영 구역</label>
        <select id="upload-area" className={`mt-2 h-12 w-full rounded-2xl border border-[#dde4e7] bg-[#f8fafb] px-4 text-[14px] font-semibold outline-none focus:border-app-accent disabled:opacity-60 ${areaId ? 'text-[#14232e]' : 'text-[#89939a]'}`} value={areaId} disabled={isUploading} onChange={event => { setAreaId(event.target.value); setMessage(''); }}>
          <option value="">촬영 구역을 선택하세요</option>
          {workerMock.areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
        </select>

        <input ref={inputRef} className="sr-only" type="file" accept="video/*" multiple disabled={isUploading} onChange={selectFiles} />
        <button className="mt-5 flex min-h-[190px] w-full flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#d8e0e4] bg-[#f8fafb] px-5 text-center transition-colors hover:border-app-accent disabled:cursor-wait disabled:opacity-60" type="button" disabled={isUploading} onClick={() => inputRef.current?.click()}>
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[#fff0e5] text-app-accent"><AppIcon name="uploadCloud" className="h-8 w-8" strokeWidth={2} /></span>
          <span className="mt-4 text-[16px] font-black">{files.length > 0 ? `동영상 ${files.length}개 선택됨` : '동영상 여러 개 선택'}</span>
          <span className="mt-1 whitespace-pre-line text-[12px] leading-5 text-[#849099]">{files.length > 0 ? `총 ${formatBytes(files.reduce((total, file) => total + file.size, 0))}\n눌러서 동영상을 더 추가할 수 있습니다.` : '휴대폰에 저장된 동영상을\n한 번에 여러 개 선택할 수 있습니다.'}</span>
        </button>

        {files.length > 0 && (
          <ul className="mt-4 space-y-2" aria-label="선택된 동영상">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-3 rounded-2xl bg-[#f5f7f8] px-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#64717a]"><AppIcon name="video" className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-bold">{file.name}</span><span className="mt-0.5 block text-[11px] text-[#8a949b]">{formatBytes(file.size)}</span></span>
                <button className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#78848c] hover:bg-white hover:text-[#d65d21] disabled:cursor-wait disabled:opacity-40" type="button" aria-label={`${file.name} 제거`} disabled={isUploading} onClick={() => removeFile(index)}><AppIcon name="close" className="h-5 w-5" /></button>
              </li>
            ))}
          </ul>
        )}

        {progress > 0 && (
          <div className="mt-5" aria-label={`업로드 ${progress}%`}>
            <div className="mb-2 flex justify-between text-[12px] font-bold"><span>{files.length}개 영상 업로드 중</span><span className="text-app-accent">{progress}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eef1f3]"><div className="h-full rounded-full bg-app-accent transition-[width]" style={{ width: `${progress}%` }} /></div>
          </div>
        )}

        <button className="mt-5 h-14 w-full rounded-2xl bg-app-accent text-[16px] font-black text-white transition-colors hover:bg-app-accent-dark disabled:cursor-wait disabled:opacity-60" type="button" disabled={isUploading} onClick={startMockUpload}>업로드 시작</button>
        {message && <p className={`mt-3 text-center text-[13px] font-semibold ${progress === 100 ? 'text-[#25815a]' : 'text-[#d25b24]'}`} role="status">{message}</p>}
      </div>

    </section>
  );
}
