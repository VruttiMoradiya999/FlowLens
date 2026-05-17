import os
import time
import mss
import cv2
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
import videodb

load_dotenv()

# We need a global variable to keep track of the active state
active_session = False
out_writer = None
video_filename = ""

def start_screen_capture_session():
    """
    1. Records a video of the screen
    2. Updates flowlens_latest.jpg for real-time analysis
    """
    global active_session, out_writer, video_filename
    active_session = True
    session_name = f"flowlens_{datetime.now().strftime('%Y%m%d_%H%M')}"
    print(f"✅ Session started: {session_name}")
    print("👁️  FlowLens is now recording your screen...")

    video_filename = f"/tmp/{session_name}.mp4"
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    
    try:
        with mss.mss() as sct:
            monitor = sct.monitors[1]  # Primary screen
            width = monitor["width"]
            height = monitor["height"]
            
            # Using 5 FPS to balance smoothness and performance
            fps = 5.0
            out_writer = cv2.VideoWriter(video_filename, fourcc, fps, (width, height))
            
            frame_count = 0
            delay = 1.0 / fps

            while active_session:
                start_time = time.time()
                
                # Take a screenshot
                screenshot = sct.grab(monitor)
                frame = np.array(screenshot)
                frame = cv2.cvtColor(frame, cv2.COLOR_BGRA2BGR)
                
                # Write to video
                out_writer.write(frame)
                
                # Save latest frame occasionally for the live analyzer
                if frame_count % int(fps) == 0:
                    cv2.imwrite("/tmp/flowlens_latest.jpg", frame)
                
                frame_count += 1
                
                elapsed = time.time() - start_time
                if elapsed < delay:
                    time.sleep(delay - elapsed)

    except Exception as e:
        print(f"Error in capture: {e}")
        active_session = False
        if out_writer:
            out_writer.release()

def stop_screen_capture_session():
    global active_session, out_writer, video_filename
    print("\n⏹️  Stopping capture...")
    active_session = False
    
    # Wait a tiny bit for the loop to finish
    time.sleep(0.5)
    
    if out_writer:
        out_writer.release()
        out_writer = None
        
    print(f"📁 Video saved to {video_filename}")
    
    # Upload to VideoDB
    print("☁️  Uploading to VideoDB...")
    try:
        conn = videodb.connect(api_key=os.getenv("VIDEODB_API_KEY"))
        coll = conn.get_collection()
        video = coll.upload(file_path=video_filename)
        print(f"✅ Upload successful! Video ID: {video.id}")
        return video.id
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return None

if __name__ == "__main__":
    start_screen_capture_session()