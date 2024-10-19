from transformers import TextIteratorStreamer
import threading
import os
import re
import numpy as np
import torch
import torchvision.transforms as T
from PIL import Image
from torchvision.transforms.functional import InterpolationMode
from transformers import AutoModel, AutoTokenizer


IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def build_transform(input_size):
    MEAN, STD = IMAGENET_MEAN, IMAGENET_STD
    transform = T.Compose(
        [
            T.Lambda(lambda img: img.convert("RGB") if img.mode != "RGB" else img),
            T.Resize((input_size, input_size), interpolation=InterpolationMode.BICUBIC),
            T.ToTensor(),
            T.Normalize(mean=MEAN, std=STD),
        ]
    )
    return transform


def find_closest_aspect_ratio(aspect_ratio, target_ratios, width, height, image_size):
    best_ratio_diff = float("inf")
    best_ratio = (1, 1)
    area = width * height
    for ratio in target_ratios:
        target_aspect_ratio = ratio[0] / ratio[1]
        ratio_diff = abs(aspect_ratio - target_aspect_ratio)
        if ratio_diff < best_ratio_diff:
            best_ratio_diff = ratio_diff
            best_ratio = ratio
        elif ratio_diff == best_ratio_diff:
            if area > 0.5 * image_size * image_size * ratio[0] * ratio[1]:
                best_ratio = ratio
    return best_ratio


def dynamic_preprocess(
    image, min_num=1, max_num=12, image_size=448, use_thumbnail=False
):
    orig_width, orig_height = image.size
    aspect_ratio = orig_width / orig_height

    # calculate the existing image aspect ratio
    target_ratios = set(
        (i, j)
        for n in range(min_num, max_num + 1)
        for i in range(1, n + 1)
        for j in range(1, n + 1)
        if i * j <= max_num and i * j >= min_num
    )
    target_ratios = sorted(target_ratios, key=lambda x: x[0] * x[1])

    # find the closest aspect ratio to the target
    target_aspect_ratio = find_closest_aspect_ratio(
        aspect_ratio, target_ratios, orig_width, orig_height, image_size
    )

    # calculate the target width and height
    target_width = image_size * target_aspect_ratio[0]
    target_height = image_size * target_aspect_ratio[1]
    blocks = target_aspect_ratio[0] * target_aspect_ratio[1]

    # resize the image
    resized_img = image.resize((target_width, target_height))
    processed_images = []
    for i in range(blocks):
        box = (
            (i % (target_width // image_size)) * image_size,
            (i // (target_width // image_size)) * image_size,
            ((i % (target_width // image_size)) + 1) * image_size,
            ((i // (target_width // image_size)) + 1) * image_size,
        )
        # split the image
        split_img = resized_img.crop(box)
        processed_images.append(split_img)
    assert len(processed_images) == blocks
    if use_thumbnail and len(processed_images) != 1:
        thumbnail_img = image.resize((image_size, image_size))
        processed_images.append(thumbnail_img)
    return processed_images


def load_image(image_file, input_size=448, max_num=12):
    image = Image.open(image_file).convert("RGB")
    transform = build_transform(input_size=input_size)
    images = dynamic_preprocess(
        image, image_size=input_size, use_thumbnail=True, max_num=max_num
    )
    pixel_values = [transform(image) for image in images]
    pixel_values = torch.stack(pixel_values)
    return pixel_values


def preprocess_text(input_text):

    # Remove bullet points, numbers, and excess whitespace/new lines
    cleaned_text = re.sub(r"[\n\r]+", " ", input_text)  # Replace new lines with spaces
    cleaned_text = re.sub(
        r"(\s*\d+\.|\s*[*-]+)", "", cleaned_text
    )  # Remove numbers and bullet points
    cleaned_text = re.sub(r"\s+", " ", cleaned_text)  # Remove excess spaces

    # Output the cleaned, single-paragraph text
    return cleaned_text


def img_config_explanation(img_address):
    pixel_values = load_image(img_address, max_num=12).to(torch.bfloat16)
    question = """<image>\nYou are analyzing the network configuration of a company, please give detailed explanation of the company's network cofiguration."""

    # Initialize the streamer
    streamer = TextIteratorStreamer(
        tokenizer, skip_prompt=True, skip_special_tokens=True
    )

    # Define the generation configuration
    generation_config = dict(max_new_tokens=1024, do_sample=False, streamer=streamer)

    # Start the model chat in a separate thread
    result = None
    thread = threading.Thread(
        target=lambda: setattr(
            threading.current_thread(),
            "result",
            model.chat(
                tokenizer=tokenizer,
                pixel_values=pixel_values,
                question=question,
                history=None,
                return_history=None,
                generation_config=generation_config,
            ),
        )
    )
    thread.start()

    # Initialize an empty string to store the generated text
    generated_text = ""

    # Start iterating immediately and save to file

    for new_text in streamer:
        if new_text == model.conv_template.sep:
            break
        generated_text += new_text
        print(new_text, end="", flush=True)

    thread.join()
    cleaned_text = preprocess_text(generated_text)
    with open("img_net_conf_explanation.txt", "w", encoding="utf-8") as file:
        file.write(cleaned_text)
        print(
            f"\n\nGenerated text has been saved to {os.path.abspath('img_net_conf_explanation.txt')}"
        )


model = AutoModel.from_pretrained(
    path,
    torch_dtype=torch.bfloat16,
    load_in_4bit=True,
    low_cpu_mem_usage=True,
    use_flash_attn=True,
    trust_remote_code=True,
).eval()
tokenizer = AutoTokenizer.from_pretrained(path, trust_remote_code=True, use_fast=False)

img_config_explanation("./ns.png")
