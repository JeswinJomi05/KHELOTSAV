from PIL import Image
import numpy as np

# Let's inspect the colors in gold_cloud_2.png
img = Image.open("frontend/src/assets/Home/gold_cloud_2.png")
arr = np.array(img)

# In the mockup:
# The body of the cloud is vibrant blue/cyan (#49c8eb -> rgb(73, 200, 235))
# The inner line work / accents are deep blue / navy (#1b2257) or gold (#f5c225)
# Let's see what happens if we replace the yellow/gold fill in gold_clouds with the mockup's cyan
for idx in range(1, 6):
    im = Image.open(f"frontend/src/assets/Home/gold_cloud_{idx}.png").convert("RGBA")
    data = np.array(im, dtype=float)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Where pixel is yellow/gold (r > 150, g > 120, b < 100)
    yellow_mask = (r > 140) & (g > 100) & (b < 120) & (a > 30)
    # Map yellow to cyan (73, 200, 235)
    # keep brightness variation
    brightness = (r[yellow_mask] + g[yellow_mask]) / (255.0 + 200.0)
    data[yellow_mask, 0] = 50 * brightness
    data[yellow_mask, 1] = 180 * brightness + 20
    data[yellow_mask, 2] = 235 * brightness
    
    out = Image.fromarray(np.uint8(data))
    out.save(f"frontend/src/assets/Home/cyan_cloud_{idx}.png")
    print(f"Saved cyan_cloud_{idx}.png")
