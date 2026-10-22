import { videoFoldersMock } from './videoFoldersMock';

const videoTemplates = [
  { area: 'C구역', title: '야간점검', time: '17:40', durationSeconds: 328 },
  { area: 'A구역', title: '설비점검', time: '16:25', durationSeconds: 484 },
  { area: 'C구역', title: '저장구역', time: '15:18', durationSeconds: 596 },
  { area: 'B구역', title: '순찰', time: '14:05', durationSeconds: 392 },
  { area: 'A구역', title: '통로점검', time: '13:20', durationSeconds: 491 },
  { area: 'C구역', title: '작업장', time: '11:02', durationSeconds: 848 },
  { area: 'B구역', title: '설비실', time: '10:15', durationSeconds: 463 },
  { area: 'A구역', title: '순찰', time: '09:32', durationSeconds: 621 },
  { area: 'C구역', title: '출입구', time: '08:48', durationSeconds: 274 },
  { area: 'B구역', title: '자재점검', time: '07:55', durationSeconds: 713 },
  { area: 'A구역', title: '작업전점검', time: '07:10', durationSeconds: 359 },
  { area: 'B구역', title: '안전점검', time: '06:35', durationSeconds: 542 },
];

function distribute(total, index, slotCount) {
  if (index >= slotCount || slotCount === 0) return 0;
  return Math.floor(total / slotCount) + (index < total % slotCount ? 1 : 0);
}

export function getVideoItems(date) {
  const folder = videoFoldersMock.find(item => item.date === date);
  if (!folder) return [];

  return Array.from({ length: folder.videoCount }, (_, index) => {
    const template = videoTemplates[index % videoTemplates.length];
    const sequence = String(folder.videoCount - index).padStart(2, '0');
    const failedEnd = folder.analyzedCount + folder.analysisFailedCount;
    const analysisStatus = index < folder.analyzedCount
      ? 'complete'
      : index < failedEnd ? 'failed' : 'processing';

    return {
      id: `${date}-${sequence}`,
      fileName: `${template.area}_${template.title}_${sequence}.mp4`,
      area: template.area,
      recordedAt: `${date} ${template.time}`,
      durationSeconds: template.durationSeconds,
      analysisStatus,
      riskIssueCount: analysisStatus === 'complete' ? distribute(folder.riskIssueCount, index, folder.analyzedCount) : 0,
      highRiskCount: analysisStatus === 'complete' ? distribute(folder.highRiskCount, index, folder.analyzedCount) : 0,
      unresolvedRiskCount: analysisStatus === 'complete' ? distribute(folder.unresolvedCount, index, folder.analyzedCount) : 0,
      thumbnailIndex: index % 3,
    };
  });
}
