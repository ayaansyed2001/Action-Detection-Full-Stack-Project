import cv2
import torch
import torchvision.transforms as transforms
from torchvision.models.video import r3d_18, R3D_18_Weights

class ActionDetector:
    def __init__(self):
        
        self.weights = R3D_18_Weights.DEFAULT
        self.model = r3d_18(weights=self.weights)
        self.model.eval()
        
        self.preprocess = self.weights.transforms()
        self.categories = self.weights.meta["categories"]
    
    def process_video(self, video_path):
        """Process video and detect actions"""
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        detections = []
        frames_buffer = []
        frame_idx = 0
        clip_len = 16  
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames_buffer.append(frame)
            
            
            if len(frames_buffer) == clip_len:
                timestamp = frame_idx / fps
                action, confidence = self.predict_action(frames_buffer)
                
                detections.append({
                    'timestamp': timestamp,
                    'action_label': action,
                    'confidence': confidence
                })
                
                
                frames_buffer = frames_buffer[8:]
            
            frame_idx += 1
        
        cap.release()
        return detections
    
    def predict_action(self, frames):
        """Predict action from frames"""
       
        frames_tensor = torch.stack([transforms.ToTensor()(frame) for frame in frames])

        
        frames_tensor = self.preprocess(frames_tensor)

        
        batch = frames_tensor.unsqueeze(0)

        with torch.no_grad():
            prediction = self.model(batch)
            probabilities = torch.nn.functional.softmax(prediction, dim=1)
            confidence, idx = torch.max(probabilities, 1)

        action_label = self.categories[idx.item()]
        confidence_score = confidence.item()

        return action_label, confidence_score
