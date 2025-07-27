from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import torch
from PIL import Image
import warnings

# Suppress warnings for a cleaner output
warnings.filterwarnings("ignore")

# --- Step 1: Load the Model and Components ---
# This code downloads and sets up the pre-trained AI model.
# It consists of an image processor, a language model (tokenizer), and the main model itself.
print("Loading model... This may take a moment.")
model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

# Use a GPU if available (much faster), otherwise use the CPU.
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
print(f"Model loaded successfully on device: {device}")


# --- Step 2: Define the Prediction Function ---
# This function takes a list of image file paths, processes them,
# and asks the model to generate a caption.
def predict_caption(image_paths):
    images = []
    for image_path in image_paths:
        try:
            # Open the image file
            i_image = Image.open(image_path)
            # Convert the image to RGB format if it isn't already
            if i_image.mode != "RGB":
                i_image = i_image.convert(mode="RGB")
            images.append(i_image)
        except FileNotFoundError:
            print(f"Error: The image at '{image_path}' was not found.")
            return []
        except Exception as e:
            print(f"Error processing image {image_path}: {e}")
            return []

    # Prepare the images for the model
    pixel_values = feature_extractor(images=images, return_tensors="pt").pixel_values
    pixel_values = pixel_values.to(device)

    # Generate the caption IDs using the model
    # 'max_length' is the longest the caption can be
    # 'num_beams' helps the model find better captions
    output_ids = model.generate(pixel_values, max_length=16, num_beams=4)

    # Convert the IDs back into human-readable text
    preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
    preds = [pred.strip() for pred in preds]
    return preds


# --- Step 3: Run an Example ---
# This part of the script will only run when you execute it directly.
if __name__ == '__main__':
    # IMPORTANT: Put an image in your 'ownai' folder and name it 'test_image.jpg'
    # Or, replace 'test_image.jpg' with the full path to any image on your computer.
    # Example for Windows: 'C:\\Users\\souma\\Pictures\\my_photo.jpg'
    image_to_test = 'test_image.jpg'

    # Call the function to get the caption
    captions = predict_caption([image_to_test])

    # Print the result
    if captions:
        print("\n--- Caption ---")
        print(captions[0])
        print("---------------")