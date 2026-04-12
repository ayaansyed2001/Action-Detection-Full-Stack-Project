import os

import cv2
import torch
import torchvision.transforms as transforms
from torchvision.models.video import R3D_18_Weights, r3d_18


torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))


class ActionDetector:
    def __init__(self):
        self.weights = R3D_18_Weights.DEFAULT
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = r3d_18(weights=self.weights).to(self.device)
        self.model.eval()

        self.preprocess = self.weights.transforms()
        self.categories = self.weights.meta['categories']
        self.clip_len = 16
        self.stride = 12
        self.min_confidence = 0.2
        self.merge_window_seconds = 1.5
        self.target_analysis_fps = 4.0
        self.preferred_action_keywords = {
            'walk',
            'run',
            'jump',
            'sit',
            'stand',
            'climb',
            'fall',
            'fight',
            'throw',
            'catch',
            'push',
            'pull',
            'kick',
            'punch',
            'wave',
            'dance',
            'turn',
            'pick',
            'open',
            'close',
            'ride',
            'shoot',
            'swing',
            'hit',
        }

    def process_video(self, video_path):
        """Process video and return stable action detections."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f'Unable to open video file: {video_path}')

        fps = cap.get(cv2.CAP_PROP_FPS)
        if not fps or fps <= 0:
            fps = 30.0

        detections = []
        raw_detections = []
        frames_buffer = []
        sampled_frame_numbers = []
        frame_idx = 0
        frame_interval = max(1, int(round(fps / self.target_analysis_fps)))

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_idx % frame_interval != 0:
                    frame_idx += 1
                    continue

                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames_buffer.append(frame)
                sampled_frame_numbers.append(frame_idx)

                if len(frames_buffer) < self.clip_len:
                    frame_idx += 1
                    continue

                window_frames = frames_buffer[-self.clip_len :]
                window_frame_numbers = sampled_frame_numbers[-self.clip_len :]
                midpoint_frame_idx = window_frame_numbers[len(window_frame_numbers) // 2]
                timestamp = max(0.0, midpoint_frame_idx / fps)
                action, confidence = self.predict_action(window_frames)
                prediction = {
                    'timestamp': round(timestamp, 3),
                    'action_label': action,
                    'confidence': round(confidence, 4),
                }
                raw_detections.append(prediction)

                if confidence >= self.min_confidence:
                    detections.append(prediction)

                frames_buffer = frames_buffer[self.stride :]
                sampled_frame_numbers = sampled_frame_numbers[self.stride :]
                frame_idx += 1
        finally:
            cap.release()

        if not detections and raw_detections:
            strongest_prediction = max(raw_detections, key=lambda item: item['confidence'])
            detections.append(strongest_prediction)

        if not detections and frames_buffer:
            padded_frames = self._pad_frames(frames_buffer, self.clip_len)
            reference_frame_numbers = sampled_frame_numbers or [0]
            midpoint_frame_idx = reference_frame_numbers[len(reference_frame_numbers) // 2]
            action, confidence = self.predict_action(padded_frames)
            detections.append(
                {
                    'timestamp': round(max(0.0, midpoint_frame_idx / fps), 3),
                    'action_label': action,
                    'confidence': round(confidence, 4),
                }
            )

        merged_detections = self._merge_nearby_detections(detections)
        if merged_detections:
            return merged_detections

        strongest_predictions = sorted(raw_detections, key=lambda item: item['confidence'], reverse=True)[:5]
        strongest_predictions.sort(key=lambda item: item['timestamp'])
        return self._merge_nearby_detections(strongest_predictions)

    def predict_action(self, frames):
        """Predict the most likely action from a clip of frames."""
        frames_tensor = torch.stack([transforms.ToTensor()(frame) for frame in frames])
        frames_tensor = self.preprocess(frames_tensor)
        batch = frames_tensor.unsqueeze(0).to(self.device)

        with torch.no_grad():
            prediction = self.model(batch)
            probabilities = torch.nn.functional.softmax(prediction, dim=1)
            top_probabilities, top_indices = torch.topk(probabilities, k=min(3, probabilities.shape[1]), dim=1)

        top_probabilities = top_probabilities[0].cpu()
        top_indices = top_indices[0].cpu()

        best_idx = top_indices[0].item()
        best_confidence = top_probabilities[0].item()

        for probability, index in zip(top_probabilities.tolist(), top_indices.tolist()):
            candidate_label = self.categories[index]
            if self._is_preferred_action_label(candidate_label):
                best_idx = index
                best_confidence = probability
                break

        if len(top_probabilities) > 1:
            margin = top_probabilities[0].item() - top_probabilities[1].item()
            if margin < 0.08:
                best_confidence *= 0.9

        action_label = self.categories[best_idx]
        return action_label, best_confidence

    def _is_preferred_action_label(self, label):
        normalized_label = label.lower()
        return any(keyword in normalized_label for keyword in self.preferred_action_keywords)

    def _pad_frames(self, frames, target_length):
        if len(frames) >= target_length:
            return frames[-target_length:]

        if not frames:
            raise ValueError('No frames available for action detection')

        padded_frames = list(frames)
        last_frame = frames[-1]
        while len(padded_frames) < target_length:
            padded_frames.append(last_frame)
        return padded_frames

    def _merge_nearby_detections(self, detections):
        """Collapse repeated adjacent predictions into a cleaner timeline."""
        if not detections:
            return []

        merged = [detections[0].copy()]

        for detection in detections[1:]:
            previous = merged[-1]
            same_action = detection['action_label'] == previous['action_label']
            close_in_time = (detection['timestamp'] - previous['timestamp']) <= self.merge_window_seconds

            if same_action and close_in_time:
                if detection['confidence'] > previous['confidence']:
                    previous['timestamp'] = detection['timestamp']
                    previous['confidence'] = detection['confidence']
                continue

            merged.append(detection.copy())

        return merged
