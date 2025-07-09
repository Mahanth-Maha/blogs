CONTENT_DIR = "../content/"

import os
from sre_constants import SUCCESS
import requests
from bs4 import BeautifulSoup
import re 
                
def get_all_markdown_files(directory):
    """Recursively get all markdown files in the directory.
    
    Output:
        dict {
            markdown_file_name: markdown_file_path,
            ...
        }
    """
    markdown_files = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.md'):
                full_path = os.path.join(root, file)
                markdown_files[file] = full_path
    return markdown_files

def read_markdown_file(file_path):
    """Read the content of a markdown file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()
    
def extract_image_urls(markdown_content):
    """Extract image URLs from markdown content. which is in the form of ![alt text](image_url)"""
    pattern = r'!\[.*?\]\((.*?)\)'
    image_urls = []
    matches = re.findall(pattern, markdown_content)
    for match in matches:
        image_urls.append(match)
    return image_urls
    

def download_image_and_save_it_in_the_same_directory(image_url, markdown_file_path):
    """Download an image from a URL and save it to markdown file's directory."""
    # Get the directory of the markdown file
    directory = os.path.dirname(markdown_file_path)
    
    # Extract the image name from the URL
    image_name = os.path.basename(image_url)
    
    # Create the full path to save the image
    image_path = os.path.join(directory, image_name)

    if os.path.exists(image_path):
        print(f"[INFO] Image {image_name} already exists in {directory}. Skipping download.")
        return
    
    try:
        response = requests.get(image_url)
        response.raise_for_status()  # Raise an error for bad responses
        
        # Save the image
        with open(image_path, 'wb') as img_file:
            img_file.write(response.content)
        
        print(f'[INFO] Downloaded {image_url} and saved it as {image_path}')
    except Exception as e:
        print(f"Failed to download {image_url}: {e}")
       # Optionally, you could re-raise the exception or handle it further

def replace_image_urls_in_markdown(content, image_urls):
    """Replace image URLs in markdown content with local paths."""
    for img_url in image_urls:
        # Extract the image name from the URL
        image_name = os.path.basename(img_url)
        # Replace the URL with the local path
        content = content.replace(img_url, f"{image_name}")
    return content

def process_markdown_files(directory):
    
    markdown_files = get_all_markdown_files(directory)
    print(f'[INFO] Found {len(markdown_files)} markdown files in the directory: {directory}')
    for markdown_file, file_path in markdown_files.items():
        print(f"[INFO] Processing file: {markdown_file}")
        
        # Read the markdown file content
        content = read_markdown_file(file_path)
        
        # Extract image URLs from the content
        image_urls = extract_image_urls(content)
        if len(image_urls) == 0:
            print(f"[INFO] No image URLs found in {markdown_file}")
            continue
        print(f"[INFO] Found {len(image_urls)} image URLs in {markdown_file}") 
        print(f"[INFO] Image URLs: {image_urls}")

        # Download each image and save it in the same directory as the markdown file
        for image_url in image_urls:
            download_image_and_save_it_in_the_same_directory(image_url, file_path)

        # Replace image URLs in the content with local paths
        updated_content = replace_image_urls_in_markdown(content, image_urls)
        
        # Write the updated content back to the markdown file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(updated_content)
        
        print(f"[INFO] Processed file: {markdown_file}")
    
if __name__ == "__main__":
    process_markdown_files(CONTENT_DIR)
    