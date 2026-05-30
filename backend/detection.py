"""
EcoSwap Object Detection
========================
Detects water bottles and aluminum cans using YOLOv8.

Priority order:
  1. Custom trained model (models/best.pt) — best accuracy for crumpled items.
  2. COCO pretrained yolov8n.pt — works out of the box; uses aspect-ratio
     heuristic to separate bottles from cans since COCO has no "can" class.
  3. Mock detector — random results; useful when no GPU/model is available.

For reliable detection of crumpled items, train a custom model with:
  - Crushed / crumpled PET water bottles (various orientations)
  - Crushed / crumpled aluminum cans (various orientations)
  - Negative samples (random objects to be rejected)
See ml/ directory for training scripts.
"""

import logging
import os
from dataclasses import dataclass, field
from typing import Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger("ecoswap.detection")

# COCO dataset class index for "bottle"
_COCO_BOTTLE = 39


@dataclass
class DetectionResult:
    label: str                                     # "BOTTLE" | "CAN" | "UNKNOWN"
    confidence: float
    bbox: Optional[Tuple[int, int, int, int]] = field(default=None)  # x1,y1,x2,y2


class EcoSwapDetector:
    def __init__(self, model_path: str = "models/best.pt",
                 confidence: float = 0.65) -> None:
        self.confidence = confidence
        self._model = None
        self._custom = False
        self._load_model(model_path)

    # ── Model loading ─────────────────────────────────────────────────────────

    def _load_model(self, model_path: str) -> None:
        try:
            from ultralytics import YOLO  # type: ignore
            if os.path.exists(model_path):
                self._model = YOLO(model_path)
                self._custom = True
                logger.info("Loaded custom EcoSwap model: %s", model_path)
            else:
                self._model = YOLO("yolov8n.pt")  # auto-downloads on first run
                self._custom = False
                logger.info("Custom model not found at %s — using COCO yolov8n.pt", model_path)
        except ImportError:
            logger.warning("ultralytics not installed — using mock detector")
        except Exception as exc:
            logger.error("Model load failed: %s — using mock detector", exc)

    # ── Public API ────────────────────────────────────────────────────────────

    def detect(self, frame: np.ndarray) -> DetectionResult:
        if self._model is None:
            return self._mock_detect()
        try:
            results = self._model(frame, verbose=False)[0]
            return self._parse_results(results)
        except Exception as exc:
            logger.error("Inference error: %s", exc)
            return DetectionResult(label="UNKNOWN", confidence=0.0)

    def draw_detection(self, frame: np.ndarray,
                       result: DetectionResult) -> np.ndarray:
        """Overlay bounding box and label on frame (in-place copy)."""
        out = frame.copy()
        if result.bbox is not None:
            x1, y1, x2, y2 = result.bbox
            color = (34, 197, 94) if result.label == "BOTTLE" else \
                    (74, 222, 128) if result.label == "CAN" else \
                    (239, 68, 68)
            cv2.rectangle(out, (x1, y1), (x2, y2), color, 2)
            txt = f"{result.label}  {result.confidence:.0%}"
            cv2.putText(out, txt, (x1, max(y1 - 8, 12)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, color, 2,
                        cv2.LINE_AA)
        return out

    # ── Internals ─────────────────────────────────────────────────────────────

    def _parse_results(self, results) -> DetectionResult:
        if results.boxes is None or len(results.boxes) == 0:
            return DetectionResult(label="UNKNOWN", confidence=0.0)

        best_conf = 0.0
        best_label = "UNKNOWN"
        best_bbox: Optional[Tuple[int, int, int, int]] = None

        for box in results.boxes:
            conf = float(box.conf[0])
            cls  = int(box.cls[0])
            if conf < self.confidence:
                continue

            if self._custom:
                # Custom model: expects class names containing "bottle" or "can"
                name = results.names.get(cls, "").lower()
                if "bottle" in name:
                    label = "BOTTLE"
                elif "can" in name:
                    label = "CAN"
                else:
                    continue
            else:
                # COCO fallback: only "bottle" class (39) is relevant.
                # Distinguish bottle vs can by aspect ratio:
                #   - Bottles are tall and narrow  (aspect h/w > 1.8)
                #   - Cans are shorter and chunkier (aspect h/w ≤ 1.8)
                # NOTE: this heuristic is approximate; a custom model is better.
                if cls != _COCO_BOTTLE:
                    continue
                xyxy = box.xyxy[0].tolist()
                x1, y1, x2, y2 = map(int, xyxy)
                w, h = max(x2 - x1, 1), max(y2 - y1, 1)
                label = "BOTTLE" if (h / w) > 1.8 else "CAN"

            if conf > best_conf:
                best_conf = conf
                best_label = label
                xyxy = box.xyxy[0].tolist()
                best_bbox = tuple(map(int, xyxy))  # type: ignore[assignment]

        return DetectionResult(label=best_label, confidence=best_conf,
                               bbox=best_bbox)

    @staticmethod
    def _mock_detect() -> DetectionResult:
        """Random results — for UI testing without a real model."""
        import random
        r = random.random()
        if r < 0.40:
            return DetectionResult(label="BOTTLE",  confidence=round(random.uniform(0.70, 0.95), 2))
        if r < 0.70:
            return DetectionResult(label="CAN",     confidence=round(random.uniform(0.70, 0.95), 2))
        return DetectionResult(label="UNKNOWN", confidence=round(random.uniform(0.20, 0.55), 2))
