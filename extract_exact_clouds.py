from PIL import Image
import numpy as np
from collections import deque

def extract_connected_components(img_path, prefix):
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size
    alpha = np.array(img.split()[-1]) > 20
    
    visited = np.zeros((h, w), dtype=bool)
    components = []
    
    # We want to find components with area > 1000 pixels
    for y in range(0, h, 4):
        for x in range(0, w, 4):
            if alpha[y, x] and not visited[y, x]:
                # BFS
                q = deque([(y, x)])
                visited[y, x] = True
                min_x, max_x = x, x
                min_y, max_y = y, y
                pixels = 0
                
                while q:
                    cy, cx = q.popleft()
                    pixels += 1
                    min_x = min(min_x, cx)
                    max_x = max(max_x, cx)
                    min_y = min(min_y, cy)
                    max_y = max(max_y, cy)
                    
                    for dy, dx in [(-2,0), (2,0), (0,-2), (0,2)]:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and alpha[ny, nx] and not visited[ny, nx]:
                            visited[ny, nx] = True
                            q.append((ny, nx))
                            
                if pixels > 500:
                    components.append((min_x, min_y, max_x, max_y, pixels))
                    
    print(f"{prefix} found {len(components)} components:")
    components.sort(key=lambda c: (c[1], c[0]))
    for idx, (x1, y1, x2, y2, p) in enumerate(components):
        # add margin
        mx1 = max(0, x1 - 10)
        my1 = max(0, y1 - 10)
        mx2 = min(w, x2 + 10)
        my2 = min(h, y2 + 10)
        cropped = img.crop((mx1, my1, mx2, my2))
        cropped.save(f"frontend/src/assets/Home/{prefix}_cloud_{idx+1}.png")
        print(f"  Cloud {idx+1}: pos=({x1},{y1})-({x2},{y2}), size=({mx2-mx1}x{my2-my1}), pixels={p}")

extract_connected_components('frontend/assets/Home/clouds.png', 'gold')
extract_connected_components('frontend/src/assets/Home/clouds_blue.png', 'blue')
