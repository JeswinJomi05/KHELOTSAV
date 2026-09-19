import base64
from PIL import Image
import io

with open('assets/CLOUDS.svg', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('base64,')
if idx != -1:
    end = content.find('"', idx)
    b64 = content[idx+7:end]
    data = base64.b64decode(b64)
    img = Image.open(io.BytesIO(data))
    print('CLOUDS.svg embedded image:', img.size, img.mode)
    arr = [p for p in img.getdata() if p[3] > 50]
    print('Sample non-transparent pixels:', arr[::len(arr)//5])
    img.save('frontend/src/assets/Home/clouds_blue.png')
    print('Saved clouds_blue.png successfully')
