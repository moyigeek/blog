import os
import yaml
from datetime import datetime

# 定义图片目录和masonry.yml文件路径
image_dir = 'source/images'
masonry_file = 'source/_data/masonry.yml'

# 读取现有的masonry.yml内容
if os.path.exists(masonry_file):
    with open(masonry_file, 'r', encoding='utf-8') as file:
        masonry_data = yaml.safe_load(file)
else:
    masonry_data = []

# 遍历图片目录
for image_name in os.listdir(image_dir):
    if image_name == 'icon.jpg'or image_name == 'icon.ico'or image_name == 'icon.svg':
        continue
    image_path = os.path.join(image_dir, image_name)
    if os.path.isfile(image_path):
        # 获取图片的修改时间
        mod_time = os.path.getmtime(image_path)
        mod_date = datetime.fromtimestamp(mod_time).strftime('%Y-%m-%d')
        
        # 添加图片信息到masonry_data
        masonry_data.append({
            'image': f'/images/{image_name}',
            'title': os.path.splitext(image_name)[0],
            'description': mod_date
        })

# 将更新后的数据写回masonry.yml
with open(masonry_file, 'w', encoding='utf-8') as file:
    yaml.dump(masonry_data, file, allow_unicode=True, default_flow_style=False)

print("masonry.yml 更新完成")