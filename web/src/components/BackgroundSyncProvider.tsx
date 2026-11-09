"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  OutboxItem, 
  addOutboxItem, 
  updateOutboxItem, 
  removeOutboxItem, 
  getOutboxItems 
} from '@/lib/offlineDb';
import { uploadFileToGoogleDrive } from '@/lib/driveUpload';

interface BackgroundSyncContextType {
  isOnline: boolean;
  queue: OutboxItem[];
  enqueueLogUpload: (params: {
    logData: any;
    videoFile?: File | null;
  }) => Promise<string>;
  enqueueTaskCompletion: (params: {
    taskId: string;
    logData: any;
    videoFile?: File | null;
  }) => Promise<string>;
  enqueueTaskStatusUpdate: (params: {
    taskId: string;
    nextStatus: string;
  }) => Promise<string>;
  retryUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  pendingCount: number;
}

const BackgroundSyncContext = createContext<BackgroundSyncContextType>({
  isOnline: true,
  queue: [],
  enqueueLogUpload: async () => '',
  enqueueTaskCompletion: async () => '',
  enqueueTaskStatusUpdate: async () => '',
  retryUpload: () => {},
  cancelUpload: () => {},
  pendingCount: 0,
});

export function useBackgroundSync() {
  return useContext(BackgroundSyncContext);
}

export function BackgroundSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<OutboxItem[]>([]);
  const [isTrayMinimized, setIsTrayMinimized] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const isProcessingRef = useRef(false);

  // Show transient toast notification
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // 1. Monitor online / offline status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      showToast('📶 Connection restored. Syncing offline changes...', 'success');
      // Trigger background outbox draining
      processNextInQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('⚠️ Offline Mode: Changes will be saved locally and uploaded when connected.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial hydration of existing outbox items from IndexedDB
    getOutboxItems().then((items) => {
      setQueue(items);
      if (items.length > 0 && navigator.onLine) {
        processNextInQueue();
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // 2. Process a single outbox item in the background
  const processItem = async (item: OutboxItem) => {
    try {
      // Mark as uploading
      await updateOutboxItem(item.id, { 
        status: 'uploading', 
        statusMessage: 'Initiating background sync...',
        progress: 5 
      });
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'uploading', progress: 5 } : q));

      let videoUrl = item.payload.videoUrl || '';
      let driveFileId = item.payload.driveFileId;

      // Step A: If there is an attached video file/blob, stream to Google Drive
      if (item.fileBlob) {
        const file = new File([item.fileBlob], item.fileName || 'evidence.mp4', {
          type: item.fileType || 'video/mp4',
        });
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

        const uploadRes = await uploadFileToGoogleDrive({
          file,
          teamName: item.payload.teamName || item.payload.teamId || 'squad',
          stepTitle: item.payload.stepTitle || 'Verification Video',
          onProgress: (p) => {
            const mappedProgress = Math.round(5 + (p * 0.85)); // 5% -> 90%
            let statusText = `Streaming ${sizeMb} MB to Drive (${p}%)...`;
            if (p < 10) statusText = 'Creating Google Drive session...';
            if (p >= 95) statusText = 'Finalizing Drive permissions...';

            updateOutboxItem(item.id, { progress: mappedProgress, statusMessage: statusText });
            setQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: mappedProgress, statusMessage: statusText } : q))
            );
          },
        });

        if (!uploadRes.success) {
          throw new Error(uploadRes.error || 'Failed to upload video to Google Drive');
        }

        videoUrl = uploadRes.embedUrl || uploadRes.viewUrl || '';
        driveFileId = uploadRes.fileId;
      }

      // Step B: Dispatch to Server & Cloud Firestore
      await updateOutboxItem(item.id, { progress: 92, statusMessage: 'Syncing record to Cloud Database...' });
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, progress: 92, statusMessage: 'Saving record...' } : q));

      if (item.type === 'CREATE_LOG') {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...item.payload,
            videoUrl,
            driveFileId,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to record log');

        // Notify app
        window.dispatchEvent(new CustomEvent('siep_log_synced', { detail: data.log }));
        showToast(`✓ Step #${data.log?.stepNumber || ''} published & synced!`, 'success');

      } else if (item.type === 'COMPLETE_TASK_WITH_VIDEO') {
        // 1. Create completion log
        const logRes = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...item.payload.logData,
            videoUrl,
            driveFileId,
          }),
        });
        const logData = await logRes.json();

        // 2. Advance task status to done
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.payload.taskId,
            status: 'done',
          }),
        });

        window.dispatchEvent(new CustomEvent('siep_task_synced', { detail: { taskId: item.payload.taskId } }));
        showToast(`✓ Task completed & verified with video evidence!`, 'success');

      } else if (item.type === 'UPDATE_TASK_STATUS') {
        await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.payload.taskId,
            status: item.payload.nextStatus,
          }),
        });
        window.dispatchEvent(new CustomEvent('siep_task_synced', { detail: { taskId: item.payload.taskId } }));
      }

      // Step C: Cleanup completed item
      await removeOutboxItem(item.id);
      setQueue((prev) => prev.filter((q) => q.id !== item.id));

    } catch (err: any) {
      console.error('Background sync failed for item:', item.id, err);
      const errorMsg = err?.message || 'Sync failed';
      await updateOutboxItem(item.id, { 
        status: 'failed', 
        error: errorMsg,
        statusMessage: `Failed: ${errorMsg}` 
      });
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'failed', error: errorMsg } : q))
      );
      showToast(`Upload failed: ${errorMsg}. Tap retry in upload tray.`, 'error');
    }
  };

  // 3. Queue processor (FIFO loop)
  const processNextInQueue = useCallback(async () => {
    if (isProcessingRef.current || !navigator.onLine) return;

    const items = await getOutboxItems();
    const pendingItem = items.find((i) => i.status === 'queued' || i.status === 'uploading');

    if (!pendingItem) {
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = true;
    await processItem(pendingItem);
    isProcessingRef.current = false;

    // Recurse to next pending item
    processNextInQueue();
  }, []);

  // 4. Enqueue API functions
  const enqueueLogUpload = async ({
    logData,
    videoFile,
  }: {
    logData: any;
    videoFile?: File | null;
  }): Promise<string> => {
    const id = `outbox-log-${Date.now()}`;
    const outboxItem: OutboxItem = {
      id,
      type: 'CREATE_LOG',
      payload: logData,
      fileBlob: videoFile || undefined,
      fileName: videoFile?.name,
      fileType: videoFile?.type,
      status: 'queued',
      progress: 0,
      statusMessage: 'Queued for upload...',
      createdAt: Date.now(),
    };

    await addOutboxItem(outboxItem);
    setQueue((prev) => [...prev, outboxItem]);

    showToast(
      videoFile 
        ? `⚡ Uploading "${logData.stepTitle}" in background...`
        : navigator.onLine 
          ? `⚡ Publishing log in background...` 
          : `Saved offline. Will upload when connected.`,
      'info'
    );

    if (navigator.onLine) {
      setTimeout(() => processNextInQueue(), 100);
    }

    return id;
  };

  const enqueueTaskCompletion = async ({
    taskId,
    logData,
    videoFile,
  }: {
    taskId: string;
    logData: any;
    videoFile?: File | null;
  }): Promise<string> => {
    const id = `outbox-complete-${Date.now()}`;
    const outboxItem: OutboxItem = {
      id,
      type: 'COMPLETE_TASK_WITH_VIDEO',
      payload: { taskId, logData },
      fileBlob: videoFile || undefined,
      fileName: videoFile?.name,
      fileType: videoFile?.type,
      status: 'queued',
      progress: 0,
      statusMessage: 'Queued for completion & video sync...',
      createdAt: Date.now(),
    };

    await addOutboxItem(outboxItem);
    setQueue((prev) => [...prev, outboxItem]);

    showToast('⚡ Task completed! Syncing video verification in background...', 'info');

    if (navigator.onLine) {
      setTimeout(() => processNextInQueue(), 100);
    }

    return id;
  };

  const enqueueTaskStatusUpdate = async ({
    taskId,
    nextStatus,
  }: {
    taskId: string;
    nextStatus: string;
  }): Promise<string> => {
    const id = `outbox-status-${Date.now()}`;
    const outboxItem: OutboxItem = {
      id,
      type: 'UPDATE_TASK_STATUS',
      payload: { taskId, nextStatus },
      status: 'queued',
      progress: 0,
      statusMessage: 'Queued status update...',
      createdAt: Date.now(),
    };

    await addOutboxItem(outboxItem);
    setQueue((prev) => [...prev, outboxItem]);

    if (navigator.onLine) {
      setTimeout(() => processNextInQueue(), 50);
    }

    return id;
  };

  const retryUpload = async (id: string) => {
    await updateOutboxItem(id, { status: 'queued', error: undefined, progress: 0 });
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: 'queued', error: undefined } : q));
    processNextInQueue();
  };

  const cancelUpload = async (id: string) => {
    await removeOutboxItem(id);
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  const pendingCount = queue.length;
  const activeItem = queue.find((q) => q.status === 'uploading') || queue[0];

  return (
    <BackgroundSyncContext.Provider
      value={{
        isOnline,
        queue,
        enqueueLogUpload,
        enqueueTaskCompletion,
        enqueueTaskStatusUpdate,
        retryUpload,
        cancelUpload,
        pendingCount,
      }}
    >
      {children}

      {/* =========================================================================
          GLOBAL TOAST NOTIFICATION
         ========================================================================= */}
      {notification && (
        <div className="fixed top-20 right-4 sm:right-8 z-[9999] animate-bounce-short pointer-events-none">
          <div className={`px-4 py-3 rounded-2xl shadow-xl font-mono text-xs flex items-center gap-2.5 backdrop-blur-md border ${
            notification.type === 'success' 
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' 
              : notification.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-500/40'
              : 'bg-jet-black/90 text-alice-blue border-orange/40'
          }`}>
            <span>{notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          FLOATING BACKGROUND UPLOAD & OFFLINE TRAY WIDGET
         ========================================================================= */}
      {queue.length > 0 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[990] animate-fade-in pointer-events-auto max-w-sm w-full sm:w-88">
          
          {/* Minimized Pill */}
          {isTrayMinimized ? (
            <button
              type="button"
              onClick={() => setIsTrayMinimized(false)}
              className="ml-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-jet-black/95 text-alice-blue border border-orange/50 shadow-2xl hover:scale-105 transition-all cursor-pointer font-mono text-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
              <span>
                {queue.some((q) => q.status === 'uploading') 
                  ? `Uploading (${activeItem?.progress || 0}%)` 
                  : `${queue.length} in Sync Queue`}
              </span>
              <span className="text-[10px] bg-orange text-jet-black font-black px-1.5 py-0.2 rounded-full">
                {queue.length}
              </span>
            </button>
          ) : (
            /* Expanded Tray */
            <div className="bg-jet-black/95 backdrop-blur-md text-alice-blue rounded-3xl p-4 sm:p-5 shadow-2xl border border-orange/40 space-y-3">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-orange animate-pulse' : 'bg-amber-400'}`}></span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    {isOnline ? 'Background Upload Center' : 'Offline Sync Queue'}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-orange font-bold">
                    {queue.length} pending
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsTrayMinimized(true)}
                    className="w-6 h-6 rounded-lg text-grey hover:text-white flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
                    title="Minimize"
                  >
                    _
                  </button>
                </div>
              </div>

              {/* Offline Warning Banner */}
              {!isOnline && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px] font-mono flex items-center gap-2">
                  <span>📶</span>
                  <span>Currently offline. Files queued to upload automatically when signal returns.</span>
                </div>
              )}

              {/* Active / Queued Items List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {queue.map((item) => {
                  const isItemUploading = item.status === 'uploading';
                  const isItemFailed = item.status === 'failed';

                  return (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="font-bold text-white truncate text-xs">
                            {item.payload.stepTitle || item.fileName || 'Workshop Deliverable'}
                          </div>
                          <div className="text-[10px] text-grey truncate">
                            {item.fileName ? `📁 ${item.fileName} • ` : ''}
                            {item.statusMessage || (item.status === 'queued' ? 'Queued' : item.status)}
                          </div>
                        </div>

                        {/* Status Icon / Actions */}
                        <div className="shrink-0 flex items-center gap-1.5">
                          {isItemFailed && (
                            <button
                              type="button"
                              onClick={() => retryUpload(item.id)}
                              className="px-2 py-1 rounded bg-orange text-jet-black font-bold text-[10px] uppercase hover:bg-orange/90 transition-all cursor-pointer"
                            >
                              Retry
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => cancelUpload(item.id)}
                            className="text-grey hover:text-red-400 p-1 text-[11px] transition-colors cursor-pointer"
                            title="Cancel upload"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isItemFailed
                                ? 'bg-red-500'
                                : isItemUploading
                                ? 'bg-orange'
                                : 'bg-white/30'
                            }`}
                            style={{ width: `${item.progress || (isItemUploading ? 10 : 0)}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-grey">
                          <span>{item.status.toUpperCase()}</span>
                          <span>{item.progress || 0}%</span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Footer Note */}
              <p className="text-[10px] font-mono text-grey text-center pt-1">
                You can browse any page freely. Uploads persist in the background.
              </p>

            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          PERSISTENT OFFLINE STATUS PILL (When disconnected and no items in queue)
         ========================================================================= */}
      {!isOnline && queue.length === 0 && (
        <div className="fixed bottom-4 left-4 z-[990] animate-fade-in pointer-events-auto">
          <div className="px-3 py-1.5 rounded-full bg-amber-500 text-jet-black font-mono font-bold text-[11px] shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-jet-black animate-ping"></span>
            <span>Offline Mode Active</span>
          </div>
        </div>
      )}
    </BackgroundSyncContext.Provider>
  );
}
