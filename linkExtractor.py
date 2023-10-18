import subprocess
import re
import json

def extract_links_from_pdf(pdf_file_path):
    # Run the strings and grep commands and capture the output
    try:
        output = subprocess.check_output(["strings", pdf_file_path]).decode("utf-8")
        urls = re.findall(r'https?://[^\)]*', output)
        return urls
    except Exception as e:
        print("Error:", e)
        return []

def save_links_to_json(urls, json_file_path):
    with open(json_file_path, 'w') as json_file:
        json.dump(urls, json_file, indent=4)

if __name__ == '__main__':
    pdf_file_path = input("Enter the path to the PDF file: ")
    links = extract_links_from_pdf(pdf_file_path)

    if links:
        json_file_path = "./data/challenge_links.json"  # You can change the output file name if needed
        save_links_to_json(links, json_file_path)
        print(f"Links extracted and saved to {json_file_path}")
    else:
        print("No links found in the PDF file.")
