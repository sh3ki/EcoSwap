import cv2
import threading
import numpy as np
from typing import Optional


class Camera:
    """Thread-safe webcam wrapper. Runs a background capture loop."""

    def __init__(self, index: int = 0) -> None:
        self.index = index
        self._cap: Optional[cv2.VideoCapture] = None
        self._frame: Optional[np.ndarray] = None
        self._lock = threading.Lock()
        self._running = False
        self._thread: Optional[threading.Thread] = None

    # ── Lifecycle ─────────────────────────────────────────────────────────────

    def start(self) -> None:
        self._running = True
        self._cap = cv2.VideoCapture(self.index)
        if self._cap.isOpened():
            self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self._cap.set(cv2.CAP_PROP_FPS, 30)
        self._thread = threading.Thread(target=self._capture_loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._running = False
        if self._cap:
            self._cap.release()

    # ── Internal ──────────────────────────────────────────────────────────────

    def _capture_loop(self) -> None:
        while self._running:
            if self._cap and self._cap.isOpened():
                ret, frame = self._cap.read()
                if ret:
                    with self._lock:
                        self._frame = frame

    # ── Public API ────────────────────────────────────────────────────────────

    def get_frame(self) -> Optional[np.ndarray]:
        """Return the most recent frame (non-blocking, may return None)."""
        with self._lock:
            if self._frame is None:
                return None
            return self._frame.copy()

    def capture_snapshot(self) -> Optional[np.ndarray]:
        """Alias of get_frame — grab a fresh frame for AI inference."""
        return self.get_frame()

    @property
    def is_available(self) -> bool:
        return (
            self._cap is not None
            and self._cap.isOpened()
            and self._frame is not None
        )
