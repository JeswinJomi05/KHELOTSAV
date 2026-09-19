from PIL import Image
import numpy as np

def crop_clouds(img_path, prefix):
    img = Image.open(img_path)
    w, h = img.size
    alpha = np.array(img.split()[-1]) > 10
    
    # Let's find connected components using a simple BFS or box division
    # There are 5 clouds in known regions:
    # 1. Top-Left: x < 0.4*w, y < 0.4*h
    # 2. Top-Right: x > 0.6*w, y < 0.4*h
    # 3. Top-Center/Arch: 0.25*w < x < 0.6*w, 0.1*h < y < 0.5*h
    # 4. Bottom-Left: x < 0.5*w, y > 0.5*h
    # 5. Bottom-Right: x > 0.5*w, y > 0.5*h
    
    regions = {
        'tl': (0, 0, int(w * 0.35), int(h * 0.4)),
        'tr': (int(w * 0.65), 0, w, int(h * 0.4)),
        'top_center': (int(w * 0.25), int(h * 0.1), int(w * 0.6), int(h * 0.5)),
        'bl': (0, int(h * 0.5), int(w * 0.5), h),
        'br': (int(w * 0.5), int(h * 0.5), w, h)
    }
    
    for name, box in regions.items():
        crop = img.crop(box)
        bbox = crop.getbbox()
        if bbox:
            cropped = crop.crop(bbox)
            out_path = f"frontend/src/assets/Home/{prefix}_{name}.png"
            cropped.save(out_path)
            print(f"Saved {out_path}, size: {cropped.size}")

crop_clouds('frontend/assets/Home/clouds.png', 'cloud_yellow')
crop_clouds('frontend/src/assets/Home/clouds_blue.png', 'cloud_blue')
